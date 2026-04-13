from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.db import get_db
from app.core.security import require_frontend_key
from app.models import Lot
from app.schemas.entities import LotCreate, LotOut, LotUpdate

router = APIRouter()


@router.post("/lots", response_model=LotOut)
def create_lot(
    payload: LotCreate,
    db: Session = Depends(get_db),
    _: None = Depends(require_frontend_key),
):
    lot = Lot(**payload.model_dump())
    db.add(lot)
    db.commit()
    db.refresh(lot)
    return lot


@router.get("/lots", response_model=list[LotOut])
def list_lots(
    sort: str = Query("storage_date"),
    order: str = Query("asc"),
    db: Session = Depends(get_db),
    _: None = Depends(require_frontend_key),
):
    if sort != "storage_date":
        raise HTTPException(status_code=400, detail="Unsupported sort")
    query = db.query(Lot)
    query = query.order_by(Lot.storage_date.asc() if order == "asc" else Lot.storage_date.desc())
    return query.all()


@router.get("/lots/{lot_uid}", response_model=LotOut)
def get_lot(
    lot_uid: str,
    db: Session = Depends(get_db),
    _: None = Depends(require_frontend_key),
):
    lot = db.query(Lot).filter(Lot.lot_uid == lot_uid).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    return lot


@router.put("/lots/{lot_uid}", response_model=LotOut)
def update_lot(
    lot_uid: str,
    payload: LotUpdate,
    db: Session = Depends(get_db),
    _: None = Depends(require_frontend_key),
):
    lot = db.query(Lot).filter(Lot.lot_uid == lot_uid).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")

    data = payload.model_dump(exclude_unset=True)
    for field, value in data.items():
        setattr(lot, field, value)

    db.commit()
    db.refresh(lot)
    return lot


@router.delete("/lots/{lot_uid}")
def delete_lot(
    lot_uid: str,
    db: Session = Depends(get_db),
    _: None = Depends(require_frontend_key),
):
    lot = db.query(Lot).filter(Lot.lot_uid == lot_uid).first()
    if not lot:
        raise HTTPException(status_code=404, detail="Lot not found")
    db.delete(lot)
    db.commit()
    return {"deleted": True, "lot_uid": lot_uid}
