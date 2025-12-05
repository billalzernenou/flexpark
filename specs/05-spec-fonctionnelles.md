# FlexPark — Spécification Fonctionnelle

## Contexte

Application mobile interne pour salariés, objectif : réserver des places de parking par créneau (matin / après-midi / journée) sur les sites de l’entreprise. Développement pendant un hackathon de 5 jours.

---

## Public cible

- Salariés ayant une adresse email professionnelle.
- Administrateurs RH / facilities pour gestion des sites et règles.

---

## Objectifs fonctionnels principaux (MVP)

1. Permettre à un salarié d’authentifier son compte (email pro).
2. Consulter la liste des parkings du siège et autres sites.
3. Voir les emplacements disponibles par date et période.
4. Réserver un créneau (matin / après-midi / journée).
5. Annuler une réservation selon règles (ex : jusqu’à 1h avant).
6. Recevoir notifications (confirmation + rappel).
7. Voir l’historique de ses réservations.

---

## Parcours utilisateur (User Flows)

### Flow A — Connexion

1. Ouvrir l’app -> écran Login.
2. Saisir email professionnel.
3. Si email acceptée, soit authentifier via SSO, soit code d’activation / mot de passe.
4. Redirection vers écran de sélection du site.

**Critères d’acceptation**

- Seuls les emails du domaine de l’entreprise peuvent se connecter.
- L’utilisateur connecté voit son nom et service dans le profil.

### Flow B — Recherche & Réservation rapide

1. Sur l’écran Home, choisir le site (ou sélection automatique via géoloc).
2. Voir liste des parkings / plan simplifié.
3. Choisir date -> voir disponibilités par période.
4. Sélectionner un slot libre -> bouton « Réserver ».
5. Confirmer réservation -> notification confirmation + ajout dans historique.

**Critères d’acceptation**

- Après réservation, le slot devient indisponible pour la même date/period.
- L’utilisateur reçoit confirmation immédiate (push / mail).

### Flow C — Annulation

1. Aller dans « Mes réservations ».
2. Cliquer sur réservation active -> « Annuler ».
3. Confirmer l’annulation (avec règle d’éligibilité).

**Critères d’acceptation**

- Annulation possible si respect des règles internes (ex: >1h avant).
- Statut changé en `cancelled` et slot redevenu disponible.

---

## Écrans & Composants (Ionic)

1. **Splash / Onboarding** (optionnel)
2. **Login** : email, bouton SSO (si dispo)
3. **Home** : sélection site (carte ou liste)
4. **Parking List** : parkings du site avec nombre de places libres
5. **Parking Detail** : plan / liste des slots, filtres
6. **Réservation** : date picker, période (matin/pm/day), confirmation
7. **Mes réservations** : liste & statut, annulation
8. **Profil** : infos employé, service, déconnexion
9. **Info & règles** : page admin pour publier annonces
10. **Notifications** : gestion locale des push

---

## Règles Métier

- Périodes : `morning` (matin), `afternoon` (après-midi), `day` (journée).
- Une place ne peut être réservée que par une seule personne pour une paire (date, period).
- Limite de réservation : max 1 réservation active par utilisateur par jour (configurable).
- Annulation : autorisée jusqu'à 1h avant le début du créneau (configurable).
- Priorité : certaines places peuvent être marquées « réservées pour management » (rôles).

---

## Cas d’usage & Scénarios de test (acceptance tests)

### Test 1 — Réservation normale

- Given : utilisateur connecté, slot libre pour demain matin
- When : il réserve le créneau
- Then : réservation confirmée, slot bloqué, notification envoyée

### Test 2 — Double réservation (conflit)

- Given : deux utilisateurs tentent de réserver le même slot et période
- When : premières requête insère la réservation; la seconde reçoit erreur 409
- Then : système doit informer l’utilisateur de l’indisponibilité

### Test 3 — Annulation conforme

- Given : réservation dans 2 heures
- When : utilisateur annule (si >1h)
- Then : statut cancel, remboursement si applicable (non concerné MVP)

### Test 4 — Accès restreint

- Given : utilisateur avec email non professionnel
- When : il tente de s’inscrire
- Then : refus d’accès (message explicite)

---

## Critères d’acceptation du MVP

- Authentiﬁcation fonctionnelle pour les employés.
- Création & lecture de réservations opérationnelles.
- Blocage des conflits (double réservation).
- Interface mobile minimale utilisable pour la démo.
- Démo complète jour 5 (réservation, annulation, profil, notifications mocked).

---

## Indicateurs de succès (KPI hackathon)

- Nombre de réservations réalisées pendant la démo.
- Temps moyen pour effectuer une réservation.
- Retour utilisateur (survey rapide) : satisfaction > 70%.

---

## Plan de test rapide (jour 5)

- Tests unitaires backend (auth, réservation).
- Test d’intégration (simuler 10 requêtes concurrentes sur un même slot).
- Parcours utilisateur E2E (login → réserver → annuler).
- Checklist demo (écran démo, script oral, slides 3–4).

---

## Priorisation des fonctionnalités (MVP → Next)

### MUST (MVP hackathon)

- Auth interne (email pro)
- Liste parkings & slots
- Réservation / annulation
- Historique utilisateur

### SHOULD (si temps)

- Notifications push (mock acceptable)
- Rôles admin & gestion sites via UI

### COULD (post-hackathon)

- QR code d’accès
- Intégration SSO (Azure AD)
- Dashboard statistiques

---

Fin de la spécification fonctionnelle.
