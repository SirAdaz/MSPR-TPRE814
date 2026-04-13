from datetime import datetime

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.models import SensorReading
from app.schemas.entities import SensorReadingOut

router = APIRouter()


@router.get("/readings", response_model=list[SensorReadingOut])
def list_readings(
    warehouse_id: int = Query(...),
    from_ts: datetime | None = Query(default=None, alias="from"),
    to_ts: datetime | None = Query(default=None, alias="to"),
    db: Session = Depends(get_db),
):
    query = db.query(SensorReading).filter(SensorReading.warehouse_id == warehouse_id)
    if from_ts is not None:
        query = query.filter(SensorReading.recorded_at >= from_ts)
    if to_ts is not None:
        query = query.filter(SensorReading.recorded_at <= to_ts)
    return query.order_by(SensorReading.recorded_at.asc()).all()
