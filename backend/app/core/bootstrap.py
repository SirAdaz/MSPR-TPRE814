import time

from sqlalchemy.exc import OperationalError

from app.core.db import Base, engine
from app.models import Alert, Exploitation, Lot, SensorReading, Warehouse


def init_db() -> None:
    _ = (Alert, Exploitation, Lot, SensorReading, Warehouse)
    retries = 20
    delay_seconds = 1
    last_error: Exception | None = None

    for _ in range(retries):
        try:
            Base.metadata.create_all(bind=engine)
            return
        except OperationalError as exc:
            last_error = exc
            time.sleep(delay_seconds)

    if last_error is not None:
        raise last_error
