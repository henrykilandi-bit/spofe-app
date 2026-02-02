# Module Template — module.manifest.md

Ce fichier est un **template obligatoire** pour tout module frontend SPOFE-clean.

Copier ce fichier et adapter les sections pour votre module.

---

## Exemple : Budgeting Module

```yaml
# ============================================================================
# SPOFE Frontend Module Manifest
# ============================================================================

module: budgeting
description: Module de gestion budgétaire

# ============================================================================
# Contrat SPOFE
# ============================================================================

contractVersion: 1.0.0
# Doit correspondre à la version déclarée dans :
# contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md

# ============================================================================
# Read-Models consommés
# ============================================================================
# Les seules données que ce module peut lire du SPOFE Backend

readModels:
  - /read/aggregates/active
    description: "Agrégats actifs dans le système"
    
  - /read/aggregates/balance
    description: "Soldes des agrégats"
    
  - /read/aggregates/history
    description: "Historique des agrégats"

# ============================================================================
# Commands émises
# ============================================================================
# Les seules intentions que ce module peut émettre au SPOFE Backend

commands:
  - CreateAggregate
    description: "Créer un nouvel agrégat"
    
  - CloseAggregate
    description: "Fermer un agrégat existant"
    
  - UpdateBalance
    description: "Mettre à jour le solde d'un agrégat"
    
  - AddTransaction
    description: "Enregistrer une transaction"

# ============================================================================
# Invariants Guardian impactants
# ============================================================================
# Informatif : quels invariants ce module doit respecter

guardianInvariants:
  - AggregateBalance: "Le solde doit toujours être >= 0"
  - TransactionOrder: "Les transactions doivent être ordonnées par timestamp"
  - CloseAggregate: "Un agrégat fermé ne peut pas être réouvert"

# ============================================================================
# Métadonnées
# ============================================================================

version: 1.0.0
author: SPOFE Team
maintainer: @your-team
createdAt: 2026-01-30

# ============================================================================
# Tests contractuels
# ============================================================================
# Emplacement : tests/module.contract.spec.ts

tests:
  - type: "command-validation"
    description: "Les Commands non déclarées sont refusées"
    
  - type: "read-model-validation"
    description: "Les read-models non déclarés sont refusés"
    
  - type: "contract-bootstrap"
    description: "Le module échoue sans bootstrap du contrat"

# ============================================================================
# Structure de fichiers
# ============================================================================
# Conforme à SPOFE Frontend Module Contract v1.0.0

structure:
  root: "modules/budgeting"
  files:
    - module.manifest.md
    - index.ts
    - api/module.api.ts
    - ui/ModuleView.tsx
    - ui/module.ui.ts
    - routes/module.routes.ts
    - hooks/useModuleUI.ts
    - tests/module.contract.spec.ts

# ============================================================================
# Notes additionnelles
# ============================================================================

notes: |
  Ce module consume les read-models du domain Aggregate.
  Il émet des Commands au Guardian pour validation métier.
  
  Tous les appels réseau passent par le Frontend Contract Enforcer (FCE).
  Aucune exception.
```

---

## 🔴 Checklist de validation

Avant de soumettre votre module :

- [ ] ✅ `contractVersion` est déclaré
- [ ] ✅ `readModels` sont listés et décrits
- [ ] ✅ `commands` sont listés et décrits
- [ ] ✅ `guardianInvariants` sont documentés (informatif)
- [ ] ✅ `tests` sont présents dans `tests/module.contract.spec.ts`
- [ ] ✅ Structure de fichiers exacte (cf. contrat)
- [ ] ✅ Tous les `readModels` sont consommés via le FCE
- [ ] ✅ Toutes les `commands` sont émises via le FCE
- [ ] ✅ Aucun `fetch()`, `axios`, ou appel réseau direct

---

## 📚 Référence

| Document | Lien |
|----------|------|
| Contrat Frontend Module | [SPOFE-Frontend-Module-Contract.v1.md](../../contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md) |
| CI Enforcement | [frontend-ci-enforcement.md](../frontend-ci-enforcement.md) |
| CI Scripts | [README.md](../README.md) |

---

## ✅ Status

Ce template est :
- ✅ Conforme au contrat v1.0.0
- ✅ Supporté par les checks CI
- ✅ Obligatoire pour tout module frontend

**Adaptation requise avant intégration.**

---

**Version :** 1.0.0  
**Date :** 2026-01-30  
**Statut :** ACTIVE
