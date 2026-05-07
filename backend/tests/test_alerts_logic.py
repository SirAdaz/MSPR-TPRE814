from types import SimpleNamespace

from app.services import alerts as alerts_service
from app.services.alerts import evaluate_reading


class FakeDB:
    pass


def test_evaluate_reading_returns_none_when_in_range():
    warehouse = SimpleNamespace(
        id=1,
        name="W1",
        ideal_temp=29.0,
        ideal_humidity=55.0,
        temperature_tolerance=3.0,
        humidity_tolerance=2.0,
    )
    result = evaluate_reading(FakeDB(), warehouse, 29.5, 54.5)
    assert result is None


def test_evaluate_reading_creates_alert_when_out_of_range(monkeypatch):
    warehouse = SimpleNamespace(
        id=1,
        name="W1",
        ideal_temp=29.0,
        ideal_humidity=55.0,
        temperature_tolerance=3.0,
        humidity_tolerance=2.0,
    )
    monkeypatch.setattr(alerts_service, "create_alert", lambda *_args, **_kwargs: "ALERT")
    result = evaluate_reading(FakeDB(), warehouse, 40.0, 70.0)
    assert result == "ALERT"


def test_check_expired_lots_returns_zero_when_none():
    class FakeLotQuery:
        def filter(self, *_args, **_kwargs):
            return self

        def all(self):
            return []

    class FakeDbNoExpired:
        def __init__(self):
            self.commit_calls = 0

        def query(self, _model):
            return FakeLotQuery()

        def commit(self):
            self.commit_calls += 1

    db = FakeDbNoExpired()
    created = alerts_service.check_expired_lots(db)
    assert created == 0
    assert db.commit_calls == 1
