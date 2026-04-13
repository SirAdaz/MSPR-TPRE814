from datetime import date, datetime

from pydantic import BaseModel


class ExploitationOut(BaseModel):
    id: int
    name: str
    country: str

    class Config:
        from_attributes = True


class WarehouseOut(BaseModel):
    id: int
    exploitation_id: int
    name: str
    ideal_temp: float
    ideal_humidity: float
    temp_tolerance: float
    humidity_tolerance: float

    class Config:
        from_attributes = True


class LotCreate(BaseModel):
    lot_uid: str
    warehouse_id: int
    storage_date: date
    status: str = "conforme"


class LotUpdate(BaseModel):
    warehouse_id: int | None = None
    storage_date: date | None = None
    status: str | None = None


class LotOut(BaseModel):
    id: int
    lot_uid: str
    warehouse_id: int
    storage_date: date
    status: str

    class Config:
        from_attributes = True


class SensorReadingOut(BaseModel):
    id: int
    warehouse_id: int
    temperature: float
    humidity: float
    recorded_at: datetime

    class Config:
        from_attributes = True


class AlertOut(BaseModel):
    id: int
    warehouse_id: int
    lot_id: int | None
    alert_type: str
    message: str
    email_sent: bool
    created_at: datetime

    class Config:
        from_attributes = True
