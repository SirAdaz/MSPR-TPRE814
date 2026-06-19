# Guide de Lancement des Tests — FutureKawa

> Guide pratique pour exécuter les tests du projet.
> Pour le plan de tests formel (cas de tests, jeux de données, critères), voir [`Plan_Tests.txt`](./Plan_Tests.txt).

---

## Prérequis

| Méthode | Requis |
|---------|--------|
| **Docker** (recommandé) | Docker Desktop ou Docker Engine + Docker Compose |
| Local | Python 3.11+, Node.js 20+ |

---

## Tests backend (pytest)

Les tests backend utilisent une base **SQLite temporaire** — aucune base PostgreSQL, aucune dépendance externe.

### Avec Docker ✅

```bash
# Depuis la racine du projet

# Lancer tous les tests (couverture ≥ 80 % enforced)
docker compose run --rm --no-deps backend-br pytest

# Mode verbose
docker compose run --rm --no-deps backend-br pytest -v

# Un fichier de test spécifique
docker compose run --rm --no-deps backend-br pytest tests/test_api_routes.py
docker compose run --rm --no-deps backend-br pytest tests/test_alerts_logic.py
docker compose run --rm --no-deps backend-br pytest tests/test_security.py

# Un test précis par son nom
docker compose run --rm --no-deps backend-br pytest tests/test_api_routes.py::test_lots_crud_and_validation
docker compose run --rm --no-deps backend-br pytest tests/test_alerts_service.py::test_check_expired_lots_marks_status

# Rapport de couverture HTML (généré dans backend/htmlcov/)
docker compose run --rm --no-deps backend-br pytest --cov=app --cov-report=html

# Sans vérification du seuil de couverture (pour déboguer)
docker compose run --rm --no-deps backend-br pytest --no-cov
```

> `--no-deps` évite de démarrer PostgreSQL et Mosquitto — inutiles pour les tests.

### Sans Docker (local)

```bash
cd backend
pip install -r requirements.txt
pytest
```

---

## Tests frontend (Jest)

### Avec Docker ✅

```bash
# Depuis la racine du projet

# Tous les tests unitaires avec couverture
docker run --rm \
  -v $(pwd)/frontend:/app \
  -w /app \
  node:22 \
  sh -c "npm install && npm test -- --watchAll=false"

# Sans couverture (plus rapide)
docker run --rm \
  -v $(pwd)/frontend:/app \
  -w /app \
  node:22 \
  sh -c "npm install && npm run test:unit -- --watchAll=false"

# Un fichier de test spécifique
docker run --rm \
  -v $(pwd)/frontend:/app \
  -w /app \
  node:22 \
  sh -c "npm install && npx jest src/__tests__/LotList.test.tsx --watchAll=false"
```

### Sans Docker (local)

```bash
cd frontend
npm install
npm test
```

---

## Tests End-to-End Cypress

Les tests E2E nécessitent que **l'application complète soit en cours d'exécution**.

### Avec Docker ✅

**Étape 1 — Démarrer le stack complet**

```bash
# Depuis la racine du projet
docker compose up -d

# Vérifier que tous les services sont healthy avant de continuer
docker compose ps
```

Attendre que `frontend` soit `healthy` (peut prendre ~1 min au premier démarrage).

**Étape 2 — Lancer Cypress en mode headless**

```bash
docker run --rm \
  -v $(pwd)/frontend/cypress:/e2e/cypress \
  -v $(pwd)/frontend/cypress.config.ts:/e2e/cypress.config.ts \
  --network host \
  cypress/included:latest \
  --config baseUrl=http://localhost:3000
```

**Étape 3 — Arrêter le stack**

```bash
docker compose down
```

### Sans Docker (local)

```bash
# Terminal 1 — démarrer l'application
cd frontend && npm run dev

# Terminal 2 — lancer les tests
cd frontend
npm run test:e2e          # headless
npx cypress open          # interface graphique
```

---

## Tests de composants Cypress

### Avec Docker ✅

```bash
docker run --rm \
  -v $(pwd)/frontend:/e2e \
  -w /e2e \
  --network host \
  cypress/included:latest \
  run --component \
  --config-file cypress.config.ts
```

### Sans Docker (local)

```bash
cd frontend
npm run test:component
```

---

## Relancer un test par son ID

| ID     | Fichier                           | Commande Docker                                                                                  |
|--------|-----------------------------------|--------------------------------------------------------------------------------------------------|
| UT-01  | `tests/test_health.py`            | `docker compose run --rm --no-deps backend-br pytest tests/test_health.py::test_health_ok`      |
| UT-06  | `tests/test_alerts_logic.py`      | `docker compose run --rm --no-deps backend-br pytest tests/test_alerts_logic.py::test_evaluate_reading_returns_none_when_in_range` |
| IT-01  | `tests/test_api_routes.py`        | `docker compose run --rm --no-deps backend-br pytest tests/test_api_routes.py::test_exploitations_requires_auth` |
| IT-06  | `tests/test_api_routes.py`        | `docker compose run --rm --no-deps backend-br pytest tests/test_api_routes.py::test_lots_crud_and_validation` |
| IT-20  | `tests/test_alerts_service.py`    | `docker compose run --rm --no-deps backend-br pytest tests/test_alerts_service.py::test_create_alert_respects_cooldown` |
| IT-21  | `tests/test_alerts_service.py`    | `docker compose run --rm --no-deps backend-br pytest tests/test_alerts_service.py::test_check_expired_lots_marks_status` |
| IT-24  | `tests/test_infra_and_mqtt.py`    | `docker compose run --rm --no-deps backend-br pytest tests/test_infra_and_mqtt.py::test_init_db_retries_then_succeeds` |
| IT-28  | `tests/test_infra_and_mqtt.py`    | `docker compose run --rm --no-deps backend-br pytest tests/test_infra_and_mqtt.py::test_consume_processes_messages` |
| FE-01  | `src/__tests__/LotList.test.tsx`  | `docker run --rm -v $(pwd)/frontend:/app -w /app node:22 sh -c "npm install && npx jest src/__tests__/LotList.test.tsx --watchAll=false"` |

---

## Interpréter les résultats

### pytest

| Statut          | Signification                                          |
|-----------------|--------------------------------------------------------|
| `PASSED`        | Test réussi                                            |
| `FAILED`        | Test échoué — message d'erreur affiché                 |
| `ERROR`         | Erreur avant l'exécution (problème de configuration)   |
| `COVERAGE FAIL` | Couverture < 80 % — bloque le pipeline CI/CD           |

### Jest

| Symbole   | Signification |
|-----------|---------------|
| ✓ (vert)  | Test réussi   |
| ✕ (rouge) | Test échoué   |

### Cypress

| Statut    | Signification                                                    |
|-----------|------------------------------------------------------------------|
| `passing` | Test réussi                                                      |
| `failing` | Test échoué — screenshot dans `frontend/cypress/screenshots/`   |
