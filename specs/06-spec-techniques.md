# FlexPark — Spécification Technique

## Contexte

Application mobile interne pour la réservation de places de parking, développée pendant un hackathon de 5 jours.
Stack technique :

- Backend : **FastAPI**
- Base de données : **PostgreSQL**
- Frontend mobile : **Ionic (Angular ou React)**
- Auth : JWT (SSO possible en évolution)
- Stockage fichiers : S3-compatible (optionnel)
- Notifications : FCM (optionnel)
- Conteneurisation : Docker

---

## Objectifs techniques

- Fournir une API REST sécurisée et documentée (OpenAPI / Swagger).
- Garantir que seuls les salariés autorisés peuvent s’inscrire ou se connecter.
- Gérer les réservations concurrentes de manière robuste.
- Livrer un MVP fonctionnel en 5 jours.

---

## Architecture générale

1. **Ionic App (Mobile)**

   - UI simple : site selection → liste/plan → réservation → historique.
   - Stocke le JWT dans le secure storage (Capacitor Storage / native secure storage).

2. **API FastAPI**

   - Endpoints REST, validations Pydantic, gestion erreurs centralisée.
   - Auth middleware (JWT).
   - Webhooks / cron jobs si besoin.

3. **PostgreSQL**

   - Stocke utilisateurs, parkings, emplacements, réservations, notifications.

4. **Stockage d'assets**

   - Photos / docs sur S3 ou stockage interne.

5. **Infra**
   - Docker Compose pour dev / démo.
   - CI basique (GitHub Actions) pour lint, tests et build.

---

## Schéma de données (DDL simplifié)

```sql
-- users / employés
CREATE TABLE employees (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    firstname VARCHAR(100),
    lastname VARCHAR(100),
    service VARCHAR(100),
    role VARCHAR(20) DEFAULT 'employee',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- parkings (site)
CREATE TABLE parkings (
    id SERIAL PRIMARY KEY,
    site_name VARCHAR(255) NOT NULL,
    address TEXT,
    total_slots INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- slots (emplacements)
CREATE TABLE parking_slots (
    id SERIAL PRIMARY KEY,
    parking_id INT REFERENCES parkings(id) ON DELETE CASCADE,
    slot_number VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

-- reservations
CREATE TABLE reservations (
    id SERIAL PRIMARY KEY,
    employee_id INT REFERENCES employees(id) ON DELETE SET NULL,
    slot_id INT REFERENCES parking_slots(id) ON DELETE SET NULL,
    date DATE NOT NULL,
    period VARCHAR(20) NOT NULL, -- 'morning' | 'afternoon' | 'day'
    status VARCHAR(20) DEFAULT 'confirmed', -- 'confirmed','cancelled','no-show'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    UNIQUE (slot_id, date, period)
);
```

> Remarque : la contrainte UNIQUE sur (slot_id, date, period) empêche les doubles réservations côté base. En cas de forte concurrence, utiliser une transaction explicite (SELECT FOR UPDATE) ou logique pessimiste pour réserver.

---

## Endpoints API (principaux)

### Auth

- `POST /auth/login`  
  Request: `{ "email": "...", "password": "..." }`  
  Response: `{ "access_token": "...", "token_type": "bearer" }`

- `POST /auth/register` _(optionnel, hackathon: whitelist email)_  
  Request: `{ "email": "...", "firstname": "...", "lastname": "..." }`  
  Behavior: Accept only company domain emails or pre-populated employees.

### Parkings & Slots

- `GET /parkings` — liste des sites
- `GET /parkings/{id}/slots` — liste des emplacements et statut
- `POST /parkings` — (admin) créer site

### Réservations

- `GET /reservations/me` — réservations de l'utilisateur
- `POST /reservations` — créer réservation  
  Request: `{ "slot_id": 12, "date": "2025-12-10", "period": "morning" }`  
  Response: `{ "reservation_id": 123, "status": "confirmed" }`
- `DELETE /reservations/{id}` — annuler réservation (selon règle)

### Notifications

- `POST /notifications/send` — (admin) envoyer message/site-wide

---

## Gestion de la concurrence (exécution critique)

Pour créer une réservation :

1. Vérifier l’existence du slot et qu’il est actif.
2. Ouvrir une transaction.
3. Essayer d’insérer la réservation (INSERT) — la contrainte UNIQUE empêche duplication.
4. Si insertion échoue à cause d’un conflit (duplicate key), retourner 409 Conflict.
5. Commit.

Alternativement, utiliser `SELECT ... FOR UPDATE` sur la ligne du slot.

---

## Authentification & Autorisation

- JWT avec durée courte (ex: 15–60 min) + refresh token (optionnel pour hackathon).
- Middleware FastAPI pour vérifier `Authorization: Bearer <token>`.
- Vérifier `email` domaine ou `employees` whitelist lors de l’inscription.
- Rôles : `employee`, `admin`. Endpoints CRUD sensibles protégés par `admin`.

---

## Logs & Monitoring (minimum)

- Logs structurés (JSON) via `logging` pour API.
- Erreurs envoyées à Sentry (optionnel).
- Health endpoint `GET /health`.

---

## Tests

- Unit tests FastAPI (pytest + TestClient).
- Tests d’intégration pour réservation (concurrence).
- Tests E2E Ionic (cypress/playwright) si le temps le permet.

---

## Docker Compose (dev rapide)

```yaml
version: "3.8"
services:
  db:
    image: postgres:15
    environment:
      POSTGRES_USER: flexpark
      POSTGRES_PASSWORD: flexpark
      POSTGRES_DB: flexpark
    volumes:
      - db_data:/var/lib/postgresql/data
  api:
    build: ./api
    depends_on:
      - db
    environment:
      DATABASE_URL: postgres://flexpark:flexpark@db:5432/flexpark
    ports:
      - "8000:8000"
  ionic:
    build: ./mobile
    ports:
      - "8100:8100"
volumes:
  db_data:
```

---

## Déploiement & CI

- GitHub Actions workflow : lint -> tests -> build image -> push (registry).
- Déploiement simple : container sur VM ou service PaaS interne.

---

## Sécurité & Conformité

- TLS obligatoire (HTTPS).
- Ne stocker aucune donnée sensible inutile.
- RGPD : possibilité suppression compte / export des données si requis.
- Sécuriser les variables d’environnement (secrets manager).

---

## Livrables techniques pour le hackathon

- Repo `api/` (FastAPI) avec README, scripts init DB, endpoints principaux.
- Repo `mobile/` (Ionic) avec UI minimal et flow réservation.
- Docker Compose pour demo locale.
- Script pour précharger jeux de données (employees, parkings, slots).
- Documentation API (OpenAPI).

---

Fin de la spécification technique.
