from apscheduler.schedulers.background import BackgroundScheduler

from app.core.config import settings
from app.core.db import SessionLocal
from app.services.alerts import check_expired_lots
from app.services.simulation import simulate_environment, simulate_truck_movements

scheduler = BackgroundScheduler()


def _run_expiration_check() -> None:
    db = SessionLocal()
    try:
        check_expired_lots(db)
    finally:
        db.close()


def _run_environment_simulation() -> None:
    db = SessionLocal()
    try:
        simulate_environment(db)
    finally:
        db.close()


def _run_logistics_simulation() -> None:
    db = SessionLocal()
    try:
        simulate_truck_movements(db)
    finally:
        db.close()


scheduler.add_job(_run_expiration_check, "interval", minutes=15, id="lot-expiration-check")
if settings.enable_simulation:
    scheduler.add_job(
        _run_environment_simulation,
        "interval",
        seconds=settings.simulation_environment_interval_seconds,
        id="environment-simulation",
    )
    scheduler.add_job(
        _run_logistics_simulation,
        "interval",
        seconds=settings.simulation_logistics_interval_seconds,
        id="logistics-simulation",
    )
