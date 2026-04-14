import pytest
from fastapi import HTTPException

from app.core.security import require_frontend_key, require_sensor_key


def test_require_frontend_key_accepts_valid_value():
    assert require_frontend_key("front-dev-key") is None


def test_require_frontend_key_rejects_invalid_value():
    with pytest.raises(HTTPException) as exc:
        require_frontend_key("invalid")
    assert exc.value.status_code == 401


def test_require_sensor_key_accepts_valid_value():
    assert require_sensor_key("sensor-dev-key") is None


def test_require_sensor_key_rejects_invalid_value():
    with pytest.raises(HTTPException) as exc:
        require_sensor_key("invalid")
    assert exc.value.status_code == 401
