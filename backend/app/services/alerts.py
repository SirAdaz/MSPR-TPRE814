from datetime import datetime, timedelta
import logging
import smtplib
from email.message import EmailMessage

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Alert, Lot, Warehouse

logger = logging.getLogger(__name__)


def _get_alert_recipient() -> str:
    by_country = {
        "BR": settings.alert_email_br,
        "EC": settings.alert_email_ec,
        "CO": settings.alert_email_co,
    }
    return by_country.get(settings.country_code.upper(), settings.alert_email_to)


def send_alert_email(subject: str, content: str) -> bool:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = "noreply@futurekawa.local"
    recipient = _get_alert_recipient()
    msg["To"] = recipient
    msg.set_content(content)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=5) as smtp:
            smtp.send_message(msg)
        logger.info(
            "alert_email_sent",
            extra={"country": settings.country_code, "subject": subject, "recipient": recipient},
        )
        return True
    except Exception as exc:
        logger.warning(
            "alert_email_failed",
            extra={"country": settings.country_code, "subject": subject, "error": str(exc)},
        )
        return False


def _is_alert_in_cooldown(db: Session, warehouse_id: int, alert_type: str) -> bool:
    if not settings.enable_alert_cooldown or settings.alert_cooldown_seconds <= 0:
        return False

    threshold = datetime.utcnow() - timedelta(seconds=settings.alert_cooldown_seconds)
    latest_alert = (
        db.query(Alert)
        .filter(Alert.warehouse_id == warehouse_id, Alert.alert_type == alert_type)
        .order_by(Alert.created_at.desc())
        .first()
    )
    return latest_alert is not None and latest_alert.created_at >= threshold


def create_alert(db: Session, warehouse_id: int, alert_type: str, message: str, lot_id: int | None = None) -> Alert | None:
    if _is_alert_in_cooldown(db, warehouse_id, alert_type):
        logger.debug(
            "alert_suppressed_by_cooldown",
            extra={"country": settings.country_code, "warehouse_id": warehouse_id, "alert_type": alert_type},
        )
        return None

    email_sent = send_alert_email(f"FutureKawa alert: {alert_type}", message)
    alert = Alert(
        warehouse_id=warehouse_id,
        lot_id=lot_id,
        alert_type=alert_type,
        message=message,
        email_sent=email_sent,
    )
    db.add(alert)
    db.commit()
    db.refresh(alert)
    logger.info(
        "alert_created",
        extra={"country": settings.country_code, "warehouse_id": warehouse_id, "alert_type": alert_type, "lot_id": lot_id},
    )
    return alert


def evaluate_reading(db: Session, warehouse: Warehouse, temperature: float, humidity: float) -> Alert | None:
    out_of_temp = abs(temperature - warehouse.ideal_temp) > warehouse.temp_tolerance
    out_of_humidity = abs(humidity - warehouse.ideal_humidity) > warehouse.humidity_tolerance
    if not out_of_temp and not out_of_humidity:
        return None

    logger.warning(
        "reading_out_of_range",
        extra={
            "country": settings.country_code,
            "warehouse_id": warehouse.id,
            "temperature": temperature,
            "humidity": humidity,
        },
    )

    msg = (
        f"Warehouse {warehouse.name} ({settings.country_code}) out of range: "
        f"T={temperature}C, H={humidity}%"
    )
    return create_alert(db, warehouse.id, "CONDITIONS", msg)


def check_expired_lots(db: Session) -> int:
    threshold = datetime.utcnow().date() - timedelta(days=365)
    expired = db.query(Lot).filter(Lot.storage_date < threshold, Lot.actual_dispatch_date.is_(None)).all()
    created = 0
    for lot in expired:
        msg = f"Lot {lot.lot_uid} depasse 365 jours de stockage."
        create_alert(db, lot.warehouse_id, "EXPIRATION", msg, lot_id=lot.id)
        lot.status = "perime"
        created += 1
    db.commit()
    if created > 0:
        logger.warning("expired_lots_detected", extra={"country": settings.country_code, "count": created})
    else:
        logger.debug("expired_lots_check_ok", extra={"country": settings.country_code, "count": 0})
    return created
