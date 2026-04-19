# DOCUMENTATION COMPLÈTE — MODULE GESTION-TIERS

**Version:** v1.0.0 | **Statut:** FROZEN | **Module SPOFE**

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture](#2-architecture)
3. [Contrats fonctionnels](#3-contrats-fonctionnels)
4. [Guardian et règles métier](#4-guardian-et-règles-métier)
5. [Commands et Events](#5-commands-et-events)
6. [API Read-Only](#6-api-read-only)
7. [Read Models](#7-read-models)
8. [Structure du code](#8-structure-du-code)
9. [Pour créer une version supérieure](#9-pour-créer-une-version-supérieure)

---

## 1. VUE D'ENSEMBLE

### Objectif
Module de gestion des tiers (clients, fournisseurs, partenaires) avec validation stricte des données et traçabilité complète.

### Positionnement
**Module fondamental SPOFE** — Gestion-Tiers est référencé par tous les modules métier (Comptabilité, Ventes, Achats, Trésorerie).

### Responsabilités
- Créer et gérer les informations des tiers
- Assigner des rôles (CLIENT, FOURNISSEUR, etc.)
- Gérer les statuts (ACTIVE, SUSPENDED, ARCHIVED)
- Maintenir l'historique append-only
- Fournir une identification légale unique par tenant

### Périmètre (In Scope)
- Entités `Tier` et propriétés
- Événements: `TierCreated`, `TierUpdated`, `TierSuspended`, `TierArchived`
- Invariants G01-G10 (Guardian)
- Commands: `CreateTier`, `UpdateTier`, `SuspendTier`, `ArchiveTier`
- Projections read-model pour consultation
- Référentiel comptable par défaut: **OHADA**

### Hors périmètre (Out of Scope)
- Logique comptable spécifique (écritures, soldes)
- Génération d'écritures comptables automatiques
- Workflows d'approbation complexes
- Synchronisation avec systèmes externes
- Indicateurs financiers (DSO, encours)

---

## 2. ARCHITECTURE

### Principes fondamentaux
- **Architecture SPOFE en couches** — Domain / Application / Infrastructure
- **Guardian central** — 100% logique métier dans Guardian Layer
- **Référentiel-agnostique** — Core sans dépendance comptable
- **Isolation stricte par tenant** — Multi-tenant avec RLS
- **Append-only** — Aucune suppression, historique complet

### Flux d'exécution
```
Command → Document → Validation Guardian → Event → Write DB → Read Models → API GET
```

### Cycle de vie d'un tiers
```
DRAFT → VALIDATED → ACTIVE
              ↓
         SUSPENDED (peut redevenir ACTIVE)
              ↓
         ARCHIVED (immuable, irréversible)
```

### Structure canonique (à jour)
```
gestion-tiers/
├── src/
│   ├── domain/
│   │   ├── guardian/          # Invariants G01-G10, TierGuardian.ts, GuardianContext.ts
│   │   ├── model/             # Entités Tier
│   │   └── events/            # Events du domaine
│   ├── application/           # Commands, Handlers, Ports (SPOFE P0)
│   │   ├── commands/          # CreateTier, UpdateTier, SuspendTier, ArchiveTier
│   │   ├── handlers/          # CreateTierHandler, UpdateTierHandler, SuspendTierHandler, ArchiveTierHandler
│   │   ├── ports/             # TierEventStorePort, TierRepositoryPort
│   │   └── wiring/            # Module wiring
│   ├── api/                   # Controllers GET uniquement
│   ├── infrastructure/        # Repositories
│   └── read-models/           # Projections SQL (11 fichiers)
├── contract/                  # Documents contractuels
│   ├── SCOPE.md
│   ├── CONTRACT.md
│   ├── GUARDIAN.md
│   ├── COMMANDS_EVENTS.md
│   ├── READ_MODELS.md
│   └── API_READ_ONLY.md
├── guardian/                  # Exports Guardian (frozen)
│   └── index.ts               # BUILD_PROOF: 644B1C521E645AEE71C135DD7FA04449CC65DBE118924984CEE8E626D8244EFE
├── tests/                     # Tests Guardian, E2E
└── build-proof/               # Artifacts BUILD_PROOF
    ├── BUILD_PROOF.md
    └── BUILD_PROOF.sig
```

---

## 3. CONTRATS FONCTIONNELS

### Documents contractuels
| Document | Description |
|----------|-------------|
| SCOPE.md | Périmètre IN/OUT, gouvernance P0 |
| CONTRACT.md | Engagements techniques et fonctionnels |
| GUARDIAN.md | Invariants métier G01-G10 |
| COMMANDS_EVENTS.md | Commands et Events autorisés |
| READ_MODELS.md | Projections de lecture |
| API_READ_ONLY.md | Endpoints GET uniquement |

### Engagements techniques
- **Latence** : < 100ms pour commandes simples
- **Throughput** : 1000+ opérations/sec
- **Disponibilité** : 99.9%
- **Couverture tests** : > 90% Guardian Layer

### Conformité réglementaire
- Référentiel comptable par défaut : **OHADA**
- Référentiels alternatifs : via adapters (PCG, IFRS)
- Aucune logique comptable dans le core

---

## 4. GUARDIAN ET RÈGLES MÉTIER

### 🛡️ Invariants Guardian (10 invariants G-*)

| Code | Invariant | Description |
|------|-----------|-------------|
| **G-01** | Unicité du tiers par tenant | Même identifiant légal = un seul tiers actif par tenant |
| **G-02** | Identité légale obligatoire | Nom/raison sociale ou identifiant légal requis |
| **G-03** | Rôles de tiers valides | Rôles doivent appartenir à la liste autorisée |
| **G-04** | Mutation exclusivement documentée | Toute création/modification via document validé |
| **G-05** | Séquentialité des états | `draft` → `validated` → `cancelled` |
| **G-06** | Gestion des statuts | ACTIVE → SUSPENDED (réversible) → ARCHIVED (irréversible) |
| **G-07** | Historique append-only | Aucun événement supprimé ou modifié |
| **G-08** | Isolation stricte multi-tenant | Aucun accès cross-tenant |
| **G-09** | Actor SPOFE obligatoire | Toute validation nécessite actorId valide |
| **G-10** | Aucune logique financière implicite | Refus explicite de champs financiers |

### ❌ Rejets explicites
- Création sans document
- Modification directe via API
- Réactivation d'un tiers archivé
- Ajout d'indicateur financier
- Suppression d'un tiers
- Fusion de tiers (hors v2+)

---

## 5. COMMANDS ET EVENTS

### 📥 Commands autorisées (4 Commands)

| Command | Description | Invariants |
|---------|-------------|------------|
| **CreateTier** | Créer un nouveau tiers | G-01, G-02, G-03, G-04, G-08, G-09 |
| **UpdateTier** | Modifier informations administratives | G-01, G-04, G-05, G-06, G-07, G-08, G-09 |
| **SuspendTier** | Suspendre un tiers | G-04, G-05, G-06, G-08, G-09 |
| **ArchiveTier** | Archiver définitivement | G-04, G-05, G-06, G-07, G-08, G-09 |

### 🔴 Commands interdites (v1.0.0)
- `DeleteTier`
- `MergeTier`
- `ReactivateTier` (pour ARCHIVED)
- `CloseTierAccount`
- Toute commande avec montants, soldes, échéances

### 📄 Documents tiers
| Document | États | Description |
|----------|-------|-------------|
| TierRecord | draft → validated → cancelled | Création du tiers |
| TierUpdateRecord | draft → validated → cancelled | Mise à jour |
| TierSuspensionRecord | draft → validated → cancelled | Suspension |
| TierArchiveRecord | draft → validated → cancelled | Archivage |

### 📤 Events émis (4 Events)

| Event | Payload | Description |
|-------|---------|-------------|
| **TierCreated** | tenantId, tierId, rôles, status=ACTIVE | Après validation TierRecord |
| **TierUpdated** | tenantId, tierId, champs modifiés | Après validation TierUpdateRecord |
| **TierSuspended** | tenantId, tierId, status=SUSPENDED, motif | Après validation TierSuspensionRecord |
| **TierArchived** | tenantId, tierId, status=ARCHIVED, motif | Après validation TierArchiveRecord |

### 🔗 Consommation inter-modules
Les autres modules peuvent **écouter** :
- `TierCreated`
- `TierUpdated`
- `TierSuspended`
- `TierArchived`

**Interdit** : Produire des événements tiers ou déclencher des commands.

---

## 6. API READ-ONLY

### Base path
`/api/tiers`

### 🟢 Endpoints autorisés

| Méthode | Endpoint | Description | Read-Model |
|---------|----------|-------------|------------|
| GET | `/api/tiers/{tierId}` | Vue synthétique d'un tiers | TierSummaryView |
| GET | `/api/tiers` | Liste avec filtres (role, status) | TierByRoleView, TierByStatusView |
| GET | `/api/tiers/{tierId}/contacts` | Coordonnées et contacts | TierContactView |
| GET | `/api/tiers/{tierId}/audit` | Historique événementiel | TierAuditView |
| GET | `/api/tiers/exists/{tierId}` | Vérifier existence | - |
| GET | `/api/tiers/{tierId}/status` | Statut uniquement | - |

### 🔴 Endpoints interdits
- `POST /api/tiers`
- `PUT /api/tiers/{id}`
- `PATCH /api/tiers/{id}`
- `DELETE /api/tiers/{id}`
- Tout endpoint avec montants, soldes, échéances

### Sécurité
- Scopage par `tenantId`
- Actor SPOFE authentifié requis
- Aucun accès cross-tenant
- Aucun accès anonyme

---

## 7. READ MODELS

### 🟢 Read-models exposés (5 vues)

| Code | Vue | Description | Source Events |
|------|-----|-------------|---------------|
| **RM-01** | TierSummaryView | Vue synthétique d'un tiers | TierCreated, TierUpdated, TierSuspended, TierArchived |
| **RM-02** | TierByRoleView | Liste par rôle | TierCreated, TierUpdated |
| **RM-03** | TierByStatusView | Liste par statut | TierCreated, TierSuspended, TierArchived |
| **RM-04** | TierContactView | Coordonnées | TierCreated, TierUpdated |
| **RM-05** | TierAuditView | Historique audit | Tous les events |

### 🚫 Données exclues des read-models
- Montants
- Soldes
- Échéances
- Indicateurs financiers
- Statuts comptables
- Données calculées (DSO, encours)

### Principes
- Dérivés exclusivement des événements
- Lecture seule
- Sans logique métier
- Reconstruisibles à 100% depuis l'event store
- Isolation stricte par tenant

---

## 8. STRUCTURE DU CODE (MISE À JOUR)

```
gestion-tiers/
├── src/
│   ├── domain/
│   │   ├── guardian/
│   │   │   ├── TierGuardian.ts           # Guardian principal (G01-G10)
│   │   │   └── GuardianContext.ts        # Contexte de validation
│   │   ├── model/
│   │   │   └── Tier.ts                   # Entité Tier
│   │   └── events/
│   │       └── (events du domaine)
│   ├── application/                      # Layer Application SPOFE P0
│   │   ├── commands/
│   │   │   ├── CreateTier.ts             # Command création
│   │   │   ├── UpdateTier.ts             # Command mise à jour
│   │   │   ├── SuspendTier.ts            # Command suspension
│   │   │   └── ArchiveTier.ts            # Command archivage
│   │   ├── handlers/
│   │   │   ├── CreateTierHandler.ts      # Handler création
│   │   │   ├── UpdateTierHandler.ts      # Handler mise à jour
│   │   │   ├── SuspendTierHandler.ts     # Handler suspension
│   │   │   ├── ArchiveTierHandler.ts     # Handler archivage
│   │   │   └── index.ts                  # Exports handlers
│   │   ├── ports/
│   │   │   ├── TierEventStorePort.ts     # Port event store
│   │   │   └── TierRepositoryPort.ts     # Port repository
│   │   └── wiring/
│   │       └── (module wiring)
│   ├── api/
│   │   ├── controllers/
│   │   └── dto/
│   ├── infrastructure/
│   │   └── repositories/
│   └── read-models/
│       ├── TierSummaryView.sql
│       ├── TierByRoleView.sql
│       ├── TierByStatusView.sql
│       ├── TierContactView.sql
│       └── TierAuditView.sql
├── contract/
│   ├── SCOPE.md
│   ├── CONTRACT.md
│   ├── GUARDIAN.md
│   ├── COMMANDS_EVENTS.md
│   ├── READ_MODELS.md
│   ├── API_READ_ONLY.md
│   └── gestion-tiers.openapi.json
├── guardian/
│   └── index.ts                          # Exports frozen + BUILD_PROOF signature
├── tests/
│   ├── guardian/
│   └── e2e/
└── build-proof/
    ├── BUILD_PROOF.md
    └── BUILD_PROOF.sig
```

### Application Layer détaillé

Le Application Layer suit strictement SPOFE P0 :

| Élément | Fichier | Description |
|---------|---------|-------------|
| **Commands** | `CreateTier.ts`, `UpdateTier.ts`, `SuspendTier.ts`, `ArchiveTier.ts` | DTOs d'entrée avec tenantId, actorId, payload |
| **Handlers** | `CreateTierHandler.ts`, `UpdateTierHandler.ts`, `SuspendTierHandler.ts`, `ArchiveTierHandler.ts` | Orchestration Guardian → Event Store |
| **Ports** | `TierEventStorePort.ts`, `TierRepositoryPort.ts` | Interfaces de persistance |

### Pattern Handler (exemple CreateTierHandler)

```typescript
// 1. Validation Guardian
this.guardian.validate(context);

// 2. Persistence event
await this.eventStore.append({
  type: 'TierCreated',
  tierId,
  tenantId: command.tenantId,
  actorId: command.actorId,
  timestamp: new Date().toISOString(),
  payload: command.payload
});
```

**Garanties :**
- ✅ Guardian appelé avant toute écriture
- ✅ Aucun calcul métier
- ✅ Aucun état interne
- ✅ Append-only respecté

### Guardian Layer

**BUILD_PROOF Signature :** `644B1C521E645AEE71C135DD7FA04449CC65DBE118924984CEE8E626D8244EFE`

Exporté via `guardian/index.ts` (frozen)

---

## 9. POUR CRÉER UNE VERSION SUPÉRIEURE

### Étape 1: Créer v2
```bash
mkdir -p cascade/modules/gestion-tiers-v2
cp -r cascade/modules/gestion-tiers/* cascade/modules/gestion-tiers-v2/
```

### Étape 2: Évolutions possibles v2+

| Type | Exemple | Impact |
|------|---------|--------|
| **Nouveau rôle** | Ajouter `PARTENAIRE` | Read-models à mettre à jour |
| **Nouveau statut** | `PENDING_VERIFICATION` | Guardian G-06 à modifier |
| **Fusion tiers** | `MergeTier` command | Nouveau event `TiersMerged` |
| **Vérification KYC** | Documents d'identité | Nouveau workflow |

### ⚠️ RÈGLES CRITIQUES

| Aspect | Règle |
|--------|-------|
| Guardian | 100% logique métier reste centralisée |
| Finance | Aucun champ financier dans le core |
| Référentiel | Rester référentiel-agnostique |
| API | GET uniquement pour read-models |
| RLS | Multi-tenant strict obligatoire |

### 📋 Checklist v2+
- [ ] Dossier gestion-tiers-v2/
- [ ] 10 invariants G-* maintenus ou versionnés
- [ ] Architecture SPOFE respectée
- [ ] Guardian 100% couverture
- [ ] 5 read-models SQL
- [ ] Tests E2E multi-tenant
- [ ] BUILD_PROOF.md + .sig valides
- [ ] Documentation contractuelle à jour

### 🔒 Contraintes immuables
- Aucune logique comptable dans le module
- Aucune suppression physique
- Append-only obligatoire
- Actor SPOFE obligatoire
- Isolation tenant stricte

---

**Module FROZEN — v1.0.0**  
**BUILD_PROOF :** `644B1C521E645AEE71C135DD7FA04449CC65DBE118924984CEE8E626D8244EFE`  
**SPOFE Certified | OHADA-first | P0 Governance** 🛡️👥
