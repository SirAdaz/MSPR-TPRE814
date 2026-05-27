from datetime import datetime


FRONTEND_HEADERS = {"X-Frontend-Key": "front-dev-key"}
SENSOR_HEADERS = {"X-Sensor-Key": "sensor-dev-key"}


def test_exploitations_requires_auth(client):
    response = client.get("/api/v1/exploitations")
    assert response.status_code == 401


def test_exploitations_list(client):
    response = client.get("/api/v1/exploitations", headers=FRONTEND_HEADERS)
    assert response.status_code == 200
    assert len(response.json()) == 1


def test_warehouses_list(client):
    response = client.get("/api/v1/warehouses", headers=FRONTEND_HEADERS)
    assert response.status_code == 200
    assert response.json()[0]["name"] == "W1"


def test_warehouses_create(client):
    payload = {
        "exploitation_id": 1,
        "name": "W2",
        "ideal_temperature": 25.0,
        "ideal_humidity": 58.0,
        "temperature_tolerance_low": 2.0,
        "temperature_tolerance_high": 2.0,
        "humidity_tolerance_low": 3.0,
        "humidity_tolerance_high": 3.0,
    }
    response = client.post("/api/v1/warehouses", headers=FRONTEND_HEADERS, json=payload)
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "W2"
    assert body["exploitation_id"] == 1


def test_warehouses_create_rejects_invalid_humidity(client):
    payload = {
        "exploitation_id": 1,
        "name": "W-invalid",
        "ideal_temperature": 25.0,
        "ideal_humidity": 120.0,
        "temperature_tolerance_low": 2.0,
        "temperature_tolerance_high": 2.0,
        "humidity_tolerance_low": 3.0,
        "humidity_tolerance_high": 3.0,
    }
    response = client.post("/api/v1/warehouses", headers=FRONTEND_HEADERS, json=payload)
    assert response.status_code == 422


def test_lots_crud_and_validation(client):
    create_payload = {
        "lot_uid": "LOT-NEW",
        "warehouse_id": 1,
        "storage_date": "2025-01-10",
        "status": "conforme",
    }
    create_response = client.post("/api/v1/lots", headers=FRONTEND_HEADERS, json=create_payload)
    assert create_response.status_code == 200
    assert create_response.json()["lot_uid"] == "LOT-NEW"
    assert create_response.json()["planned_dispatch_date"] is not None

    bad_sort = client.get("/api/v1/lots?sort=name", headers=FRONTEND_HEADERS)
    assert bad_sort.status_code == 400

    read_response = client.get("/api/v1/lots/LOT-NEW", headers=FRONTEND_HEADERS)
    assert read_response.status_code == 200

    update_response = client.put(
        "/api/v1/lots/LOT-NEW",
        headers=FRONTEND_HEADERS,
        json={"status": "perime", "actual_dispatch_date": "2025-01-20"},
    )
    assert update_response.status_code == 200
    assert update_response.json()["status"] == "perime"
    assert update_response.json()["actual_dispatch_date"] == "2025-01-20"

    delete_response = client.delete("/api/v1/lots/LOT-NEW", headers=FRONTEND_HEADERS)
    assert delete_response.status_code == 200
    assert delete_response.json()["deleted"] is True

    not_found_response = client.get("/api/v1/lots/not-found", headers=FRONTEND_HEADERS)
    assert not_found_response.status_code == 404

    update_not_found = client.put("/api/v1/lots/not-found", headers=FRONTEND_HEADERS, json={"status": "perime"})
    assert update_not_found.status_code == 404

    delete_not_found = client.delete("/api/v1/lots/not-found", headers=FRONTEND_HEADERS)
    assert delete_not_found.status_code == 404

    ordered_response = client.get("/api/v1/lots?sort=storage_date&order=desc", headers=FRONTEND_HEADERS)
    assert ordered_response.status_code == 200

    filtered_response = client.get("/api/v1/lots?warehouse_id=1", headers=FRONTEND_HEADERS)
    assert filtered_response.status_code == 200
    assert all(item["warehouse_id"] == 1 for item in filtered_response.json())


def test_readings_list_filters_and_create(client):
    list_response = client.get("/api/v1/readings?warehouse_id=1", headers=FRONTEND_HEADERS)
    assert list_response.status_code == 200
    assert len(list_response.json()) >= 1

    filtered_response = client.get(
        "/api/v1/readings?warehouse_id=1&from=2026-01-01T00:00:00&to=2026-01-02T00:00:00",
        headers=FRONTEND_HEADERS,
    )
    assert filtered_response.status_code == 200
    assert all(
        datetime.fromisoformat(reading["recorded_at"]) >= datetime(2026, 1, 1)
        for reading in filtered_response.json()
    )

    create_response = client.post(
        "/api/v1/readings",
        headers=SENSOR_HEADERS,
        json={"warehouse_id": 1, "temperature": 30.1, "humidity": 56.2},
    )
    assert create_response.status_code == 200
    assert create_response.json()["warehouse_id"] == 1


def test_readings_create_rejects_unrealistic_values(client):
    bad_humidity_response = client.post(
        "/api/v1/readings",
        headers=SENSOR_HEADERS,
        json={"warehouse_id": 1, "temperature": 30.1, "humidity": 120.0},
    )
    assert bad_humidity_response.status_code == 422

    bad_temperature_response = client.post(
        "/api/v1/readings",
        headers=SENSOR_HEADERS,
        json={"warehouse_id": 1, "temperature": -45.0, "humidity": 45.0},
    )
    assert bad_temperature_response.status_code == 422


def test_alerts_list(client):
    response = client.get("/api/v1/alerts?limit=5&offset=0", headers=FRONTEND_HEADERS)
    assert response.status_code == 200
    assert len(response.json()) >= 1

    filtered_response = client.get("/api/v1/alerts?warehouse_id=1", headers=FRONTEND_HEADERS)
    assert filtered_response.status_code == 200
    assert all(item["warehouse_id"] == 1 for item in filtered_response.json())
