from datetime import date, datetime

from sqlalchemy import Boolean, Date, DateTime, Float, ForeignKey, Integer, String
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.db import Base


class Country(Base):
    __tablename__ = "countries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    code: Mapped[str] = mapped_column(String(3), unique=True, nullable=False)
    name: Mapped[str] = mapped_column(String(128), nullable=False)

    exploitations: Mapped[list["Exploitation"]] = relationship(back_populates="country")


class Exploitation(Base):
    __tablename__ = "exploitations"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    country_id: Mapped[int] = mapped_column(ForeignKey("countries.id"), nullable=False)

    country: Mapped[Country] = relationship(back_populates="exploitations")
    warehouses: Mapped[list["Warehouse"]] = relationship(back_populates="exploitation")


class Warehouse(Base):
    __tablename__ = "warehouses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    exploitation_id: Mapped[int] = mapped_column(ForeignKey("exploitations.id"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    ideal_temperature: Mapped[float] = mapped_column(Float, nullable=False)
    ideal_humidity: Mapped[float] = mapped_column(Float, nullable=False)
    temperature_tolerance: Mapped[float] = mapped_column(Float, default=3.0)
    humidity_tolerance: Mapped[float] = mapped_column(Float, default=2.0)

    exploitation: Mapped[Exploitation] = relationship(back_populates="warehouses")


class Lot(Base):
    __tablename__ = "lots"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    lot_uid: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"), nullable=False)
    storage_date: Mapped[date] = mapped_column(Date, nullable=False)
    planned_dispatch_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    actual_dispatch_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    status: Mapped[str] = mapped_column(String(32), default="conforme")


class SensorReading(Base):
    __tablename__ = "sensor_readings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"), nullable=False)
    temperature: Mapped[float] = mapped_column(Float, nullable=False)
    humidity: Mapped[float] = mapped_column(Float, nullable=False)
    recorded_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)


class Alert(Base):
    __tablename__ = "alerts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    warehouse_id: Mapped[int] = mapped_column(ForeignKey("warehouses.id"), nullable=False)
    lot_id: Mapped[int | None] = mapped_column(ForeignKey("lots.id"), nullable=True)
    alert_type: Mapped[str] = mapped_column(String(64), nullable=False)
    message: Mapped[str] = mapped_column(String(1024), nullable=False)
    email_sent: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime, default=datetime.utcnow)
