# TEMPLATE OFFICIEL DES TESTS SYSTÈME SPOFE (P0)

## Version
- **Version :** P0
- **Statut :** ACTIF
- **Caractère :** NORMATIF
- **Applicabilité :** OBLIGATOIRE pour BUILD_PROOF global

---

## 1. Objectif

Les tests système SPOFE ont pour objectif de valider que les modules
collaborent correctement **sans jamais violer les invariants Guardian**,
en utilisant **exactement les mêmes chemins que l'exécution réelle**.

Les tests système :
- ne testent PAS la logique métier
- ne contournent JAMAIS les Guardians
- ne créent JAMAIS d'état impossible

---

## 2. Règles Fondamentales (NON NÉGOCIABLES)

### S-01 — Interdiction d'accès direct au domaine
Il est strictement interdit dans un test système de :
- appeler `repository.save()`
- appeler `eventStore.append()`
- instancier un agrégat (`new Aggregate`)
- manipuler l'état interne d'un module

**Toute écriture DOIT passer par une commande validée par un Guardian.**

---

### S-02 — Passage obligatoire par les Guardians
Toute création ou modification d'état doit suivre la séquence :

```
Commande → Document validé → Guardian → Événement → Read-model
```

**Un test qui échoue à cause d'un Guardian est un test invalide.**

---

### S-03 — Données Guardian-compliant
Toute donnée de test doit respecter :
- `tenantId` présent
- `actorId` présent
- document avec état `validated`
- rôles valides
- aucune donnée financière hors scope
- séquentialité des événements respectée

---

### S-04 — Séparation stricte des types de tests

```
tests/
├── guardian/     ← Invariants métier (P0)
├── system/       ← Tests système SPOFE (CE CONTRAT)
├── integration/  ← EXCLUS du BUILD_PROOF
└── legacy/       ← Isolés / non gouvernés
```

**Seuls les tests `guardian/` et `system/` sont pris en compte
pour le BUILD_PROOF global.**

---

## 3. Architecture Officielle des Tests Système

```
tests/system/
├── builders/
│   ├── TierBuilder.ts
│   ├── StockBuilder.ts
│   └── BudgetBuilder.ts
│
├── contexts/
│   └── SystemTestContext.ts
│
├── scenarios/
│   ├── tier-stock-flow.spec.ts
│   └── tier-budget-flow.spec.ts
│
└── README.md
```

---

## 4. Principe des Builders (OBLIGATOIRE)

Un test système ne crée jamais un état directement.

Il utilise un **Builder Guardian-compliant** qui encapsule :
- la commande
- le document validé
- l'appel Guardian

**Exemple :**

```typescript
class TierBuilder {
  async givenActiveClientTier() {
    // crée un tiers via une commande valide
  }
}
```

**Tout test système DOIT utiliser des builders.**

---

## 5. Structure Canonique d'un Test Système

```typescript
describe('SYSTEM — Scenario Name', () => {
  let ctx: SystemTestContext;

  beforeEach(async () => {
    ctx = new SystemTestContext();
    await ctx.reset();
  });

  it('executes a valid cross-module flow', async () => {
    // GIVEN — état créé via builders
    // WHEN  — interaction via API read-only
    // THEN  — assertions structurelles
  });
});
```

---

## 6. Assertions Autorisées

Un test système **peut** vérifier :
- l'existence d'un état
- un statut
- une réponse API
- la non-régression d'un flux

Il est **interdit** de :
- tester un calcul métier
- tester un invariant Guardian
- tester une logique financière hors scope

---

## 7. Interdictions Explicites

Sont **strictement interdits** :
- `as any` pour contourner un Guardian
- données invalides "pour tester"
- mocks de Guardian
- bypass de la couche application
- écritures directes en base

**Tout test enfreignant ces règles invalide le BUILD_PROOF global.**

---

## 8. Critères BUILD_PROOF Global SUCCESS

Le BUILD_PROOF système est SUCCESS si et seulement si :
- ✅ tous les modules sont FROZEN
- ✅ tous les tests Guardian passent
- ✅ tous les tests système respectent ce contrat
- ✅ aucun test n'écrit hors Guardian

---

## 9. Règle d'Or SPOFE

**Si un test échoue à cause d'un Guardian,
le test est faux, pas le Guardian.**

---

## 10. Gouvernance

Ce document fait partie de la **gouvernance SPOFE P0**.
Toute dérogation nécessite :
- une justification écrite
- une validation d'architecture
- une version supérieure du contrat

---

## 🧊 STATUT DE CE CONTRAT

```
CONTRAT SPOFE — TESTS SYSTÈME
────────────────────────────
Nom    : TEMPLATE_TESTS_SYSTEME_SPOFE_P0
Statut : ACTIF
Niveau : P0 (bloquant)
Portée : Transverse (système)
Impact : BUILD_PROOF GLOBAL
Mutable: NON (v1)
────────────────────────────
```

👉 **À partir de maintenant :**
- ce contrat est **référence officielle**
- tout test système non conforme est **hors gouvernance**