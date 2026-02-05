# DOCUMENTATION COMPLÈTE — MODULE IMMOBILISATION (GOLDEN MODULE)
**Version:** v2.1.0 | **Statut:** FROZEN | **Golden Module SPOFE**

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
Module **Golden Module SPOFE** — Registre patrimonial unique de vérité pour les actifs immobilisés.

### Responsabilités
- Gestion du cycle de vie des immobilisations (acquisition → amortissement → sortie)
- Calcul et historisation des amortissements
- Traçabilité des coûts réels
- Alimentation des modules Cost-Structure et Budget

### Périmètre (In Scope)
- Immobilisations avec coût, durée, méthode d'amortissement
- Calcul des dotations (linéaire v1)
- Valeur nette comptable (VNC)
- Date de renouvellement prévisionnelle
- Affectation aux produits/services/projets
- Suivi des coûts de maintenance réels
- Cession et déclassement

### Hors périmètre (Out of Scope)
- Amortissement dégressif
- Maintenance prédictive
- Inventaire mobile (QR/RFID)
- Analytics multi-scénarios

---

## 2. ARCHITECTURE

### Principes fondamentaux
- **CQRS strict** — Séparation write/read
- **Guardian central** — 100% logique métier dans le Guardian
- **Architecture contractuelle** — Code = implémentation du contrat
- **Multi-tenant** — Isolation stricte

### Flux d'exécution
```
Command → Handler → Guardian (invariants) → Events → Write DB → Read Models SQL → API GET
```

### Structure canonique
```
cascade/modules/immobilisation/
├── api/               # Controllers GET uniquement
├── application/       # Commands, Handlers, Events
├── domain/            # Aggregates, Guardian, Invariants
├── infrastructure/    # Repositories (write/read)
├── sql/               # Migrations, vues SQL
├── tests/             # Unit, integration, e2e, contract
├── contract/          # Documents normatifs
└── BUILD_PROOF.md
```

---

## 3. CONTRATS FONCTIONNELS

### Documents contractuels
| Document | Description |
|----------|-------------|
| SCOPE.md | Périmètre contractuel IN/OUT |
| CONTRACT.md | Contrat fonctionnel complet |
| ARCHITECTURE.md | Architecture normative |
| GUARDIAN.md | Invariants métier |
| COMMANDS_EVENTS.md | DTOs et mapping |
| READ_MODELS.md | Vues SQL contractuelles |
| API_READ_ONLY.md | Spécification API HTTP |

### Modèle de domaine
**Aggregate racine:** Immobilisation (Asset)
- Responsabilités: actif patrimonial, règles d'amortissement

**Sous-ensembles:**
- DepreciationRecord: dotations historisées
- AssetAllocation: ventilation produit/projet
- MaintenanceRecord: coûts réels

---

## 4. GUARDIAN ET RÈGLES MÉTIER

### Commands gérées (10 commands)
| Command | Description |
|---------|-------------|
| CreateAsset | Créer une immobilisation |
| UpdateRenewalInfo | Modifier date/coût renouvellement |
| CreateAllocation | Affecter à produit/projet |
| EndAllocation | Terminer une allocation |
| ReallocateAsset | Réallouer complètement |
| RecordDepreciation | Enregistrer une dotation |
| CalculateDepreciations | Batch calcul (Guardian only) |
| RecordMaintenance | Tracer maintenance réelle |
| DisposeAsset | Céder l'actif |
| DecommissionAsset | Déclasser l'actif |

### Invariants métier (extraits)
- **IMM-ASS-01:** acquisitionCost > 0
- **IMM-ASS-02:** usefulLife > 0
- **IMM-ASS-03:** residualValue >= 0
- **IMM-ASS-04:** acquisitionDate <= now
- **IMM-ASS-05:** asset.status = IN_SERVICE (pour modifications)
- **IMM-ALL-01:** 0 < percentage <= 100
- **IMM-ALL-02:** somme allocations = 100%
- **IMM-DEP-04:** VNC après dotation >= residualValue

### Calcul amortissement (linéaire)
```
monthlyDepreciation = (acquisitionCost - residualValue) / usefulLifeMonths
```

---

## 5. COMMANDS ET EVENTS

### Command → Guardian → Event mapping
| Command | Guardian | Event |
|---------|----------|-------|
| CreateAssetCommand | validate rules IMM-ASS-* | AssetCreatedEvent |
| UpdateRenewalInfoCommand | validate IMM-ASS-05, IMM-REN-* | RenewalInfoUpdatedEvent |
| AllocateAssetCommand | validate IMM-ALL-* | AssetAllocatedEvent |
| RecordDepreciationCommand | validate IMM-DEP-* | DepreciationRecordedEvent |
| RecordMaintenanceCommand | validate IMM-MNT-* | MaintenanceRecordedEvent |
| DisposeAssetCommand | validate IMM-DIS-* | AssetDisposedEvent |

### Sources d'Events (7 Events)
- AssetCreatedEvent
- RenewalInfoUpdatedEvent
- AssetAllocatedEvent
- DepreciationRecordedEvent
- MaintenanceRecordedEvent
- AssetDisposedEvent
- AssetDecommissionedEvent

---

## 6. API READ-ONLY

### Principes
- GET uniquement
- Read-models SQL exclusivement
- Multi-tenant obligatoire (X-Tenant-Id)
- Pagination obligatoire

### Endpoints principaux
| Endpoint | Read Model | Description |
|----------|------------|-------------|
| GET /api/immobilisation/assets | rm_assets_current | Liste immobilisations |
| GET /api/immobilisation/assets/{id} | multiple views | Détail complet |
| GET /api/immobilisation/assets/net-book-value | rm_asset_net_book_value | VNC courante |
| GET /api/immobilisation/depreciations | rm_depreciation_schedule | Plan amortissement |
| GET /api/immobilisation/allocations | rm_allocation_effective | Affectations |
| GET /api/immobilisation/maintenance | rm_maintenance_costs | Maintenance réelle |
| GET /api/immobilisation/renewals | rm_renewal_projection | Renouvellements |

### Headers obligatoires
```http
Authorization: Bearer <token>
X-Tenant-Id: <tenantId>
```

---

## 7. READ MODELS

### Vue SQL — État courant
```sql
CREATE VIEW rm_assets_current AS
SELECT asset_id, tenant_id, acquisition_cost, currency,
       acquisition_date, useful_life_months, depreciation_method,
       residual_value, renewal_date, replacement_cost, status
FROM assets;
```

### Vue SQL — Historique amortissements
```sql
CREATE VIEW rm_asset_depreciation_history AS
SELECT asset_id, tenant_id, period, depreciation_amount,
       accumulated_depreciation, net_book_value
FROM depreciation_schedule;
```

### Liste des Read Models (11 vues)
| Vue | Usage |
|-----|-------|
| rm_assets_current | Liste actifs |
| rm_asset_depreciation_history | Historique dotations |
| rm_asset_net_book_value | VNC calculée |
| rm_asset_allocation_effective | Affectations actives |
| rm_asset_maintenance_history | Historique maintenance |
| rm_depreciation_schedule | Plan complet |
| rm_allocation_summary | Résumé ventilations |
| rm_maintenance_costs | Coûts maintenance |
| rm_renewal_projection | Projections renouvellement |
| rm_disposed_assets | Actifs cédés |
| rm_cost_structure_input | Alimentation Cost-Structure |

---

## 8. STRUCTURE DU CODE

### Couche API (`api/`)
- Controllers GET uniquement
- Mapping DTO → Read Models
- Sécurité (auth, tenant scoping)
- **Interdit:** logique métier, validation, écriture

### Couche Application (`application/`)
- Commands DTOs
- Handlers (orchestration)
- Events
- Appel Guardian obligatoire
- **Interdit:** règles métier, calculs

### Couche Domaine (`domain/`)
- Aggregates DDD
- Guardian (100% logique métier)
- Invariants
- Value Objects
- Domain Events

### Couche Infrastructure (`infrastructure/`)
- Repositories write/read
- Persistance événements
- Accès base de données
- **Interdit:** règles métier

### Couche SQL (`sql/`)
- Migrations DDL
- Vues SQL Read Models
- Indexation
- **Interdit:** triggers métier

---

## 9. POUR CRÉER UNE VERSION SUPÉRIEURE

### Étape 1: Créer la nouvelle version
```bash
mkdir -p cascade/modules/immobilisation-v3
cp -r cascade/modules/immobilisation/* cascade/modules/immobilisation-v3/
```

### Étape 2: Mettre à jour les contrats
Modifier dans `contract/`:
1. SCOPE.md — Nouveau périmètre
2. CONTRACT.md — Nouvelles responsabilités
3. ARCHITECTURE.md — Si changements structuraux
4. GUARDIAN.md — Nouveaux invariants
5. COMMANDS_EVENTS.md — Nouvelles Commands/Events
6. READ_MODELS.md — Nouvelles vues
7. API_READ_ONLY.md — Nouveaux endpoints

### Étape 3: Implémenter le code
```
src/
├── api/              # Nouveaux endpoints GET
├── application/      # Nouvelles Commands/Events
├── domain/           # Guardian v3
├── infrastructure/   # Nouveaux repositories
└── sql/              # Nouvelles migrations/vues
```

### Étape 4: Tests obligatoires
- Guardian: **100% couverture**
- Global: **≥ 80% couverture**

### Étape 5: BUILD_PROOF
```bash
node spofe/tools/build-proof/generate-build-proof.ts
node spofe/tools/build-proof/sign-build-proof.ts
node spofe/tools/validate-module/spofe-validate-module.ts
```

### ⚠️ RÈGLES CRITIQUES POUR V3+

| Aspect | Règle |
|--------|-------|
| API | GET uniquement (pas de mutation) |
| Guardian | 100% logique métier centralisée |
| Finance | Pas de simulation/comptabilisation |
| Tests | Guardian 100%, global ≥ 80% |

### 📋 Checklist création v3+

- [ ] Dossier `immobilisation-v3/`
- [ ] 7+ fichiers contractuels mis à jour
- [ ] Architecture DDD/CQRS respectée
- [ ] Guardian implémenté (100% logique métier)
- [ ] API GET uniquement
- [ ] Read Models en vues SQL
- [ ] Tests ≥ 80% (Guardian 100%)
- [ ] BUILD_PROOF.md + .sig valides

---

## 📚 RÉFÉRENCES

| Document | Chemin |
|----------|--------|
| Ce document | `cascade/modules/immobilisation/DOCUMENTATION_COMPLETE.md` |
| Template SPOFE | `spofe/governance/TEMPLATE_MODULE_SPOFE.md` |
| Guide gouvernance | `spofe/governance/GUIDE_GOUVERNANCE_SPOFE.md` |
| Règles conduite | `spofe/governance/REGLES_CONDUITE_SPOFE.md` |

---

**Golden Module FROZEN — v2.1.0**
**SPOFE Certified** 🔒🏆
