from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_frontend_key
from app.models import AlertCapteur, AlertLot
from app.schemas.entities import AlertOut

router = APIRouter()


@router.get("/alerts", response_model=list[AlertOut])
def list_alerts(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    warehouse_id: int | None = Query(default=None),
    db: Session = Depends(get_db),
    _: None = Depends(require_frontend_key),
):
    sensor_query = db.query(AlertCapteur)
    if warehouse_id is not None:
        sensor_query = sensor_query.filter(AlertCapteur.warehouse_id == warehouse_id)
    sensor_alerts = sensor_query.order_by(AlertCapteur.created_at.desc()).offset(offset).limit(limit).all()

    # Lot alerts do not carry warehouse_id in the MCD. For API convenience we still support listing them.
    lot_query = db.query(AlertLot)
    lot_alerts = lot_query.order_by(AlertLot.created_at.desc()).offset(offset).limit(limit).all()

    merged: list[AlertOut] = []
    for a in sensor_alerts:
        merged.append(
            AlertOut(
                id=a.id,
                warehouse_id=a.warehouse_id,
                lot_id=None,
                alert_type=a.alert_type,
                message=a.message,
                email_sent=a.email_sent,
                created_at=a.created_at,
            )
        )
    for a in lot_alerts:
        merged.append(
            AlertOut(
                id=a.id,
                warehouse_id=None,
                lot_id=a.lot_id,
                alert_type=a.alert_type,
                message=a.message,
                email_sent=a.email_sent,
                created_at=a.created_at,
            )
        )

    merged.sort(key=lambda x: x.created_at, reverse=True)
    return merged[offset : offset + limit]
