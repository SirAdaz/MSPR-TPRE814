from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_frontend_key
from app.models import Alert
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
    query = db.query(Alert)
    if warehouse_id is not None:
        query = query.filter(Alert.warehouse_id == warehouse_id)
    return query.order_by(Alert.created_at.desc()).offset(offset).limit(limit).all()
