# 📜 Règles officielles Frontend ↔ Backend

## SPOFE Interaction Contract

### 0️⃣ Intention du document

Ce document définit comment le frontend interagit avec SPOFE, et surtout ce qu'il n'a pas le droit de faire.

**Objectifs :**

- garantir la gouvernance métier
- permettre l'ajout de modules frontend dans le temps
- empêcher le retour de logique métier côté client
- rendre le frontend interchangeable (techno-agnostique)

👉 **Toute implémentation frontend doit respecter ces règles.**

---

### 1️⃣ Principe fondamental

**Le frontend n'est jamais une source de vérité.**
**Le backend SPOFE est la seule autorité métier.**

**Conséquence immédiate :**

- le frontend demande
- le backend décide
- le frontend affiche la décision

---

### 2️⃣ Responsabilités claires (séparation stricte)

**🟦 Backend SPOFE (autorité)**

- règles métier
- invariants
- décisions (accepté / refusé)
- temporalité
- cohérence globale
- audit

**🟩 Frontend (adaptateur)**

- UX / UI
- navigation
- saisie utilisateur
- affichage des read-models
- affichage des erreurs

👉 **Aucune zone grise n'est acceptée.**

---

### 3️⃣ Règles de lecture (Read-models)

#### 3.1 Le frontend ne lit QUE des read-models

**GET sur :**

- vues
- projections
- endpoints read-only

**❌ Interdit :**

- lecture directe de tables
- endpoints "techniques"
- endpoints non documentés

#### 3.2 Le frontend ne reconstruit jamais l'état

**❌ Interdit :**

- calcul de statut (if closed)
- reconstruction temporelle
- agrégation métier côté client

**✅ Autorisé :**

- affichage tel que fourni
- tri / filtre purement UI
- pagination

---

### 4️⃣ Règles d'écriture (Commands)

#### 4.1 Le frontend n'écrit QUE via des Commands

- POST /commands/...
- PATCH /...
- jamais d'update partiel implicite

**❌ Interdit :**

- endpoints CRUD génériques
- payloads ambigus
- "auto-save" métier

#### 4.2 Une action UI = une intention métier

**Exemples valides :**

- "Créer un budget"
- "Mettre à jour un journal"
- "Clôturer une période"

**Exemples invalides :**

- "Sauvegarder l'état courant"
- "Mettre à jour le statut"
- "Corriger un champ"

👉 **Le vocabulaire frontend doit refléter le vocabulaire métier.**

---

### 5️⃣ Gestion des erreurs (règle cruciale)

#### 5.1 Le frontend ne discute jamais une erreur métier

**Quand SPOFE répond :**

- 403 / 409 / 422

**Le frontend :**

**❌ ne corrige pas**
**❌ ne réessaie pas différemment**
**❌ ne "devine" pas**

**Il :**

**✅ affiche l'erreur**
**✅ adapte l'UX**
**✅ informe l'utilisateur**

#### 5.2 Guardian est invisible mais souverain

**Le frontend :**

- ne sait pas ce qu'est Guardian
- ne connaît pas les invariants
- ne contourne jamais une décision

👉 **L'erreur est un message, pas une invitation à bricoler.**

---

### 6️⃣ Règles sur l'état frontend

#### 6.1 État autorisé

- état UI (onglet, modal ouverte)
- état de navigation
- cache temporaire mémoire

#### 6.2 État interdit

- état métier persistant
- duplication de vérité
- synchronisation manuelle

**❌ localStorage pour le métier**
**❌ "offline-first" non gouverné**

---

### 7️⃣ Authentification & identité

#### 7.1 Le frontend transmet l'identité, pas l'autorité

- JWT
- subject
- actorRole fourni par le backend auth

**❌ Interdit :**

- choisir son rôle
- masquer son identité
- déduire des privilèges

---

### 8️⃣ Modularité frontend ↔ modularité SPOFE

**Règle clé**

Un module frontend consomme UN module SPOFE.

- pas de logique transverse
- pas de dépendance cachée
- pas de couplage entre modules frontend

**Chaque module frontend :**

- peut être ajouté
- peut être retiré
- peut être refactorisé

👉 **Sans impacter les autres.**

---

### 9️⃣ Règles de communication technique

#### 9.1 Client API unique

- un seul point d'accès HTTP
- gestion centralisée des headers / erreurs
- gestion centralisée de l'auth

#### 9.2 Pas de logique réseau dans les vues

- pas de fetch dans le DOM
- pas de await dans le rendu

---

### 🔟 Règle d'or (à afficher dans le frontend)

> **Le frontend ne valide rien.**
> **Il reflète.**
> **Il déclenche.**
> **Il respecte.**

---

### 1️⃣1️⃣ Ce que ces règles garantissent

Grâce à ce contrat :

- ✅ ajout de nouveaux modules frontend sans refonte
- ✅ backend inchangé dans le temps
- ✅ UX cohérente même quand le métier évolue
- ✅ aucune dette métier côté client
- ✅ SPOFE reste gouvernant
