from types import SimpleNamespace

from app.core import scheduler as scheduler_module
from app.services import simulation as simulation_service


class FakeQuery:
    def __init__(self, all_items=None, first_item=None):
        self._all_items = all_items or []
        self._first_item = first_item

    def all(self):
        return self._all_items

    def filter(self, *_args, **_kwargs):
        return self

    def order_by(self, *_args, **_kwargs):
        return self

    def first(self):
        return self._first_item


class FakeDB:
    def __init__(self, warehouses=None, oldest_lot=None):
        self.warehouses = warehouses or []
        self.oldest_lot = oldest_lot
        self.added = []
        self.deleted = []
        self.flush_count = 0
        self.commit_count = 0
        self.closed = False
        self._id_seq = 100

    def query(self, model):
        if model is simulation_service.Warehouse:
            return FakeQuery(all_items=self.warehouses)
        if model is simulation_service.Lot:
            return FakeQuery(first_item=self.oldest_lot)
        raise AssertionError(f"Unexpected model query: {model}")

    def add(self, obj):
        if getattr(obj, "id", None) is None:
            obj.id = self._id_seq
            self._id_seq += 1
        self.added.append(obj)

    def flush(self):
        self.flush_count += 1

    def delete(self, obj):
        self.deleted.append(obj)

    def commit(self):
        self.commit_count += 1

    def close(self):
        self.closed = True


def test_simulate_truck_movements_arrival(monkeypatch):
    warehouse = SimpleNamespace(id=1, name="W1")
    db = FakeDB(warehouses=[warehouse])
    created_alerts = []

    monkeypatch.setattr(simulation_service.random, "choice", lambda _items: "arrival")
    monkeypatch.setattr(
        simulation_service,
        "create_alert",
        lambda *_args, **kwargs: created_alerts.append(kwargs["alert_type"]),
    )

    events = simulation_service.simulate_truck_movements(db)

    assert events == 1
    assert db.commit_count == 1
    assert len(db.added) == 1
    assert created_alerts == ["LOGISTICS_ARRIVAL"]


def test_simulate_truck_movements_departure(monkeypatch):
    warehouse = SimpleNamespace(id=1, name="W1")
    oldest_lot = SimpleNamespace(
        id=7,
        lot_uid="BR-LOT-OLD",
        warehouse_id=1,
        status="conforme",
        storage_date="2026-01-01",
        actual_dispatch_date=None,
    )
    db = FakeDB(warehouses=[warehouse], oldest_lot=oldest_lot)
    created_alerts = []

    monkeypatch.setattr(simulation_service.random, "choice", lambda _items: "departure")
    monkeypatch.setattr(
        simulation_service,
        "create_alert",
        lambda *_args, **kwargs: created_alerts.append(kwargs["alert_type"]),
    )

    events = simulation_service.simulate_truck_movements(db)

    assert events == 1
    assert db.deleted == []
    assert oldest_lot.status == "expedie"
    assert oldest_lot.actual_dispatch_date is not None
    assert created_alerts == ["LOGISTICS_DEPARTURE"]
    assert db.commit_count == 1


def test_simulate_truck_movements_departure_without_lot(monkeypatch):
    warehouse = SimpleNamespace(id=1, name="W1")
    db = FakeDB(warehouses=[warehouse], oldest_lot=None)
    created_alerts = []

    monkeypatch.setattr(simulation_service.random, "choice", lambda _items: "departure")
    monkeypatch.setattr(
        simulation_service,
        "create_alert",
        lambda *_args, **kwargs: created_alerts.append(kwargs["alert_type"]),
    )

    events = simulation_service.simulate_truck_movements(db)

    assert events == 0
    assert db.deleted == []
    assert created_alerts == []
    assert db.commit_count == 1


def test_simulate_environment_with_corrective_actions(monkeypatch):
    warehouse = SimpleNamespace(
        id=1,
        name="W1",
        ideal_temp=20.0,
        ideal_humidity=50.0,
        temperature_tolerance=1.0,
        humidity_tolerance=1.0,
    )
    db = FakeDB(warehouses=[warehouse])
    created_alerts = []
    evaluate_calls = {"count": 0}

    random_values = iter([0.1, 0.1])
    uniform_values = iter([20.0, 50.0, 3.0, 4.0, 2.0, 3.0])

    monkeypatch.setattr(simulation_service.random, "random", lambda: next(random_values))
    monkeypatch.setattr(simulation_service.random, "uniform", lambda _a, _b: next(uniform_values))
    monkeypatch.setattr(
        simulation_service,
        "create_alert",
        lambda *_args, **kwargs: created_alerts.append(kwargs["alert_type"]),
    )
    monkeypatch.setattr(
        simulation_service,
        "evaluate_reading",
        lambda *_args, **_kwargs: evaluate_calls.__setitem__("count", evaluate_calls["count"] + 1),
    )

    generated = simulation_service.simulate_environment(db)

    assert generated == 3
    assert evaluate_calls["count"] == 1
    assert created_alerts == ["VENTILATION_ON", "DEHUMIDIFIER_ON"]
    assert db.commit_count == 1


def test_scheduler_environment_and_logistics_jobs(monkeypatch):
    calls = {"environment": 0, "logistics": 0}

    class LocalFakeDB(FakeDB):
        def __init__(self):
            super().__init__()

    monkeypatch.setattr(scheduler_module, "SessionLocal", LocalFakeDB)
    monkeypatch.setattr(
        scheduler_module,
        "simulate_environment",
        lambda db: calls.__setitem__("environment", calls["environment"] + 1) or 2,
    )
    monkeypatch.setattr(
        scheduler_module,
        "simulate_truck_movements",
        lambda db: calls.__setitem__("logistics", calls["logistics"] + 1) or 1,
    )

    scheduler_module._run_environment_simulation()
    scheduler_module._run_logistics_simulation()

    assert calls["environment"] == 1
    assert calls["logistics"] == 1
