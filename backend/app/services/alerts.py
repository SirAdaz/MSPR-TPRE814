from datetime import datetime, timedelta
import smtplib
from email.message import EmailMessage

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models import Alert, Lot, Warehouse


def send_alert_email(subject: str, content: str) -> bool:
    msg = EmailMessage()
    msg["Subject"] = subject
    msg["From"] = "noreply@futurekawa.local"
    msg["To"] = settings.alert_email_to
    msg.set_content(content)
    try:
        with smtplib.SMTP(settings.smtp_host, settings.smtp_port, timeout=5) as smtp:
            smtp.send_message(msg)
        return True
    except Exception:
        return False


def create_alert(db: Session, warehouse_id: int, alert_type: str, message: str, lot_id: int | None = None) -> Alert:
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
    return alert


def evaluate_reading(db: Session, warehouse: Warehouse, temperature: float, humidity: float) -> Alert | None:
    out_of_temp = abs(temperature - warehouse.ideal_temp) > warehouse.temp_tolerance
    out_of_humidity = abs(humidity - warehouse.ideal_humidity) > warehouse.humidity_tolerance
    if not out_of_temp and not out_of_humidity:
        return None

    msg = (
        f"Warehouse {warehouse.name} ({settings.country_code}) out of range: "
        f"T={temperature}C, H={humidity}%"
    )
    return create_alert(db, warehouse.id, "CONDITIONS", msg)


def check_expired_lots(db: Session) -> int:
    threshold = datetime.utcnow().date() - timedelta(days=365)
    expired = db.query(Lot).filter(Lot.storage_date < threshold).all()
    created = 0
    for lot in expired:
        msg = f"Lot {lot.lot_uid} depasse 365 jours de stockage."
        create_alert(db, lot.warehouse_id, "EXPIRATION", msg, lot_id=lot.id)
        lot.status = "perime"
        created += 1
    db.commit()
    return created
