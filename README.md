# MSPR-TPRE814 - FutureKawa

Solution distribuee pour le suivi des stocks et conditions de stockage du cafe vert.

## Stack
- Siege: Next.js (front + BFF)
- Pays: FastAPI + PostgreSQL + MQTT Mosquitto
- IoT: ESP32/DHT via MQTT
- Tests: Jest, Cypress, pytest
- CI/CD: Jenkins pipeline

## Lancement rapide (demo)
```bash
docker compose up --build
```

## Documentation API (Swagger)
- Swagger UI: `http://localhost:8001/docs`
- OpenAPI JSON: `http://localhost:8001/openapi.json`
- ReDoc: `http://localhost:8001/redoc`

## Arborescence
- `frontend/` : application Next.js du siege
- `backend/` : API FastAPI reutilisable pour chaque pays
- `iot/` : prototype MicroPython pour capteur
- `docker-compose.yml` : stack locale
- `docker-compose.demo.yml` : extension 3 pays
- `Jenkinsfile` : pipeline CI/CD
