from contextlib import asynccontextmanager
import logging

from fastapi import FastAPI

from app.api.routes import alerts, exploitations, health, lots, readings, warehouses
from app.core.bootstrap import init_db
from app.core.config import settings
from app.core.demo_data import ensure_demo_data
from app.core.scheduler import scheduler
from app.services.mqtt_listener import start_mqtt_listener, stop_mqtt_listener

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)s [%(name)s] %(message)s",
)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(_: FastAPI):
    logger.info("backend_startup", extra={"country": settings.country_code})
    init_db()
    ensure_demo_data()
    if settings.enable_scheduler:
        scheduler.start()
        logger.info("scheduler_started", extra={"country": settings.country_code})
    if settings.enable_mqtt:
        start_mqtt_listener()
    yield
    if settings.enable_mqtt:
        stop_mqtt_listener()
    if settings.enable_scheduler:
        scheduler.shutdown(wait=False)
        logger.info("scheduler_stopped", extra={"country": settings.country_code})
    logger.info("backend_shutdown", extra={"country": settings.country_code})


app = FastAPI(
    title="FutureKawa Country Backend API",
    version="1.0.0",
    description=(
        "API REST pour la gestion des stocks, mesures IoT et alertes "
        "du backend pays FutureKawa."
    ),
    contact={"name": "FutureKawa SI", "email": "si@futurekawa.local"},
    docs_url="/docs",
    redoc_url="/redoc",
    openapi_url="/openapi.json",
    openapi_tags=[
        {"name": "health", "description": "Etat de sante du service"},
        {"name": "exploitations", "description": "Exploitations par pays"},
        {"name": "warehouses", "description": "Entrepots et seuils cibles"},
        {"name": "lots", "description": "Gestion et consultation des lots"},
        {"name": "readings", "description": "Historique des mesures IoT"},
        {"name": "alerts", "description": "Alertes qualite et expiration"},
    ],
    lifespan=lifespan,
)

app.include_router(health.router, prefix="/api/v1", tags=["health"])
app.include_router(exploitations.router, prefix="/api/v1", tags=["exploitations"])
app.include_router(warehouses.router, prefix="/api/v1", tags=["warehouses"])
app.include_router(lots.router, prefix="/api/v1", tags=["lots"])
app.include_router(readings.router, prefix="/api/v1", tags=["readings"])
app.include_router(alerts.router, prefix="/api/v1", tags=["alerts"])
