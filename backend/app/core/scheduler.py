from apscheduler.schedulers.background import BackgroundScheduler

from app.core.db import SessionLocal
from app.services.alerts import check_expired_lots

scheduler = BackgroundScheduler()


def _run_expiration_check() -> None:
    db = SessionLocal()
    try:
        check_expired_lots(db)
    finally:
        db.close()


scheduler.add_job(_run_expiration_check, "interval", minutes=15, id="lot-expiration-check")
