from app.core.db import Base, engine
from app.models import Alert, Exploitation, Lot, SensorReading, Warehouse


def init_db() -> None:
    _ = (Alert, Exploitation, Lot, SensorReading, Warehouse)
    Base.metadata.create_all(bind=engine)
