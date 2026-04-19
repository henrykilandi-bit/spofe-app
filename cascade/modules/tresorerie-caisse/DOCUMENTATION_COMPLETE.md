# DOCUMENTATION COMPLÈTE — MODULE TRÉSORERIE-CAISSE

**Version:** v1.0.0 | **Statut:** ACTIF | **Module SPOFE P0**

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
Module de gestion des flux physiques d'espèces avec traçabilité complète, documents électroniques signés et contrôle des ouvertures, mouvements et clôtures de caisse.

### Positionnement
**Brique factuelle du socle économique SPOFE** — Source de vérité physique, pas financière. Référencé par les modules Comptabilité et Rapports.

### Responsabilités
- Traçabilité des flux physiques d'espèces
- Gestion des documents électroniques de caisse
- Contrôle des ouvertures, mouvements et clôtures
- Conservation append-only des faits
- Exposition d'états de lecture fiables

### Principe fondamental (non négociable)
**Aucun mouvement de trésorerie caisse n'existe sans document électronique validé et signé.**

### Périmètre (In Scope)
- Encaissements en espèces
- Décaissements en espèces
- Apports de fonds
- Sorties de caisse
- Avances et remboursements en espèces
- Constats d'écarts de caisse
- Documents : ouverture, mouvement, clôture, constat d'écart
- Caisse physique avec fonds et soldes

### Hors périmètre (Out of Scope)
- Génération d'écritures comptables
- Calculs comptables ou financiers
- Lettrage ou contreparties
- Rapprochements bancaires
- Gestion des chèques, cartes, virements
- Prévision de trésorerie
- Multi-devises
- Intégration matérielle (TPE, imprimantes)

---

## 2. ARCHITECTURE

### Principes fondamentaux
- **Document-first** — Aucun fait sans document
- **Signature obligatoire** — Aucun impact sans signature électronique
- **Append-only** — Aucun effacement ni modification
- **Séquentialité stricte** — Ouverture → Mouvements → Clôture
- **Isolement tenant** — Aucune opération cross-tenant
- **Traçabilité acteur** — Toute action est imputable

### Flux d'exécution
```
Command → Document (draft) → Validation → Signature → Event → Write DB → Read Models → API GET
```

### Cycle de vie d'une caisse
```
OUVERTURE → MOUVEMENTS (0..n) → CLÔTURE
     ↓                              ↓
   Période active              Période verrouillée
                              (définitive, non réouvrable)
```

### Structure canonique
```
tresorerie-caisse/
├── src/
│   ├── domain/
│   │   ├── guardian/          # Invariants G01-G12
│   │   ├── aggregates/        # CashRegister aggregate
│   │   ├── value-objects/     # Money, Period, etc.
│   │   └── events/            # Events du domaine
│   ├── application/
│   │   ├── handlers/          # Open, Close, RecordMovement
│   │   └── commands/          # Command definitions
│   ├── api/
│   │   └── controllers/       # GET endpoints
│   ├── infrastructure/
│   │   └── repositories/      # Persistence
│   └── read-models/           # Projections SQL
├── contract/                  # Documents contractuels
│   ├── SCOPE.md
│   ├── CONTRACT.md
│   ├── GUARDIAN.md
│   ├── COMMANDS_EVENTS.md
│   ├── READ_MODELS.md
│   └── API_READ_ONLY.md
├── tests/
│   ├── guardian/              # Tests invariants G01-G12
│   ├── e2e/                   # End-to-end tests
│   └── system/                # System tests
└── package.json
```

---

## 3. CONTRATS FONCTIONNELS

### Documents contractuels
| Document | Description |
|----------|-------------|
| SCOPE.md | Périmètre IN/OUT, gouvernance P0 |
| CONTRACT.md | Engagements techniques et fonctionnels |
| GUARDIAN.md | 12 invariants métier G01-G12 |
| COMMANDS_EVENTS.md | Commands et Events autorisés |
| READ_MODELS.md | Projections de lecture |
| API_READ_ONLY.md | Endpoints GET uniquement |

### Engagements techniques
- **Latence** : < 100ms pour commandes simples
- **Throughput** : 1000+ opérations/sec
- **Disponibilité** : 99.9%
- **Couverture tests Guardian** : > 90%

### Référentiel comptable
- Référentiel par défaut : **OHADA**
- Référentiels alternatifs : via adapters (PCG, IFRS)
- Core du module : **référentiel-agnostique**

---

## 4. GUARDIAN ET RÈGLES MÉTIER

### 🛡️ Invariants Guardian (12 invariants G-*)

| Code | Invariant | Description |
|------|-----------|-------------|
| **G01** | Existence caisse valide | Aucune opération sans caisse existante/active |
| **G02** | Ouverture préalable obligatoire | Aucun mouvement sans caisse ouverte |
| **G03** | Unicité ouverture par période | Une seule ouverture active à la fois |
| **G04** | Document électronique obligatoire | Document validé et signé électroniquement |
| **G05** | Identification acteur | Tout document doit avoir actorId valide |
| **G06** | Séquentialité des opérations | OUVERTURE → MOUVEMENTS → CLÔTURE |
| **G07** | Période clôturée verrouillée | Période clôturée = définitivement verrouillée |
| **G08** | Typologie valide des mouvements | Montant > 0, typé ENTRÉE ou SORTIE |
| **G09** | Constat d'écart uniquement à la clôture | Écart = fait documenté à la clôture uniquement |
| **G10** | Isolation stricte par tenant | Caisse, documents, opérations = même tenant |
| **G11** | Immutabilité post-signature | Document signé = non modifiable, non annulable |
| **G12** | Aucune logique comptable | Pas d'écriture, compte ou solde comptable |

### ❌ Décisions Guardian explicites

| Situation | Décision |
|-----------|----------|
| Mouvement sans document signé | ❌ **REJET** |
| Mouvement hors caisse ouverte | ❌ **REJET** |
| Document sans actorId | ❌ **REJET** |
| Modification après signature | ❌ **REJET** |
| Écart hors clôture | ❌ **REJET** |
| Tentative comptable | ❌ **REJET** |

---

## 5. COMMANDS ET EVENTS

### 📥 Commands autorisées

| Command | Description | Invariants |
|---------|-------------|------------|
| **OpenCashRegister** | Ouverture de caisse | G01, G03, G04, G05, G10 |
| **RecordCashMovement** | Enregistrer mouvement | G01-G08, G10, G11 |
| **CloseCashRegister** | Clôture de caisse | G01, G02, G04-G07, G09-G11 |
| **RecordCashDiscrepancy** | Constat d'écart | G04, G07, G09, G11 |

### 📄 Documents de caisse

| Document | États | Description |
|----------|-------|-------------|
| CashOpeningDocument | draft → validated → signed | Ouverture de caisse |
| CashMovementDocument | draft → validated → signed | Mouvement entrée/sortie |
| CashClosingDocument | draft → validated → signed | Clôture de caisse |
| DiscrepancyDocument | draft → validated → signed | Constat d'écart |

### 📤 Events émis

| Event | Description | Source |
|-------|-------------|--------|
| **CashRegisterOpened** | Caisse ouverte | CashOpeningDocument signé |
| **CashMovementRecorded** | Mouvement enregistré | CashMovementDocument signé |
| **CashRegisterClosed** | Caisse clôturée | CashClosingDocument signé |
| **CashDiscrepancyRecorded** | Écart constaté | DiscrepancyDocument signé |

---

## 6. API READ-ONLY

### Base path
`/api/cash-register`

### 🟢 Endpoints autorisés

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/cash-register/{id}` | État d'une caisse |
| GET | `/api/cash-register/{id}/journal` | Journal des mouvements |
| GET | `/api/cash-register/{id}/balance` | Solde théorique à date |
| GET | `/api/cash-registers` | Liste des caisses par tenant |
| GET | `/api/cash-register/{id}/discrepancies` | Historique des écarts |

### 🔴 Endpoints interdits
- `POST /api/cash-register` (direct)
- `PUT /api/cash-register/{id}`
- `DELETE /api/cash-register/{id}`
- Tout endpoint avec écritures comptables

---

## 7. READ MODELS

### 🟢 Read-models exposés

| Vue | Description | Source Events |
|-----|-------------|---------------|
| **CashJournalView** | Journal chronologique des mouvements | CashMovementRecorded |
| **CashBalanceView** | Solde théorique calculé | Tous les events |
| **CashRegisterStatusView** | État actuel de la caisse | Tous les events |
| **CashDiscrepancyHistoryView** | Historique des écarts | CashDiscrepancyRecorded |
| **CashClosingHistoryView** | Historique des clôtures | CashRegisterClosed |

### Principes
- Dérivés exclusivement des événements
- Lecture seule
- Sans logique métier
- Reconstruisibles depuis l'event store
- Isolation stricte par tenant

---

## 8. STRUCTURE DU CODE

```
tresorerie-caisse/
├── src/
│   ├── domain/
│   │   ├── guardian/
│   │   │   └── CashRegisterGuardian.ts    # G01-G12
│   │   ├── aggregates/
│   │   │   └── CashRegister.ts
│   │   ├── value-objects/
│   │   │   ├── Money.ts
│   │   │   └── Period.ts
│   │   └── events/
│   │       ├── CashRegisterOpened.ts
│   │       ├── CashMovementRecorded.ts
│   │       ├── CashRegisterClosed.ts
│   │       └── CashDiscrepancyRecorded.ts
│   ├── application/
│   │   ├── handlers/
│   │   │   ├── OpenCashRegisterHandler.ts
│   │   │   ├── RecordCashMovementHandler.ts
│   │   │   ├── CloseCashRegisterHandler.ts
│   │   │   └── RecordCashDiscrepancyHandler.ts
│   │   └── commands/
│   │       └── (command definitions)
│   ├── api/
│   │   └── controllers/
│   │       └── CashRegisterQueryController.ts
│   ├── infrastructure/
│   │   └── repositories/
│   │       └── CashRegisterRepository.ts
│   └── read-models/
│       ├── CashJournalView.sql
│       ├── CashBalanceView.sql
│       └── CashRegisterStatusView.sql
├── contract/
│   ├── SCOPE.md
│   ├── CONTRACT.md
│   ├── GUARDIAN.md
│   ├── COMMANDS_EVENTS.md
│   ├── READ_MODELS.md
│   └── API_READ_ONLY.md
├── tests/
│   ├── guardian/
│   │   └── CashRegisterGuardian.spec.ts   # 24 tests (12 x 2)
│   ├── e2e/
│   └── system/
└── package.json
```

---

## 9. POUR CRÉER UNE VERSION SUPÉRIEURE

### Étape 1: Créer v2
```bash
mkdir -p cascade/modules/tresorerie-caisse-v2
cp -r cascade/modules/tresorerie-caisse/* cascade/modules/tresorerie-caisse-v2/
```

### Étape 2: Évolutions possibles v2+

| Type | Exemple | Impact |
|------|---------|--------|
| **Multi-caisse** | Gestion centralisée de plusieurs caisses | Nouveaux invariants |
| **Transferts inter-caisses** | Mouvements entre caisses | Nouveau event |
| **Intégration TPE** | Paiement par carte | Adapter G04 |
| **Multi-devises** | Gestion de plusieurs devises | Nouveau value object |

### ⚠️ RÈGLES CRITIQUES

| Aspect | Règle |
|--------|-------|
| Guardian | 100% logique métier reste centralisée |
| Documents | Aucun mouvement sans document signé |
| Séquentialité | OUVERTURE → MOUVEMENTS → CLÔTURE respectée |
| Immutabilité | Document signé = non modifiable |
| Finance | Aucune écriture comptable dans le module |
| RLS | Multi-tenant strict obligatoire |

### 📋 Checklist v2+
- [ ] Dossier tresorerie-caisse-v2/
- [ ] 12 invariants G-* maintenus ou versionnés
- [ ] Architecture SPOFE respectée
- [ ] Guardian 100% couverture (24 tests)
- [ ] 5 read-models SQL
- [ ] Tests E2E multi-tenant
- [ ] BUILD_PROOF.md + .sig générés
- [ ] Documentation contractuelle à jour

### 🔒 Contraintes immuables
- Aucun mouvement sans document signé
- Aucune modification post-signature
- Append-only obligatoire
- Actor SPOFE obligatoire
- Isolation tenant stricte
- Pas de logique comptable

---

**Module ACTIF — v1.0.0**  
**SPOFE P0 | OHADA-first | Document-first** 🛡️💰
