from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_frontend_key
from app.models import Warehouse
from app.schemas.entities import WarehouseCreate, WarehouseOut

router = APIRouter()


@router.get("/warehouses", response_model=list[WarehouseOut])
def list_warehouses(
    db: Session = Depends(get_db),
    _: None = Depends(require_frontend_key),
):
    return db.query(Warehouse).all()


@router.post("/warehouses", response_model=WarehouseOut)
def create_warehouse(
    payload: WarehouseCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_frontend_key),
):
    warehouse = Warehouse(**payload.model_dump())
    db.add(warehouse)
    db.commit()
    db.refresh(warehouse)
    return warehouse
