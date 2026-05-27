# MSPR-TPRE814 - FutureKawa

Solution distribuée pour le suivi des stocks et conditions de stockage du café vert.

## Vue d'ensemble

- Siège : `frontend` Next.js (UI + BFF).
- Pays : 3 backends FastAPI (`BR`, `EC`, `CO`) avec 3 bases PostgreSQL séparées.
- Auth siège : Better Auth + Prisma avec base PostgreSQL dédiée.
- Messaging : 3 brokers MQTT Mosquitto (1 par pays ; écoute désactivée par défaut en local).
- CI/CD : Jenkins (JCasC + pipeline + artefacts Docker).

Aucun fichier `.env` n'est requis pour le démarrage local : les variables sont définies dans `docker-compose.yml`.

## Stack

- Frontend : Next.js, better-auth, Prisma.
- Backend : FastAPI, SQLAlchemy, APScheduler.
- Data : PostgreSQL, Mosquitto MQTT.
- Tests : Jest, Cypress, pytest.
- CI/CD : Jenkins pipeline déclaratif.

## Lancement rapide

Depuis la racine :

```bash
docker compose up -d --build
```

Hot reload actif :

- Frontend : `next dev`
- Backends : `uvicorn --reload`

### Initialisation des bases

- **Auth (siège)** : au démarrage du conteneur `frontend`, `prisma migrate deploy` puis `prisma generate`.
- **Pays (BR/EC/CO)** : au boot de chaque backend, `init_db()` (schéma) et `ensure_demo_data()` (jeu de démo). Le dossier `backend/alembic/` sert aux migrations versionnées hors flux Compose dev.

## Services et URLs utiles

| Service | URL / port hôte |
|---------|-----------------|
| Frontend siège | http://localhost:3000 |
| Login | http://localhost:3000/login |
| Admin | http://localhost:3000/admin |
| Pays BR | http://localhost:3000/country/BR |
| Lots BR | http://localhost:3000/country/BR/lots |
| Backend BR | http://localhost:8001 |
| Backend EC | http://localhost:8002 |
| Backend CO | http://localhost:8003 |
| Swagger BR / EC / CO | http://localhost:8001/docs · :8002/docs · :8003/docs |
| MailHog UI | http://localhost:8025 |
| Jenkins | http://localhost:8080 |

### Ports hôte (debug / outils externes)

| Service | Port |
|---------|------|
| PostgreSQL auth | 5434 |
| PostgreSQL BR | 5433 |
| PostgreSQL EC | 5435 |
| PostgreSQL CO | 5436 |
| MQTT BR / EC / CO | 1883 / 1884 / 1885 |
| MailHog SMTP | 1025 |

## Comptes démo

- Siège admin :
  - Email : `admin@futurekawa.local`
  - Mot de passe : `Admin123!`
- Le script `frontend/scripts/init-admin-user.mjs` initialise ce compte au démarrage du frontend.
- Jenkins (interface locale) : `admin` / `admin123` (variables `JENKINS_ADMIN_ID` / `JENKINS_ADMIN_PASSWORD` dans le compose).

## Architecture des bases de données

- Auth siège (Next.js) : schéma Prisma dans `frontend/prisma/schema.prisma`.
- Pays (BR/EC/CO) : modèles SQLAlchemy dans `backend/app/models/entities.py`.
- Répartition :
  - `postgres-auth` → users/sessions Better Auth
  - `postgres-br` → données métier BR
  - `postgres-ec` → données métier EC
  - `postgres-co` → données métier CO

## Healthchecks Compose

Le `docker-compose.yml` inclut des healthchecks pour :

- PostgreSQL (`pg_isready`)
- Backends (`/api/v1/health`)
- Frontend (`/login`)
- Jenkins (port `8080`)

Vérification rapide :

```bash
docker compose ps
```

## Simulation et alertes

Par backend (valeurs par défaut dans le compose) :

- `ENABLE_SIMULATION=true`
- `SIMULATION_ENVIRONMENT_INTERVAL_SECONDS` (ex. 45)
- `SIMULATION_LOGISTICS_INTERVAL_SECONDS` (ex. 90)
- `ENABLE_ALERT_COOLDOWN` / `ALERT_COOLDOWN_SECONDS`
- `ENABLE_MQTT=false` en local (brokers Mosquitto démarrés mais non consommés)
- Emails d'alerte : `ALERT_EMAIL_BR`, `ALERT_EMAIL_EC`, `ALERT_EMAIL_CO`

## Lancer les tests

Depuis la racine du projet (stack déjà démarrée pour Cypress) :

```bash
# Backend (pytest)
docker compose run --rm -e PYTHONPATH=/app backend-br pytest -q

# Frontend unit (Jest)
docker compose run --rm frontend sh -lc "npm install && npm run test:coverage"

# Frontend E2E (Cypress — nécessite frontend + backends healthy)
docker compose run --rm frontend sh -lc "npm install && npm run test:e2e"
```

## Scénario E2E critique

Le test Cypress couvre au minimum :

- connexion admin
- ouverture d'un pays (`/country/BR`)
- filtre par entrepôt
- vérification que les alertes sont visibles

Fichier : `frontend/cypress/e2e/home.cy.ts`

## Jenkins / CI-CD

- Jenkins est provisionné automatiquement via JCasC :
  - `jenkins/casc/jenkins.yaml`
  - `jenkins/init.groovy.d/create-pipeline-job.groovy`
- Le pipeline (`Jenkinsfile`) :
  - lint + tests backend (pytest, couverture ≥ 80 %)
  - lint + tests frontend (Jest, couverture ≥ 80 %)
  - build des images Docker backend et frontend
  - export des images en artefacts `.tar`
  - publication JUnit et rapports de couverture
- E2E **optionnel** : paramètre `RUN_E2E` (défaut `false`) pour lancer Cypress dans le pipeline.

## Sécurité

- Routes BFF Next.js → backend avec `X-Frontend-Key`.
- Écriture capteurs IoT → backend avec `X-Sensor-Key`.
- Pages protégées via session Better Auth.

## Arborescence

- `frontend/` : application Next.js du siège
- `backend/` : API FastAPI réutilisable pour chaque pays
- `iot/` : prototype MicroPython capteur
- `docker-compose.yml` : stack locale complète (3 pays + auth + outils)
- `jenkins/` : image Jenkins + config as code
- `Jenkinsfile` : pipeline CI/CD
