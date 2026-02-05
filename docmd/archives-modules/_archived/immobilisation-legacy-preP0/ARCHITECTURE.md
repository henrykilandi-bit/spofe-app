# ARCHITECTURE — Golden Module SPOFE  
## Module Immobilisation v1.0.0

---

## 1. Rôle du document

Ce document décrit **l'architecture de référence ("Golden Module")** du système SPOFE,
telle qu'implémentée par le module **Immobilisation**.

Il sert :
- de **référence normative** pour tous les futurs modules (Stock, Ventes, Comptabilité, etc.)
- de **guide de conception** pour les développeurs
- de **base d'audit** pour la gouvernance SPOFE
- de **preuve de maturité architecturale** du système

👉 Tout module SPOFE doit pouvoir être conçu **en copiant cette architecture**.

---

## 2. Principes architecturaux fondamentaux

Le module Immobilisation applique strictement les principes suivants :

### 2.1 CQRS strict

- Séparation **totale** entre :
  - write-side (Commands)
  - read-side (Queries)
- Aucun partage de modèle entre lecture et écriture
- Aucun write depuis une API de lecture

---

### 2.2 Guardian central

- Toute la logique métier est centralisée dans le **Guardian**
- Le Guardian :
  - valide les invariants métier
  - rejette ou accepte les décisions
  - ne dépend d'aucune infrastructure
- Aucun calcul métier n'est autorisé :
  - dans les controllers
  - dans les handlers
  - dans les repositories
  - dans les read-models

> **Le Guardian décide, le reste exécute.**

---

### 2.3 Architecture contractuelle

- Le comportement du module est défini par des **contrats écrits**
- Le code est une **implémentation du contrat**, jamais l'inverse
- Toute évolution passe par :
  1. modification du contrat
  2. implémentation
  3. BUILD_PROOF

---

## 3. Découpage logique du module

### 3.1 Vue d'ensemble

```
Command
↓
Handler
↓
Guardian (invariants)
↓
Events
↓
Write Repository (PostgreSQL)
↓
Read-models SQL (projections)
↓
Query Repository
↓
API HTTP (GET only)
```

---

### 3.2 Write-Side

#### Responsabilités
- Réception des Commands
- Validation métier via Guardian
- Persistance des événements / états

#### Composants

```
src/application/
├── commands/
├── handlers/
├── events/

src/domain/
├── aggregates/
├── value-objects/
├── invariants/
├── guardian/

src/infrastructure/
├── repositories/write/
```

#### Règles
- Aucun accès direct aux read-models
- Aucune logique métier hors Guardian
- Toute Command inclut `tenantId`, `actorId`, `correlationId`

---

### 3.3 Read-Side

#### Responsabilités
- Exposition des données projetées
- Aucune logique métier
- Lecture seule

#### Composants

```
sql/
├── migrations/
├── read-models.sql

src/infrastructure/
├── repositories/read/

src/api/
├── controllers/read/
```

#### Règles
- Read-models SQL uniquement
- API GET uniquement
- Aucun calcul métier
- Pas de jointure "intelligente" côté application

---

## 4. API & Contrats

### 4.1 API Read-Only

- Toutes les API publiques exposées sont :
  - GET
  - idempotentes
  - contractuelles
- Définies dans :
  - `API_READ_ONLY.md`
  - `immobilisation.openapi.json`

---

### 4.2 Inter-modules

Les échanges inter-modules sont **explicites et versionnés** :

- Immobilisation → Cost-Structure
- Immobilisation → Budget

Règles :
- Aucun accès direct aux tables
- Aucun appel implicite
- Contrats écrits et testés

---

## 5. Tests (obligatoires)

### 5.1 Hiérarchie des tests

```
tests/
├── unit/ (Guardian table-driven)
├── integration/ (Guardian ↔ PostgreSQL)
├── e2e/ (API GET)
└── contract/ (Inter-modules)
```

### 5.2 Règles

- Aucun mock métier
- PostgreSQL réel
- Tests déterministes
- Échec d'un test = BUILD_PROOF invalide

---

## 6. Gouvernance & BUILD_PROOF

### 6.1 BUILD_PROOF

Chaque module SPOFE doit produire :

```
BUILD_PROOF.md
BUILD_PROOF.sig
```

Le BUILD_PROOF certifie :
- le périmètre contractuel
- la réussite des tests
- la validité TypeScript
- la conformité CI

👉 **Aucun GO PROD sans BUILD_PROOF signé.**

---

### 6.2 Validation SPOFE

La validation est :
- automatique
- non interprétable
- opposable

Commandes officielles :
```bash
node tools/build-proof/generate-build-proof.ts
node tools/build-proof/sign-build-proof.ts
node tools/validate-module/spofe-validate-module.ts
```

---

## 7. Gestion du périmètre

### 7.1 Périmètre contractuel

Défini dans :
```
SCOPE.md
```

Inclut :
```
src/
tests/
contract/
sql/
BUILD_PROOF.md
```

### 7.2 Hors périmètre
```
experimental/
```

- Code non contractuel
- Conservé pour historique
- Exclu des builds et tests

---

## 8. Multi-tenant & Sécurité

- tenantId obligatoire partout
- RLS PostgreSQL activée
- Aucun cross-tenant possible
- Audit trail systématique