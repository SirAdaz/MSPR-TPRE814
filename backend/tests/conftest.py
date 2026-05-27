from datetime import date, datetime

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.db import Base, get_db
from app.main import app
from app.models import AlertLot, Country, Exploitation, Lot, SensorReading, Warehouse


@pytest.fixture()
def client(monkeypatch, tmp_path):
    db_file = tmp_path / "test.db"
    engine = create_engine(f"sqlite:///{db_file}", connect_args={"check_same_thread": False})
    testing_session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    def _get_db():
        db = testing_session_local()
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = _get_db
    monkeypatch.setattr("app.main.init_db", lambda: None)

    db = testing_session_local()
    country = Country(code="BRA", name="Bresil")
    db.add(country)
    db.flush()

    exploitation = Exploitation(name="Exploit BR", country_id=country.id)
    db.add(exploitation)
    db.flush()

    warehouse = Warehouse(
        exploitation_id=exploitation.id,
        name="W1",
        ideal_temperature=29.0,
        ideal_humidity=55.0,
        temperature_tolerance_low=3.0,
        temperature_tolerance_high=3.0,
        humidity_tolerance_low=2.0,
        humidity_tolerance_high=2.0,
    )
    db.add(warehouse)
    db.flush()

    lot = Lot(
        lot_uid="LOT-001",
        warehouse_id=warehouse.id,
        storage_date=date(2024, 1, 1),
        planned_dispatch_date=date(2024, 2, 1),
        status="conforme",
    )
    db.add(lot)
    db.flush()

    reading = SensorReading(
        warehouse_id=warehouse.id,
        temperature=28.5,
        humidity=54.0,
        recorded_at=datetime(2026, 1, 1, 10, 0, 0),
    )
    db.add(reading)

    alert = AlertLot(
        lot_id=lot.id,
        alert_type="EXPIRATION",
        message="expired",
        email_sent=False,
        created_at=datetime(2026, 1, 1, 11, 0, 0),
    )
    db.add(alert)
    db.commit()
    db.close()

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
