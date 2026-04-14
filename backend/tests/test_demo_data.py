from datetime import date

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from app.core.db import Base
from app.core.demo_data import ensure_demo_data
from app.models import Alert, Exploitation, Lot, SensorReading, Warehouse


def test_ensure_demo_data_populates_empty_database(monkeypatch, tmp_path):
    db_file = tmp_path / "demo.db"
    engine = create_engine(f"sqlite:///{db_file}", connect_args={"check_same_thread": False})
    session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    monkeypatch.setattr("app.core.demo_data.SessionLocal", session_local)
    monkeypatch.setattr("app.core.demo_data.settings.country_code", "EC")

    ensure_demo_data()

    db = session_local()
    try:
        assert db.query(Exploitation).count() == 1
        assert db.query(Warehouse).count() == 2
        assert db.query(Lot).count() == 4
        assert db.query(SensorReading).count() == 4
        assert db.query(Alert).count() == 2
        assert db.query(Exploitation).first().country == "EC"
        assert all(lot.lot_uid.startswith("EC-LOT-") for lot in db.query(Lot).all())
    finally:
        db.close()


def test_ensure_demo_data_is_noop_when_lots_exist(monkeypatch, tmp_path):
    db_file = tmp_path / "demo-existing.db"
    engine = create_engine(f"sqlite:///{db_file}", connect_args={"check_same_thread": False})
    session_local = sessionmaker(bind=engine, autoflush=False, autocommit=False)
    Base.metadata.create_all(bind=engine)

    db = session_local()
    exploitation = Exploitation(name="Existing Exploitation", country="BR")
    db.add(exploitation)
    db.flush()
    warehouse = Warehouse(
        exploitation_id=exploitation.id,
        name="Existing Warehouse",
        ideal_temp=20.0,
        ideal_humidity=60.0,
        temp_tolerance=2.0,
        humidity_tolerance=2.0,
    )
    db.add(warehouse)
    db.flush()
    db.add(
        Lot(
            lot_uid="EXISTING-LOT-001",
            warehouse_id=warehouse.id,
            storage_date=date(2025, 1, 1),
            status="conforme",
        )
    )
    db.commit()
    db.close()

    monkeypatch.setattr("app.core.demo_data.SessionLocal", session_local)
    monkeypatch.setattr("app.core.demo_data.settings.country_code", "CO")

    ensure_demo_data()

    db = session_local()
    try:
        assert db.query(Exploitation).count() == 1
        assert db.query(Warehouse).count() == 1
        assert db.query(Lot).count() == 1
        assert db.query(SensorReading).count() == 0
        assert db.query(Alert).count() == 0
        assert db.query(Lot).first().lot_uid == "EXISTING-LOT-001"
    finally:
        db.close()
