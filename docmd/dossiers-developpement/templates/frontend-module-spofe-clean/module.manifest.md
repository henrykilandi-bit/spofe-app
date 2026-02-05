# Module Manifest

**OBLIGATOIRE** — Ce fichier définit le contrat du module.

---

## Métadonnées du module

```yaml
module: <module-name>
description: <short description of module purpose>
```

### Exemple
```yaml
module: budgeting
description: Budget management and tracking module
```

---

## Contrat SPOFE

```yaml
contract:
  frontendModuleContract: 1.0.0
  frontendBackendContract: 1.0.0
```

⚠️ **OBLIGATOIRE** — Doit toujours correspondre aux versions du système.

---

## Read-Models consommés

```yaml
readModels:
  - /read/aggregates/active
    description: "Active aggregates in the system"
  
  - /read/aggregates/balance
    description: "Current balances"
```

### Règles
- ✅ Lister TOUS les read-models consommés
- ✅ Chaque read-model doit être accessible via le backend
- ❌ Pas de read-models privés/cachés
- ❌ Pas d'accès direct à la DB

---

## Commands émises

```yaml
commands:
  - CreateAggregate
    description: "Create a new aggregate"
  
  - CloseAggregate
    description: "Close an existing aggregate"
```

### Règles
- ✅ Lister TOUS les Commands émis
- ✅ Chaque Command doit être validée par Guardian
- ❌ Pas de Commands non déclarées
- ❌ Pas de manipulation d'état backend directe

---

## Invariants Guardian (informatif)

```yaml
guardianInvariants:
  - AggregateBalance: "Balance must always be >= 0"
  - TransactionOrder: "Transactions must be ordered by timestamp"
  - CloseAggregate: "A closed aggregate cannot be reopened"
```

### Notes
- Informatif seulement (ce module ne les enforce pas)
- Énumère les contraintes métier que le backend garantit
- Aide à comprendre les limites du module

---

## Propriété & Responsabilité

```yaml
owner: "@budgeting-team"
status: ACTIVE
createdAt: 2026-01-30
maintainers:
  - "@dev1"
  - "@dev2"
```

---

## Version du module

```yaml
version: 1.0.0
```

---

## Notes additionnelles

```yaml
notes: |
  Ce module consomme les read-models du domain Aggregate.
  Il émet des Commands au Guardian pour validation métier.
  
  Tous les appels réseau passent par le Frontend Contract Enforcer.
  Aucune exception.
```

---

## ✅ Checklist de validation

Avant de soumettre votre module :

- [ ] `module` est défini (nom du module)
- [ ] `contract.frontendModuleContract` = 1.0.0
- [ ] `contract.frontendBackendContract` = 1.0.0
- [ ] `readModels` sont listés et décrits
- [ ] `commands` sont listés et décrits
- [ ] `guardianInvariants` sont documentés (informatif)
- [ ] `owner` est défini (équipe responsable)
- [ ] `status` = ACTIVE
- [ ] Structure de fichiers est exacte (voir README.md)
- [ ] Tous les fichiers requis sont présents
- [ ] `tests/module.contract.spec.ts` existe et passe
- [ ] Aucun appel réseau direct (pas de fetch/axios)

---

## 🔗 Référence

- Contract: [SPOFE-Frontend-Module-Contract.v1.md](../../contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md)
- Section: 9. module.manifest.md (obligatoire)

---

**Statut:** OBLIGATOIRE  
**Version:** 1.0.0  
**Date:** 2026-01-30
