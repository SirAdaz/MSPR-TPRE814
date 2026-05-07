from datetime import date, datetime

from pydantic import BaseModel, Field


class ExploitationOut(BaseModel):
    id: int
    name: str
    country_id: int

    class Config:
        from_attributes = True


class WarehouseOut(BaseModel):
    id: int
    exploitation_id: int
    name: str
    ideal_temp: float
    ideal_humidity: float
    temperature_tolerance: float
    humidity_tolerance: float

    class Config:
        from_attributes = True


class CountryOut(BaseModel):
    id: int
    code: str
    name: str

    class Config:
        from_attributes = True


class WarehouseCreate(BaseModel):
    exploitation_id: int = Field(gt=0)
    name: str = Field(min_length=1, max_length=255)
    ideal_temp: float = Field(ge=-30, le=60)
    ideal_humidity: float = Field(ge=0, le=100)
    temperature_tolerance: float = Field(default=3.0, ge=0, le=20)
    humidity_tolerance: float = Field(default=2.0, ge=0, le=100)


class LotCreate(BaseModel):
    lot_uid: str = Field(min_length=1, max_length=255)
    warehouse_id: int = Field(gt=0)
    storage_date: date
    planned_dispatch_date: date | None = None
    status: str = "conforme"


class LotUpdate(BaseModel):
    warehouse_id: int | None = Field(default=None, gt=0)
    storage_date: date | None = None
    planned_dispatch_date: date | None = None
    actual_dispatch_date: date | None = None
    status: str | None = None


class LotOut(BaseModel):
    id: int
    lot_uid: str
    warehouse_id: int
    storage_date: date
    planned_dispatch_date: date | None
    actual_dispatch_date: date | None
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


class SensorReadingCreate(BaseModel):
    warehouse_id: int = Field(gt=0)
    temperature: float = Field(ge=-30, le=60)
    humidity: float = Field(ge=0, le=100)


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
