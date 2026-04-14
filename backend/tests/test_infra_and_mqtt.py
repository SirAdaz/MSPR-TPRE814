import asyncio
import json
from types import SimpleNamespace

import pytest
from sqlalchemy.exc import OperationalError

from app.core import bootstrap, db as db_module, scheduler as scheduler_module
from app.main import lifespan
from app.services import mqtt_listener


def test_get_db_closes_session(monkeypatch):
    closed = {"value": False}

    class FakeSession:
        def close(self):
            closed["value"] = True

    monkeypatch.setattr(db_module, "SessionLocal", lambda: FakeSession())
    generator = db_module.get_db()
    _ = next(generator)
    with pytest.raises(StopIteration):
        next(generator)
    assert closed["value"] is True


def test_init_db_retries_then_succeeds(monkeypatch):
    calls = {"count": 0}

    def flaky_create_all(*_args, **_kwargs):
        calls["count"] += 1
        if calls["count"] < 3:
            raise OperationalError("stmt", {}, Exception("db down"))

    monkeypatch.setattr(bootstrap.Base.metadata, "create_all", flaky_create_all)
    monkeypatch.setattr(bootstrap.time, "sleep", lambda _seconds: None)
    bootstrap.init_db()
    assert calls["count"] == 3


def test_init_db_raises_last_error_after_retries(monkeypatch):
    def always_fail(*_args, **_kwargs):
        raise OperationalError("stmt", {}, Exception("db down"))

    monkeypatch.setattr(bootstrap.Base.metadata, "create_all", always_fail)
    monkeypatch.setattr(bootstrap.time, "sleep", lambda _seconds: None)
    with pytest.raises(OperationalError):
        bootstrap.init_db()


def test_scheduler_job_runs_and_closes_session(monkeypatch):
    called = {"checked": False, "closed": False}

    class FakeDB:
        def close(self):
            called["closed"] = True

    def fake_check_expired_lots(db):
        assert isinstance(db, FakeDB)
        called["checked"] = True

    monkeypatch.setattr(scheduler_module, "SessionLocal", lambda: FakeDB())
    monkeypatch.setattr(scheduler_module, "check_expired_lots", fake_check_expired_lots)
    scheduler_module._run_expiration_check()
    assert called["checked"] is True
    assert called["closed"] is True


def test_lifespan_with_all_features_enabled(monkeypatch):
    calls = []
    monkeypatch.setattr("app.main.init_db", lambda: calls.append("init"))
    monkeypatch.setattr("app.main.start_mqtt_listener", lambda: calls.append("mqtt_start"))
    monkeypatch.setattr("app.main.stop_mqtt_listener", lambda: calls.append("mqtt_stop"))
    monkeypatch.setattr("app.main.scheduler.start", lambda: calls.append("scheduler_start"))
    monkeypatch.setattr("app.main.scheduler.shutdown", lambda wait=False: calls.append(f"scheduler_stop_{wait}"))
    monkeypatch.setattr("app.main.settings.enable_scheduler", True)
    monkeypatch.setattr("app.main.settings.enable_mqtt", True)

    async def _runner():
        async with lifespan(SimpleNamespace()):
            assert calls == ["init", "scheduler_start", "mqtt_start"]

    asyncio.run(_runner())
    assert calls == ["init", "scheduler_start", "mqtt_start", "mqtt_stop", "scheduler_stop_False"]


def test_lifespan_with_features_disabled(monkeypatch):
    calls = []
    monkeypatch.setattr("app.main.init_db", lambda: calls.append("init"))
    monkeypatch.setattr("app.main.start_mqtt_listener", lambda: calls.append("mqtt_start"))
    monkeypatch.setattr("app.main.stop_mqtt_listener", lambda: calls.append("mqtt_stop"))
    monkeypatch.setattr("app.main.scheduler.start", lambda: calls.append("scheduler_start"))
    monkeypatch.setattr("app.main.scheduler.shutdown", lambda wait=False: calls.append(f"scheduler_stop_{wait}"))
    monkeypatch.setattr("app.main.settings.enable_scheduler", False)
    monkeypatch.setattr("app.main.settings.enable_mqtt", False)

    async def _runner():
        async with lifespan(SimpleNamespace()):
            assert calls == ["init"]

    asyncio.run(_runner())
    assert calls == ["init"]


def test_start_mqtt_listener_does_nothing_if_thread_alive():
    class AliveThread:
        def is_alive(self):
            return True

    mqtt_listener._thread = AliveThread()
    previous = mqtt_listener._thread
    mqtt_listener.start_mqtt_listener()
    assert mqtt_listener._thread is previous


def test_start_mqtt_listener_starts_new_thread(monkeypatch):
    started = {"value": False}

    class FakeThread:
        def __init__(self, target, daemon):
            self.target = target
            self.daemon = daemon

        def is_alive(self):
            return False

        def start(self):
            started["value"] = True

    mqtt_listener._thread = None
    monkeypatch.setattr(mqtt_listener.threading, "Thread", FakeThread)
    mqtt_listener.start_mqtt_listener()
    assert started["value"] is True
    assert mqtt_listener._thread is not None


def test_stop_mqtt_listener_stops_running_loop():
    called = {"stopped": False}

    class FakeLoop:
        def is_running(self):
            return True

        def stop(self):
            called["stopped"] = True

        def call_soon_threadsafe(self, callback):
            callback()

    mqtt_listener._loop = FakeLoop()
    mqtt_listener.stop_mqtt_listener()
    assert called["stopped"] is True


def test_run_loop_creates_event_loop(monkeypatch):
    called = {"consume": False}

    class FakeLoop:
        def run_until_complete(self, coro):
            asyncio.run(coro)

    async def fake_consume():
        called["consume"] = True

    monkeypatch.setattr(mqtt_listener.asyncio, "new_event_loop", lambda: FakeLoop())
    monkeypatch.setattr(mqtt_listener.asyncio, "set_event_loop", lambda _loop: None)
    monkeypatch.setattr(mqtt_listener, "_consume", fake_consume)
    mqtt_listener._run_loop()
    assert called["consume"] is True


def test_consume_processes_messages(monkeypatch):
    evaluated = {"count": 0}

    class FakeDBQuery:
        def __init__(self, warehouse):
            self._warehouse = warehouse

        def filter(self, *_args, **_kwargs):
            return self

        def first(self):
            return self._warehouse

    class FakeDB:
        def __init__(self):
            self._warehouse = SimpleNamespace(id=1, name="W1")
            self.added = []
            self.closed = False

        def add(self, obj):
            self.added.append(obj)

        def commit(self):
            return None

        def query(self, _model):
            return FakeDBQuery(self._warehouse)

        def close(self):
            self.closed = True

    fake_db = FakeDB()
    monkeypatch.setattr(mqtt_listener, "SessionLocal", lambda: fake_db)
    monkeypatch.setattr(mqtt_listener, "evaluate_reading", lambda *_args, **_kwargs: evaluated.__setitem__("count", 1))

    class FakeTopic:
        def __init__(self, value):
            self.value = value

    class FakeMessage:
        def __init__(self, payload, topic):
            self.payload = payload
            self.topic = FakeTopic(topic)

    messages = [
        FakeMessage(json.dumps({"temperature": 29.2, "humidity": 54.8}).encode(), "warehouse/1/sensors"),
        FakeMessage(json.dumps({"temperature": 25, "humidity": 40}).encode(), "invalid"),
    ]

    class FakeClientContext:
        def __init__(self, *_args, **_kwargs):
            self.messages = self._iter_messages()

        async def __aenter__(self):
            return self

        async def __aexit__(self, *_args):
            return None

        async def subscribe(self, _topic):
            return None

        async def _iter_messages(self):
            for message in messages:
                yield message

    monkeypatch.setattr(mqtt_listener, "Client", FakeClientContext)
    asyncio.run(mqtt_listener._consume())

    assert len(fake_db.added) == 1
    assert fake_db.closed is True
    assert evaluated["count"] == 1
