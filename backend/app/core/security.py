from fastapi import Header, HTTPException, status

from app.core.config import settings


def require_frontend_key(x_frontend_key: str = Header(default="")) -> None:
    if x_frontend_key != settings.frontend_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid frontend key",
        )


def require_sensor_key(x_sensor_key: str = Header(default="")) -> None:
    if x_sensor_key != settings.sensor_api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid sensor key",
        )
