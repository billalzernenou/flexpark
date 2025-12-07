# FlexPark - Flux d'Authentification

## Vue d'ensemble

Le système d'authentification de FlexPark est entièrement fonctionnel avec:

- Inscription d'utilisateurs
- Connexion avec token JWT
- Protection des routes
- Gestion de session utilisateur

## Architecture

### Backend (FastAPI)

#### Endpoints

- `POST /auth/register` - Enregistre un nouvel utilisateur

  - Request: `{ email: string, password: string }`
  - Response: `{ id: int, email: string }`

- `POST /auth/login` - Authentifie un utilisateur
  - Request: `{ email: string, password: string }`
  - Response: `{ access_token: string, token_type: string, user: { id: int, email: string } }`

#### Sécurité

- Les mots de passe sont hachés avec bcrypt
- Les tokens JWT expirent après 24 heures
- Secret key: configurée dans `backend/app/routers/auth.py` (à modifier en production)

### Frontend (Angular/Ionic)

#### Services

- **AuthService** (`/services/auth.service.ts`)
  - Gère l'inscription et la connexion
  - Stocke le token JWT dans localStorage
  - Fournit un Observable de l'utilisateur courant
  - Détecte l'état d'authentification

#### Intercepteurs

- **AuthInterceptor** (`/auth.interceptor.ts`)
  - Ajoute le token Bearer à tous les requêtes HTTP
  - Nécessaire pour l'authentification API

#### Gardes de Routes

- **AuthGuard** (`/auth.guard.ts`)
  - Protège les routes authentifiées (home, reservation)
  - Redirige vers /login si non authentifié

#### Pages

1. **Login Page** (`/pages/login/`)

   - Formulaire réactif avec validation
   - Affichage/masquage du mot de passe
   - Gestion des erreurs
   - Redirection vers register

2. **Register Page** (`/pages/register/`)

   - Formulaire avec validation email
   - Confirmation du mot de passe
   - Validation des critères d'inscription
   - Redirection vers login

3. **Home Page** (`/home/`)
   - Affiche les infos de l'utilisateur connecté
   - Bouton de déconnexion
   - Accès aux autres fonctionnalités

## Flux d'authentification

### Inscription

1. L'utilisateur accède à `/register`
2. Remplit le formulaire (email, password, confirmation)
3. Valide la soumission
4. `AuthService.register()` envoie une requête POST à `/auth/register`
5. Le backend crée l'utilisateur si l'email n'existe pas
6. L'utilisateur est redirigé vers `/home`

### Connexion

1. L'utilisateur accède à `/login`
2. Remplit le formulaire (email, password)
3. Valide la soumission
4. `AuthService.login()` envoie une requête POST à `/auth/login`
5. Le backend valide les credentials
6. Le token JWT et l'email sont stockés dans localStorage
7. L'utilisateur est redirigé vers `/home`
8. L'AuthInterceptor ajoute automatiquement le token à chaque requête

### Protection des routes

1. L'utilisateur essaie d'accéder à `/home` ou `/reservation`
2. `AuthGuard.canActivate()` vérifier si `authService.isAuthenticated` est true
3. Si oui: accès accordé
4. Si non: redirection vers `/login`

### Déconnexion

1. L'utilisateur clique sur "Déconnecter"
2. `AuthService.logout()` supprime le token et les données utilisateur
3. Redirection vers `/login`

## Variables d'environnement

### Frontend

Fichier: `frontend/app/src/environments/environment.ts`

```typescript
export const environment = {
  production: false,
  apiUrl: "http://localhost:8000",
};
```

### Backend

Fichier: `backend/app/routers/auth.py`

```python
SECRET_KEY = "your-secret-key-change-in-production"
ALGORITHM = "HS256"
```

## Démarrage

### Backend

```bash
cd backend
python -m uvicorn app.main:app --reload
```

### Frontend

```bash
cd frontend/app
npm install
ng serve
```

## Test de l'authentification

### Avec Postman/Curl

**Inscription:**

```bash
curl -X POST http://localhost:8000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

**Connexion:**

```bash
curl -X POST http://localhost:8000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "user@example.com", "password": "password123"}'
```

## Structure des fichiers

```
frontend/app/src/app/
├── auth.guard.ts              # Protection des routes
├── auth.interceptor.ts         # Ajout du token aux requêtes
├── services/
│   └── auth.service.ts         # Service d'authentification
├── pages/
│   ├── login/
│   │   ├── login.page.ts
│   │   ├── login.page.html
│   │   └── login.page.scss
│   └── register/
│       ├── register.page.ts
│       ├── register.page.html
│       └── register.page.scss
└── home/
    ├── home.page.ts
    ├── home.page.html
    └── home.page.scss

backend/app/
└── routers/
    └── auth.py                 # Endpoints d'authentification
```

## Sécurité - Points importants

⚠️ **À faire avant la production:**

1. **Changer la clé secrète** dans `backend/app/routers/auth.py`

   ```python
   SECRET_KEY = "your-super-secret-key-here"
   ```

2. **Configurer HTTPS** pour toutes les communications

3. **Implémenter la rotation des tokens** pour plus de sécurité

4. **Ajouter la validation email** pour confirmer les adresses email

5. **Implémenter la réinitialisation de mot de passe**

6. **Ajouter la vérification CORS** pour limiter les origines

## Dépendances requises

### Backend

- `python-jose[cryptography]` - JWT
- `passlib[bcrypt]` - Hash de mots de passe
- `fastapi`
- `sqlalchemy`

### Frontend

- `@angular/common`
- `@angular/forms` (ReactiveFormsModule)
- `@ionic/angular`
- `rxjs`

## Troubleshooting

### "Email already registered"

L'email existe déjà. Utilisez un autre email ou accédez directement à `/login`.

### "Invalid credentials"

L'email ou le mot de passe est incorrect.

### "Unauthorized" (401) sur requêtes API

Le token JWT a expiré ou n'a pas été envoyé. Reconnectez-vous.

### Redirection automatique vers /login

Vous n'êtes pas authentifié. Consultez le localStorage pour vérifier la présence du token.
