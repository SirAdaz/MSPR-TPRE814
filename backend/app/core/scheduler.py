from apscheduler.schedulers.background import BackgroundScheduler
import logging

from app.core.config import settings
from app.core.db import SessionLocal
from app.services.alerts import check_expired_lots
from app.services.simulation import simulate_environment, simulate_truck_movements

scheduler = BackgroundScheduler()
logger = logging.getLogger(__name__)


def _run_expiration_check() -> None:
    db = SessionLocal()
    try:
        created = check_expired_lots(db)
        logger.info("scheduler_expiration_done", extra={"country": settings.country_code, "alerts_created": created})
    finally:
        db.close()


def _run_environment_simulation() -> None:
    db = SessionLocal()
    try:
        generated = simulate_environment(db)
        logger.info("scheduler_environment_done", extra={"country": settings.country_code, "readings_generated": generated})
    finally:
        db.close()


def _run_logistics_simulation() -> None:
    db = SessionLocal()
    try:
        events = simulate_truck_movements(db)
        logger.info("scheduler_logistics_done", extra={"country": settings.country_code, "events": events})
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

logger.info(
    "scheduler_configured",
    extra={
        "country": settings.country_code,
        "enable_simulation": settings.enable_simulation,
        "environment_interval_s": settings.simulation_environment_interval_seconds,
        "logistics_interval_s": settings.simulation_logistics_interval_seconds,
    },
)
