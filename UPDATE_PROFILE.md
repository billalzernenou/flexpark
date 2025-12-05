# Mise à jour: Profil utilisateur complet

## Changements apportés

### Backend (FastAPI)

#### Models (`app/models.py`)

- ✅ Ajout de `firstName` et `lastName` à la classe `User`
- Ces champs sont optionnels (`nullable=True`)

#### Schemas (`app/schemas.py`)

- ✅ Mise à jour de `UserCreate` avec `firstName` et `lastName` (requis)
- ✅ Mise à jour de `UserOut` pour inclure `firstName` et `lastName`

#### Routers Auth (`app/routers/auth.py`)

- ✅ Endpoint `/register` maintenant accepte et stocke `firstName` et `lastName`
- ✅ Endpoint `/login` retourne les informations complètes de l'utilisateur incluant le nom et prénom

### Frontend (Angular/Ionic)

#### Service d'authentification (`services/auth.service.ts`)

- ✅ Méthode `register()` accepte maintenant 4 paramètres: `email`, `password`, `firstName`, `lastName`
- Les données sont stockées dans localStorage lors de la connexion/inscription

#### Page Register (`pages/register/register.page.ts`)

- ✅ FormGroup inclut les champs `firstName` et `lastName` (requis)
- ✅ Validation sur tous les champs

#### Template Register (`pages/register/register.page.html`)

- ✅ Champs pour Prénom et Nom avec icônes person-outline
- ✅ Validation d'erreurs affichée pour chaque champ

#### Page Reservation (`pages/reservation/reservation.page.html`)

- ✅ Utilise déjà `currentUser.firstName` et `currentUser.lastName` dans la bannière
- ✅ Affichage: "Bienvenue, {{ currentUser.firstName }} {{ currentUser.lastName }}"

#### Page Home (`pages/home/home.page.html`)

- ✅ Affichage personnalisé du nom: "Bienvenue {{ user.firstName }}!"
- ✅ Affichage du nom et prénom: "{{ user.firstName }} {{ user.lastName }}"

## Initialisation de la BD

Pour créer/réinitialiser les tables avec les nouveaux champs:

```bash
cd backend
python init_db.py
```

Ou manuellement dans le code FastAPI:

```python
from app.database import engine
from app.models import Base

Base.metadata.create_all(bind=engine)
```

## Flux d'authentification mis à jour

### Inscription

1. L'utilisateur entre: Prénom, Nom, Email, Mot de passe
2. Les données sont validées
3. POST `/auth/register` avec les 4 champs
4. Réponse: `{ id, email, firstName, lastName }`
5. Stockage dans localStorage
6. Redirection vers `/home`

### Connexion

1. L'utilisateur entre: Email, Mot de passe
2. POST `/auth/login` valide les credentials
3. Réponse: `{ access_token, user: { id, email, firstName, lastName } }`
4. Stockage du token et de l'utilisateur complet
5. Redirection vers `/home`

### Utilisation dans l'app

- Page Réservation: Affiche "Bienvenue, {{ firstName }} {{ lastName }}"
- Page Home: Affiche le prénom et les infos utilisateur complètes
- AuthService observable fournit l'utilisateur courant avec tous les champs

## Structure de données utilisateur

```typescript
{
  id: number,
  email: string,
  firstName: string,
  lastName: string
}
```

## Notes importantes

- ✅ Tous les champs firstName et lastName sont **requis** à l'inscription
- ✅ localStorage stocke les données complètes de l'utilisateur
- ✅ Le service AuthService gère l'observable currentUser$
- ✅ AuthGuard protège les routes
- ✅ AuthInterceptor ajoute le token JWT à chaque requête

## Test

Pour tester le flux complet:

1. Inscription avec: Prénom="Jean", Nom="Dupont", Email="jean@example.com", Mot de passe="password123"
2. Connexion avec le même email
3. Vérifier que les infos s'affichent correctement sur Home et Reservation
