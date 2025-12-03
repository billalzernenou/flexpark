# 🚗 FlexPark — Application Mobile de Réservation de Parking (Hackathon 5 jours)

### _Brief Technique — Format Markdown (Entreprise — Salariés)_

---

# 🧭 Contexte du projet

FlexPark est une **application mobile interne** destinée aux **salariés de l’entreprise**, développée dans le cadre d’un **hackathon de 5 jours**.  
L’objectif est de simplifier et moderniser la **réservation de places de parking** au sein des différents sites de l’entreprise, en remplaçant les processus manuels, les feuilles Excel ou les réservations informelles.

---

# 🎯 Objectif principal

Permettre aux collaborateurs de **voir les places disponibles**, de **réserver un créneau**, d'être **notifiés**, et de gérer leurs réservations facilement depuis leur smartphone.

---

# ⚙️ Fonctionnalités principales (MVP Hackathon)

## 🔐 Authentification (interne)

- Connexion via identité entreprise (SSO / email pro selon faisabilité)
- Gestion profil basique (Nom, Prénom, Service)

## 🅿️ Réservation de parking

- Consultation des parkings disponibles par site
- Visualisation des places disponibles (liste simple ou schéma selon temps)
- Réservation d’un créneau horaire :
  - Journée complète
- Historique des réservations
- Annulation / modification selon règles internes

## 🔔 Notifications

- Confirmation de réservation
- Rappel avant le créneau
- Notification en cas d’annulation automatique

## 📢 Informations / Règles

- Page dédiée aux règles d’utilisation du parking
- Informations temporaires (ex : travaux, places indisponibles)

---

# 🧩 Cas d’usage internes

### ⭐ 1. Arrivée sur site

Un salarié consulte les disponibilités pour le lendemain, réserve une place en quelques secondes.

### ⭐ 2. Télétravail / Horaires flexibles

L’utilisateur peut voir rapidement quand les créneaux sont les moins demandés.

---

# 🏗️ Architecture Technique

## 🌐 Frontend (Mobile)

- **Ionic** (Angular)
- UI simple et ergonomique (mise en avant de la réservation)

## 🖥️ Backend API

- **FastAPI**
- Endpoints REST JSON
- Auth interne ou JWT (selon contraintes internes)
- Gestion logique des créneaux / règles
- Documentation Swagger intégrée

## 📦 Base de données

- **PostgreSQL**
- Tables principales :
  - `employees`
  - `parkings`
  - `parking_slots`
  - `reservations`
  - `site_info`

## ☁️ Hébergement

- Docker (FastAPI + Postgres)
- Déploiement simple interne (VM / conteneur)

---

# 🗄️ Schéma de données simplifié

```
employees (id, firstname, lastname, email, service)
parkings (id, site, name, total_slots)
parking_slots (id, parking_id, slot_number, is_active)
reservations (id, employee_id, slot_id, date, period, status)
notifications (id, employee_id, type, message, created_at)
```

---

# 🛠️ API — Endpoints principaux

```
POST /auth/login
GET  /parkings
GET  /parkings/{id}/slots
POST /reservations
GET  /reservations/me
DELETE /reservations/{id}
```

---

# 📲 UI / Écrans (Ionic)

- Écran Login
- Accueil : Sélection du site
- Liste des places disponibles
- Réservation (créneau)
- Confirmation
- Mes réservations (historique)
- Page règles / informations internes

---

# ⏱️ Plan Hackathon (5 Jours)

### **Jour 1**

- Cadrage + maquettes rapides
- Setup projets (FastAPI + Ionic)
- Modélisation BDD Postgres

### **Jour 2**

- Implémentation API Auth
- CRUD parkings + slots

### **Jour 3**

- Gestion réservations côté backend
- Interfaces Ionic : Home + Liste parkings

### **Jour 4**

- Flow complet réservation → affichage → annulation
- Notifications (mock ou FCM selon faisabilité)

### **Jour 5**

- Tests rapides
- Finalisation UI
- Préparation démo hackathon

---

# 🎯 KPIs internes

- % de places réservées/utilisées
- Temps moyen pour réserver
- Nombre de réservations par site

---

# 🧪 Livrables prévus

- Application Ionic (Android/iOS) installable
- API FastAPI fonctionnelle
- Base Postgres avec scripts de création
- Documentation du projet (README)
- Démo finale (vidéo ou live)

---

# 🚀 Bonus si temps disponible

- QR code pour vérifier les réservations
- Système d’attente (liste d’attente si place indisponible)
- Mode “auto-cancel” si l’utilisateur n’arrive pas
- Statistiques dashboards internes

---

# ✔️ Conclusion

FlexPark apporte une solution moderne, rapide et simple pour **optimiser la gestion du parking d’entreprise**, améliorer l’expérience des salariés et réduire les contraintes logistiques.

---
