from datetime import date, datetime, timedelta

from app.core.config import settings
from app.core.db import SessionLocal
from app.models import Alert, Exploitation, Lot, SensorReading, Warehouse


def ensure_demo_data() -> None:
    db = SessionLocal()
    try:
        has_lots = db.query(Lot.id).first() is not None
        if has_lots:
            return

        country = settings.country_code.upper()
        exploitation = Exploitation(
            name=f"FutureKawa {country} Exploitation",
            country=country,
        )
        db.add(exploitation)
        db.flush()

        warehouse_a = Warehouse(
            exploitation_id=exploitation.id,
            name=f"Warehouse {country}-A",
            ideal_temp=18.5,
            ideal_humidity=60.0,
            temp_tolerance=3.0,
            humidity_tolerance=5.0,
        )
        warehouse_b = Warehouse(
            exploitation_id=exploitation.id,
            name=f"Warehouse {country}-B",
            ideal_temp=19.0,
            ideal_humidity=58.0,
            temp_tolerance=3.0,
            humidity_tolerance=5.0,
        )
        db.add_all([warehouse_a, warehouse_b])
        db.flush()

        lots = [
            Lot(
                lot_uid=f"{country}-LOT-001",
                warehouse_id=warehouse_a.id,
                storage_date=date.today() - timedelta(days=45),
                status="conforme",
            ),
            Lot(
                lot_uid=f"{country}-LOT-002",
                warehouse_id=warehouse_a.id,
                storage_date=date.today() - timedelta(days=20),
                status="risque",
            ),
            Lot(
                lot_uid=f"{country}-LOT-003",
                warehouse_id=warehouse_b.id,
                storage_date=date.today() - timedelta(days=10),
                status="conforme",
            ),
            Lot(
                lot_uid=f"{country}-LOT-004",
                warehouse_id=warehouse_b.id,
                storage_date=date.today() - timedelta(days=70),
                status="alerte",
            ),
        ]
        db.add_all(lots)
        db.flush()

        now = datetime.utcnow()
        readings = [
            SensorReading(
                warehouse_id=warehouse_a.id,
                temperature=18.9,
                humidity=59.2,
                recorded_at=now - timedelta(hours=2),
            ),
            SensorReading(
                warehouse_id=warehouse_a.id,
                temperature=22.8,
                humidity=66.1,
                recorded_at=now - timedelta(hours=1),
            ),
            SensorReading(
                warehouse_id=warehouse_b.id,
                temperature=19.2,
                humidity=57.8,
                recorded_at=now - timedelta(hours=2),
            ),
            SensorReading(
                warehouse_id=warehouse_b.id,
                temperature=23.5,
                humidity=64.7,
                recorded_at=now - timedelta(minutes=50),
            ),
        ]
        db.add_all(readings)

        alerts = [
            Alert(
                warehouse_id=warehouse_a.id,
                lot_id=lots[1].id,
                alert_type="temperature_high",
                message=f"{country} lot {lots[1].lot_uid}: temperature above tolerance",
                email_sent=False,
                created_at=now - timedelta(minutes=45),
            ),
            Alert(
                warehouse_id=warehouse_b.id,
                lot_id=lots[3].id,
                alert_type="humidity_high",
                message=f"{country} lot {lots[3].lot_uid}: humidity above tolerance",
                email_sent=False,
                created_at=now - timedelta(minutes=20),
            ),
        ]
        db.add_all(alerts)
        db.commit()
    finally:
        db.close()
