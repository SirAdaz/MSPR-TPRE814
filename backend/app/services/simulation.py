from __future__ import annotations

import random
import logging
from datetime import date, timedelta

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Lot, SensorReading, Warehouse
from app.services.alerts import create_alert, evaluate_reading

logger = logging.getLogger(__name__)


def _lot_uid(prefix: str) -> str:
    suffix = random.randint(1000, 9999)
    day = date.today().strftime("%Y%m%d")
    return f"{prefix}-{day}-{suffix}"


def simulate_truck_movements(db: Session) -> int:
    warehouses = db.query(Warehouse).all()
    created_or_shipped = 0

    for warehouse in warehouses:
        action = random.choice(["arrival", "arrival", "departure"])
        if action == "arrival":
            lot = Lot(
                lot_uid=_lot_uid(f"{settings.country_code}-LOT"),
                warehouse_id=warehouse.id,
                storage_date=date.today(),
                planned_dispatch_date=date.today() + timedelta(days=30),
                status="conforme",
            )
            db.add(lot)
            db.flush()
            create_alert(
                db,
                warehouse_id=warehouse.id,
                lot_id=lot.id,
                alert_type="LOGISTICS_ARRIVAL",
                message=f"Truck arrival at {warehouse.name}: new lot {lot.lot_uid} added.",
            )
            created_or_shipped += 1
            continue

        oldest_lot = (
            db.query(Lot)
            .filter(Lot.warehouse_id == warehouse.id, Lot.status != "perime")
            .order_by(Lot.storage_date.asc())
            .first()
        )
        if not oldest_lot:
            continue
        lot_uid = oldest_lot.lot_uid
        lot_id = oldest_lot.id
        create_alert(
            db,
            warehouse_id=warehouse.id,
            lot_id=lot_id,
            alert_type="LOGISTICS_DEPARTURE",
            message=f"Truck departure from {warehouse.name}: lot {lot_uid} shipped.",
        )
        oldest_lot.actual_dispatch_date = date.today()
        oldest_lot.status = "expedie"
        db.flush()
        created_or_shipped += 1

    db.commit()
    logger.debug(
        "simulation_logistics_cycle",
        extra={"country": settings.country_code, "warehouses": len(warehouses), "events": created_or_shipped},
    )
    return created_or_shipped


def simulate_environment(db: Session) -> int:
    warehouses = db.query(Warehouse).all()
    generated = 0

    for warehouse in warehouses:
        # Baseline around the configured target.
        temperature = random.uniform(warehouse.ideal_temperature - 1.5, warehouse.ideal_temperature + 1.5)
        humidity = random.uniform(warehouse.ideal_humidity - 3.0, warehouse.ideal_humidity + 3.0)

        # Occasional anomaly to trigger auto-control.
        if random.random() < 0.25:
            temperature += random.uniform(
                warehouse.temperature_tolerance_high + 0.5,
                warehouse.temperature_tolerance_high + 3.0,
            )
        if random.random() < 0.20:
            humidity += random.uniform(
                warehouse.humidity_tolerance_high + 0.5,
                warehouse.humidity_tolerance_high + 6.0,
            )

        reading = SensorReading(
            warehouse_id=warehouse.id,
            temperature=round(temperature, 2),
            humidity=round(humidity, 2),
        )
        db.add(reading)
        db.flush()
        generated += 1

        evaluate_reading(db, warehouse, reading.temperature, reading.humidity)

        # Automatic corrective actions.
        if reading.temperature > warehouse.ideal_temperature + warehouse.temperature_tolerance_high:
            create_alert(
                db,
                warehouse_id=warehouse.id,
                alert_type="VENTILATION_ON",
                message=f"{warehouse.name}: ventilation activated to reduce temperature.",
            )
            corrected = SensorReading(
                warehouse_id=warehouse.id,
                temperature=round(
                    max(warehouse.ideal_temperature, reading.temperature - random.uniform(1.5, 3.5)),
                    2,
                ),
                humidity=round(reading.humidity, 2),
            )
            db.add(corrected)
            db.flush()
            generated += 1

        if reading.humidity > warehouse.ideal_humidity + warehouse.humidity_tolerance_high:
            create_alert(
                db,
                warehouse_id=warehouse.id,
                alert_type="DEHUMIDIFIER_ON",
                message=f"{warehouse.name}: dehumidification activated to reduce humidity.",
            )
            corrected = SensorReading(
                warehouse_id=warehouse.id,
                temperature=round(reading.temperature, 2),
                humidity=round(max(warehouse.ideal_humidity, reading.humidity - random.uniform(2.0, 5.0)), 2),
            )
            db.add(corrected)
            db.flush()
            generated += 1

    db.commit()
    logger.debug(
        "simulation_environment_cycle",
        extra={"country": settings.country_code, "warehouses": len(warehouses), "readings_generated": generated},
    )
    return generated
