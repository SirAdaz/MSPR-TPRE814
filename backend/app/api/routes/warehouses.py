from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_frontend_key
from app.models import Warehouse
from app.schemas.entities import WarehouseOut

router = APIRouter()


@router.get("/warehouses", response_model=list[WarehouseOut])
def list_warehouses(
    db: Session = Depends(get_db),
    _: None = Depends(require_frontend_key),
):
    return db.query(Warehouse).all()
