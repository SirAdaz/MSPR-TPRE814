# MSPR-TPRE814 - FutureKawa

Solution distribuee pour le suivi des stocks et conditions de stockage du cafe vert.

## Vue d'ensemble
- Siege: `frontend` Next.js (UI + BFF).
- Pays: 3 backends FastAPI (`BR`, `EC`, `CO`) avec 3 bases PostgreSQL separees.
- Auth siege: Better Auth + Prisma avec base PostgreSQL dediee.
- Messaging: 3 brokers MQTT Mosquitto (1 par pays).
- CI/CD: Jenkins (JCasC + pipeline + artefacts Docker).

## Stack
- Frontend: Next.js, better-auth, Prisma.
- Backend: FastAPI, SQLAlchemy, APScheduler.
- Data: PostgreSQL, Mosquitto MQTT.
- Tests: Jest, Cypress, pytest.
- CI/CD: Jenkins pipeline declaratif.

## Lancement rapide
Depuis la racine:

```bash
docker compose up -d --build
```

Hot reload est actif:
- Frontend: `next dev`
- Backends: `uvicorn --reload`

## Services et URLs utiles
- Frontend siege: `http://localhost:3000`
- Login: `http://localhost:3000/login`
- Admin: `http://localhost:3000/admin`
- Backend BR: `http://localhost:8001`
- Backend EC: `http://localhost:8002`
- Backend CO: `http://localhost:8003`
- Swagger BR: `http://localhost:8001/docs`
- MailHog UI: `http://localhost:8025`
- Jenkins: `http://localhost:8080`

## Comptes demo
- Siege admin:
  - Email: `admin@futurekawa.local`
  - Password: `Admin123!`
- Le script `frontend/scripts/init-admin-user.mjs` initialise ce compte au demarrage.

## Architecture des bases de donnees
- Auth siege (Next.js): schema Prisma dans `frontend/prisma/schema.prisma`.
- Pays (BR/EC/CO): modeles SQLAlchemy dans `backend/app/models/entities.py`.
- Repartition:
  - `postgres-auth` -> users/sessions Better Auth
  - `postgres-br` -> donnees metier BR
  - `postgres-ec` -> donnees metier EC
  - `postgres-co` -> donnees metier CO

## Healthchecks Compose
Le `docker-compose.yml` inclut des healthchecks pour:
- PostgreSQL (`pg_isready`)
- Backends (`/api/v1/health`)
- Frontend (`/login`)
- Jenkins (port `8080`)

Verification rapide:

```bash
docker compose ps
```

## Simulation et alertes
- Simulation active par backend:
  - `ENABLE_SIMULATION=true`
  - `SIMULATION_ENVIRONMENT_INTERVAL_SECONDS`
  - `SIMULATION_LOGISTICS_INTERVAL_SECONDS`
- Cooldown d'alertes configurable:
  - `ENABLE_ALERT_COOLDOWN`
  - `ALERT_COOLDOWN_SECONDS`
- Mapping emails par pays:
  - `ALERT_EMAIL_BR`
  - `ALERT_EMAIL_EC`
  - `ALERT_EMAIL_CO`

## Lancer les tests
Depuis la racine du projet:

```bash
# Backend (pytest)
docker compose run --rm -e PYTHONPATH=/app backend-br pytest -q

# Frontend unit (Jest)
docker compose run --rm frontend sh -lc "npm install && npm run test:coverage"

# Frontend E2E (Cypress)
docker compose run --rm frontend sh -lc "npm install && npm run test:e2e"
```

## Scenario E2E critique
Le test Cypress couvre au minimum:
- login admin
- ouverture d'un pays
- filtre par entrepot
- verification que les alertes sont visibles

Fichier: `frontend/cypress/e2e/home.cy.ts`

## Jenkins / CI-CD
- Jenkins est provisionne automatiquement via JCasC:
  - `jenkins/casc/jenkins.yaml`
  - `jenkins/init.groovy.d/create-pipeline-job.groovy`
- Le pipeline:
  - lance tests backend/frontend
  - build les images Docker
  - package les images en artefacts `.tar`
  - publie les rapports JUnit/coverage

## Securite
- Routes BFF Next.js -> backend avec `X-Frontend-Key`.
- Ecriture capteurs IoT -> backend avec `X-Sensor-Key`.
- Pages protegees via session Better Auth.

## Arborescence
- `frontend/` : application Next.js du siege
- `backend/` : API FastAPI reutilisable pour chaque pays
- `iot/` : prototype MicroPython capteur
- `docker-compose.yml` : stack locale complete
- `jenkins/` : image Jenkins + config as code
- `Jenkinsfile` : pipeline CI/CD
