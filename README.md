# MSPR-TPRE814 - FutureKawa

Solution distribuee pour le suivi des stocks et conditions de stockage du cafe vert.

## Stack
- Siege: Next.js (front + BFF)
- Pays: FastAPI + PostgreSQL + MQTT Mosquitto
- IoT: ESP32/DHT via MQTT
- Tests: Jest, Cypress, pytest
- CI/CD: Jenkins pipeline

## Lancement rapide (dev par defaut)
```bash
docker compose up
```

Hot reload est actif:
- Frontend: `next dev`
- Backend: `uvicorn --reload`

## Documentation API (Swagger)
- Swagger UI: `http://localhost:8001/docs`
- OpenAPI JSON: `http://localhost:8001/openapi.json`
- ReDoc: `http://localhost:8001/redoc`

## Lancer les tests dans Docker

Depuis la racine du projet:

```bash
# Tests backend (pytest + coverage)
docker compose run --rm backend-br sh -lc "pip install -r requirements.txt && PYTHONPATH=/app pytest -q"

# Tests frontend (Jest + coverage)
docker compose run --rm frontend sh -lc "npm install && npm run test:coverage"

# Tests E2E frontend (Cypress)
docker compose run --rm frontend sh -lc "npm install && npm run test:e2e"
```

## Authentification et securite
- Login Siege: `http://localhost:3000/login`
- Admin: `http://localhost:3000/admin`
- Better Auth stocke users/sessions en PostgreSQL.
- Pages pays/admin protegees (redirection vers login sans session).
- APIs pays protegees par cle API:
  - Header front siege: `X-Frontend-Key`
  - Header capteur IoT (ecriture mesures): `X-Sensor-Key`

## Arborescence
- `frontend/` : application Next.js du siege
- `backend/` : API FastAPI reutilisable pour chaque pays
- `iot/` : prototype MicroPython pour capteur
- `docker-compose.yml` : stack locale en mode developpement (hot reload)
- `Jenkinsfile` : pipeline CI/CD
