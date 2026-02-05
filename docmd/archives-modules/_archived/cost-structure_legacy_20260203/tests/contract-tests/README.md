# Contract Tests — Budget ↔ Cost-Structure
## Documentation v1.0.0

---

## Vue d'ensemble

Les **contract tests** vérifient que le contrat entre le module **Budget** (consumer) et le module **Cost-Structure** (provider) est respecté.

### Principe fondamental

> ❗ **Budget ne teste PAS l'implémentation de COUTFLEX**  
> ❗ **Budget teste UNIQUEMENT le contrat exposé par COUTFLEX**

---

## Structure des tests

### Côté Budget (Consumer)

**Fichier**: `cascade/modules/budgeting/tests/contract-tests/cost-structure.contract.spec.ts`

**Cas de test (CT-BUD)**:

| ID | Cas | Attendu |
|----|-----|---------|
| CT-BUD-01 | Projet VALIDATED + FROZEN + viableAt70=true | ✅ Exposé |
| CT-BUD-02 | Projet non VALIDATED | ❌ Non exposé |
| CT-BUD-03 | CostStructure non FROZEN | ❌ Non exposé |
| CT-BUD-04 | marginAt70 ≤ 0 | ❌ Non exposé |
| CT-BUD-05 | Champ contractuel manquant | ❌ Erreur |
| CT-BUD-06 | Création Budget sans projet exposé | ❌ Rejet BUD-COUT-01 |
| CT-BUD-07 | Nouvelle version après Budget | ⚠️ At-risk |

### Côté Cost-Structure (Provider)

**Fichier**: `cascade/modules/cost-structure/tests/contract-tests/budget-readiness.contract.spec.ts`

**Cas de test (PCT)**:

| ID | Cas | Garantie |
|----|-----|----------|
| PCT-01 | Jamais exposer COUT-01 en échec | ✅ marginAt70 > 0 |
| PCT-02 | Uniquement FROZEN | ✅ Status filtré |
| PCT-03 | Uniquement VALIDATED | ✅ Project status filtré |
| PCT-04 | Version > 0 | ✅ Version obligatoire |
| PCT-05 | Isolation tenant | ✅ RLS respecté |
| PCT-06 | Shape complet | ✅ Tous les champs |
| PCT-07 | Immutabilité | ✅ Read-only |

---

## Exécution des tests

### Local

```bash
# Tests côté Budget (consumer)
cd cascade/modules/budgeting
npm run test:contract

# Tests côté Cost-Structure (provider)
cd cascade/modules/cost-structure
npm run test:contract
```

### CI

```bash
# Tous les contract tests
npm run test:contract:all
```

---

## Règles de blocage CI

- ❌ **Un test rouge = merge interdit**
- ❌ **Pas de flag "skip" autorisé**
- ✅ **Tous les tests doivent passer avant déploiement**

---

## Évolution du contrat

| Changement | Autorisé en v1 |
|------------|----------------|
| Ajouter un champ | ❌ |
| Supprimer un champ | ❌ |
| Changer un type | ❌ |
| Nouvelle version | ✅ v1.1 |

> Tout changement = nouvelle version contractuelle

---

## Shape JSON Contractuel

```typescript
interface BudgetReadyProject {
  tenantId: string;      // UUID
  projectId: string;     // UUID
  projectName: string;   // Nom du projet
  version: number;       // Version (>= 1)
  
  unitCost: number;      // Coût unitaire
  totalCost: number;     // Coût total
  
  netMargin: number;     // Marge nette
  marginAt70: number;    // Marge à 70% (doit être > 0)
}
```

---

## Définition of Done

Le contrat est valide si :

- [x] CT-BUD-01 → CT-BUD-07 couverts
- [x] PCT-01 → PCT-07 couverts
- [x] Tests côté Budget verts
- [x] Tests côté Cost-Structure verts
- [x] CI bloque toute violation
- [ ] Budget refuse toute création non autorisée

---

## Fichiers concernés

| Module | Fichier | Description |
|--------|---------|-------------|
| Budget | `tests/contract-tests/cost-structure.contract.spec.ts` | Consumer tests |
| Cost-Structure | `tests/contract-tests/budget-readiness.contract.spec.ts` | Provider tests |
| Cost-Structure | `domain/invariants.ts` | CONTRACT_INVARIANTS.BUD_COUT_01 |
| Cost-Structure | `CONTRACT.md` | Documentation contractuelle |

---

**Version**: v1.0.0  
**Statut**: ✅ Tests contractuels implémentés  
**Date**: 2026-02-01
