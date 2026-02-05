# DOCUMENTATION COMPLÈTE — MODULE GESTION-STOCKS
**Version:** v1.0.0 | **Statut:** FROZEN | **Module SPOFE Certifié**

---

## 📋 TABLE DES MATIÈRES

1. [Vue d'ensemble](#1-vue-densemble)
2. [Architecture](#2-architecture)
3. [Contrats fonctionnels](#3-contrats-fonctionnels)
4. [Guardian et règles métier](#4-guardian-et-règles-métier)
5. [API Read-Only](#5-api-read-only)
6. [Read Models](#6-read-models)
7. [Structure du code](#7-structure-du-code)
8. [Pour créer une version supérieure](#8-pour-créer-une-version-supérieure)

---

## 1. VUE D'ENSEMBLE

### Objectif
Module SPOFE responsable de la **traçabilité et du contrôle des quantités physiques** de stock en environnement multi-tenant et multi-dépôts.

### Périmètre (In Scope)
- Gestion des quantités physiques
- Multi-dépôts
- Catégories de stock
- Documents de stock (validation obligatoire)
- Mouvements physiques (entrées, sorties, transferts, ajustements)
- Traçabilité complète (append-only)

### Hors périmètre (Out of Scope)
- Calcul de prix/côuts
- Valorisation financière
- Comptabilisation
- Budgets, Production, MRP
- Prévisions intelligentes

---

## 2. ARCHITECTURE

### Principes
- DDD (Domain-Driven Design)
- CQRS strict
- Guardian-centric
- Read-only API
- Append-only events
- Isolation par tenant

### Structure canonique
```
cascade/modules/gestion-stocks/
├── contract/           # Documents normatifs
├── src/
│   ├── api/           # GET uniquement
│   ├── application/   # Commands, Handlers, Events
│   ├── domain/        # Agrégats, Guardian
│   ├── infrastructure/# Repositories
│   └── sql/           # Migrations, vues SQL
├── tests/             # Unit, integration, e2e
├── experimental/      # Hors périmètre
└── BUILD_PROOF.md     # Preuve de conformité
```

---

## 3. CONTRATS FONCTIONNELS

### Documents obligatoires
Aucun mouvement sans document validé:

| Type | Documents |
|------|-----------|
| Approvisionnement | Bon de commande fournisseur, Bon de réception, Bon d'entrée |
| Sorties | Bon de commande client, Bon de livraison, Bon de sortie |
| Transferts | État de besoin, Bon de transfert, Bon sortie/entrée |
| Inventaires | Bon d'inventaire |

### Catégories de stock
- Marchandises
- Produits finis
- Matières premières
- Emballages perdus
- Emballages récupérables
- Autres stocks

---

## 4. GUARDIAN ET RÈGLES MÉTIER

### Invariants P0 (Non négociables)

| Code | Règle |
|------|-------|
| STOCK-INV-001 | Aucun mouvement sans document validé |
| STOCK-INV-002 | Aucun document sans acteur identifié |
| STOCK-INV-003 | Séquentialité documentaire obligatoire |
| STOCK-INV-004 | Pas de mouvement cross-tenant |
| STOCK-INV-005 | Stock obligatoirement rattaché à un dépôt |
| STOCK-INV-006 | Historique append-only (pas de modif/suppression) |
| STOCK-INV-007 | Types autorisés: Entrée, Sortie, Transfert, Ajustement |

### Transferts internes
- Dépôts source et destination distincts obligatoires
- Double mouvement: sortie source + entrée destination

### Inventaires
- Ajustements uniquement via bon d'inventaire validé
- Traçabilité complète de l'écart

---

## 5. API READ-ONLY

### Endpoints GET

| Endpoint | Description | Read Model |
|----------|-------------|------------|
| `GET /api/stocks/depot/{depotId}` | Stock par dépôt | view_stock_by_depot |
| `GET /api/stocks/category/{category}` | Stock par catégorie | view_stock_by_category |
| `GET /api/stocks/product/{productId}` | Stock par produit | view_stock_by_product |
| `GET /api/stocks/movements` | Historique mouvements | view_stock_movements |
| `GET /api/stocks/alerts` | Alertes de seuil | Dérivé |

### Format de réponse standard
```json
{
  "data": [],
  "metadata": {
    "module": "gestion-stocks",
    "version": "v1.0.0",
    "generatedAt": "ISO-8601"
  }
}
```

---

## 6. READ MODELS

### Vue SQL — Stock par dépôt
```sql
CREATE VIEW view_stock_by_depot AS
SELECT tenant_id, depot_id, product_id, category, SUM(quantity) AS total_quantity
FROM stock_movements
GROUP BY tenant_id, depot_id, product_id, category;
```

### Vue SQL — Stock par catégorie
```sql
CREATE VIEW view_stock_by_category AS
SELECT tenant_id, category, product_id, SUM(quantity) AS total_quantity
FROM stock_movements
GROUP BY tenant_id, category, product_id;
```

### Vue SQL — Stock par produit
```sql
CREATE VIEW view_stock_by_product AS
SELECT tenant_id, product_id, SUM(quantity) AS total_quantity
FROM stock_movements
GROUP BY tenant_id, product_id;
```

### Vue SQL — Historique mouvements
```sql
CREATE VIEW view_stock_movements AS
SELECT movement_id, tenant_id, depot_id, product_id, category, 
       movement_type, quantity, document_id, occurred_at
FROM stock_movements
ORDER BY occurred_at ASC;
```

---

## 7. STRUCTURE DU CODE

### Couche API (`src/api/`)
- Exposition REST GET uniquement
- Mapping DTO → Read Models
- Sécurité (auth, tenant scoping)
- **Interdit:** logique métier, validation, écriture

### Couche Application (`src/application/`)
- Orchestration Commands
- Publication Events
- Coordination transactionnelle
- Appel Guardian
- **Interdit:** règles métier, calculs

### Couche Domaine (`src/domain/`)
- Agrégats DDD
- Guardian Stock (100% logique métier)
- Invariants métier
- Domain Events

### Couche Infrastructure (`src/infrastructure/`)
- Persistance événements
- Repositories
- Accès base de données
- **Interdit:** règles métier

### Couche SQL (`src/sql/`)
- Migrations DDL
- Vues SQL Read Models
- Indexation
- **Interdit:** triggers métier, logique conditionnelle

---

## 8. POUR CRÉER UNE VERSION SUPÉRIEURE

### Étape 1: Créer la nouvelle version
```bash
# Créer le nouveau module
mkdir -p cascade/modules/gestion-stocks-v2

# Copier depuis le Golden Module ou v1
cp -r cascade/modules/immobilisation/* cascade/modules/gestion-stocks-v2/
# OU
cp -r cascade/modules/gestion-stocks/* cascade/modules/gestion-stocks-v2/
```

### Étape 2: Renommer et adapter
```bash
cd cascade/modules/gestion-stocks-v2

# Renommer les fichiers
find . -name "*immobilisation*" -exec rename 's/immobilisation/gestion-stocks-v2/' {} \;

# Adapter les références dans le code
sed -i 's/immobilisation/gestion-stocks-v2/g' $(grep -rl "immobilisation" .)
```

### Étape 3: Mettre à jour les contrats

Modifier les fichiers dans `contract/`:
1. **SCOPE.md** — Définir le nouveau périmètre
2. **ARCHITECTURE.md** — Adapter si changements structuraux
3. **CONTRACT.md** — Nouvelles responsabilités fonctionnelles
4. **GUARDIAN.md** — Nouveaux invariants métier
5. **READ_MODELS.md** — Nouvelles vues SQL
6. **API_READ_ONLY.md** — Nouveaux endpoints GET

### Étape 4: Implémenter le code
```
src/
├── api/              # Nouveaux endpoints GET
├── application/      # Nouvelles Commands/Events
├── domain/           # Guardian v2
├── infrastructure/   # Nouveaux repositories
└── sql/              # Nouvelles migrations/vues
```

### Étape 5: Tests obligatoires
- Tests Guardian: **100% couverture**
- Tests globaux: **≥ 80% couverture**
- Tests unitaires
- Tests intégration
- Tests e2e
- Tests contract

### Étape 6: Générer BUILD_PROOF
```bash
# Générer le BUILD_PROOF
node spofe/tools/build-proof/generate-build-proof.ts

# Signer cryptographiquement
node spofe/tools/build-proof/sign-build-proof.ts
```

### Étape 7: Valider SPOFE
```bash
# Validation complète
node spofe/tools/validate-module/spofe-validate-module.ts
```

### ⚠️ RÈGLES CRITIQUES POUR V2

| Aspect | V1 | V2+ |
|--------|-----|-----|
| Périmètre | Physique uniquement | Peut étendre si justifié |
| Guardian | Invariants P0 | Peut ajouter P1, P2 |
| API | 5 endpoints GET | Peut ajouter GET |
| Read Models | 4 vues | Peut ajouter vues |
| **Interdit** | — | POST/PUT/PATCH/DELETE |
| **Interdit** | — | Logique métier hors Guardian |
| **Interdit** | — | Calculs financiers |

### 📋 Checklist création v2

- [ ] Nouveau dossier `gestion-stocks-v2/`
- [ ] 8 fichiers contractuels mis à jour
- [ ] Architecture DDD/CQRS respectée
- [ ] Guardian implémenté (100% logique métier)
- [ ] API GET uniquement
- [ ] Read Models en vues SQL
- [ ] Tests ≥ 80% (Guardian 100%)
- [ ] BUILD_PROOF.md généré
- [ ] BUILD_PROOF.sig valide
- [ ] Validation SPOFE passante

---

## 📚 RÉFÉRENCES

| Document | Chemin |
|----------|--------|
| Ce document | `cascade/modules/gestion-stocks/DOCUMENTATION_COMPLETE.md` |
| Template SPOFE | `spofe/governance/TEMPLATE_MODULE_SPOFE.md` |
| Guide gouvernance | `spofe/governance/GUIDE_GOUVERNANCE_SPOFE.md` |
| Règles conduite | `spofe/governance/REGLES_CONDUITE_SPOFE.md` |
| Golden Module | `cascade/modules/immobilisation/` |

---

**Module FROZEN — v1.0.0**  
Toute modification nécessite une nouvelle version majeure (v2+).

**SPOFE Certified** 🔒
