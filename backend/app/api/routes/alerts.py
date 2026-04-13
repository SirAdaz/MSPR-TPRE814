from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_frontend_key
from app.models import Alert
from app.schemas.entities import AlertOut

router = APIRouter()


@router.get("/alerts", response_model=list[AlertOut])
def list_alerts(
    db: Session = Depends(get_db),
    _: None = Depends(require_frontend_key),
):
    return db.query(Alert).order_by(Alert.created_at.desc()).all()
