import asyncio
import json
import threading

from aiomqtt import Client
from sqlalchemy.orm import Session

from app.core.config import settings
from app.core.db import SessionLocal
from app.models import SensorReading, Warehouse
from app.services.alerts import evaluate_reading

_loop: asyncio.AbstractEventLoop | None = None
_thread: threading.Thread | None = None


async def _consume() -> None:
    async with Client(settings.mqtt_host, settings.mqtt_port) as client:
        await client.subscribe(settings.mqtt_topic)
        async for message in client.messages:
            payload = json.loads(message.payload.decode())
            topic_parts = message.topic.value.split("/")
            if len(topic_parts) < 2:
                continue
            warehouse_id = int(topic_parts[1])
            temperature = float(payload["temperature"])
            humidity = float(payload["humidity"])

            db: Session = SessionLocal()
            try:
                reading = SensorReading(
                    warehouse_id=warehouse_id,
                    temperature=temperature,
                    humidity=humidity,
                )
                db.add(reading)
                db.commit()

                warehouse = db.query(Warehouse).filter(Warehouse.id == warehouse_id).first()
                if warehouse:
                    evaluate_reading(db, warehouse, temperature, humidity)
            finally:
                db.close()


def _run_loop() -> None:
    global _loop
    _loop = asyncio.new_event_loop()
    asyncio.set_event_loop(_loop)
    _loop.run_until_complete(_consume())


def start_mqtt_listener() -> None:
    global _thread
    if _thread and _thread.is_alive():
        return
    _thread = threading.Thread(target=_run_loop, daemon=True)
    _thread.start()


def stop_mqtt_listener() -> None:
    global _loop
    if _loop and _loop.is_running():
        _loop.call_soon_threadsafe(_loop.stop)
