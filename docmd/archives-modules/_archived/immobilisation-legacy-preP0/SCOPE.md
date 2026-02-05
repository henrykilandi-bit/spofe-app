# Immobilisation — Contractual Scope (SPOFE)

## 1. Objectif du document

Ce document définit **le périmètre contractuel officiel** du module **Immobilisation** dans le système SPOFE.

Il établit une **frontière claire, opposable et vérifiable** entre :
- le code **contractuel**, garanti et certifié (BUILD_PROOF),
- le code **hors périmètre**, conservé uniquement à titre d'historique ou de référence.

👉 Toute décision de build, de test, de validation ou de mise en production
se base exclusivement sur ce périmètre.

---

## 2. Périmètre contractuel (IN SCOPE)

Les éléments suivants font **intégralement partie du périmètre SPOFE** pour le module Immobilisation.

### 2.1 Code applicatif contractuel

```
src/
├── api/
├── application/
├── domain/
├── infrastructure/
└── sql/
```

Règles :
- Architecture CQRS stricte
- Guardian centralisant toute la logique métier
- Aucun calcul métier hors Guardian
- Aucune écriture depuis les API de lecture

---

### 2.2 Tests contractuels

```
tests/
```

Inclut uniquement :
- tests unitaires Guardian (table-driven)
- tests d'intégration write-side (Guardian ↔ DB)
- tests E2E API (GET uniquement)
- tests contractuels inter-modules (Budget, Cost-Structure)

Règles :
- Aucun mock métier
- PostgreSQL réel
- Tests exécutés dans le BUILD_PROOF

---

### 2.3 Contrats et documentation normative

```
contract/
├── CONTRACT.md
├── GUARDIAN.md
├── COMMANDS_EVENTS.md
├── READ_MODELS.md
├── API_READ_ONLY.md
└── immobilisation.openapi.json
```

Ces documents définissent :
- le périmètre fonctionnel
- les invariants métier
- les contrats inter-modules
- l'API exposée

👉 **Tout code non décrit ici n'est pas contractuel.**

---

### 2.4 Gouvernance et preuve de build

```
BUILD_PROOF.md
BUILD_PROOF.sig
```

Règles :
- BUILD_PROOF obligatoire pour toute validation
- Signature cryptographique requise
- Aucune mise en production sans BUILD_PROOF valide

---

## 3. Hors périmètre (OUT OF SCOPE)

Les éléments suivants sont **explicitement exclus du périmètre contractuel SPOFE**.

```
experimental/
scripts/
drafts/
legacy/
```

### 3.1 Dossier `experimental/`

```
experimental/
├── legacy/
├── drafts/
├── poc/
└── disabled-tests/
```

Caractéristiques :
- ❌ Non couvert par BUILD_PROOF
- ❌ Non garanti pour la production
- ❌ Peut être modifié ou supprimé sans impact contractuel
- ✅ Conservé pour historique, exploration ou référence

Tout code destiné à la production **doit être déplacé dans `/src`**
et décrit dans les documents contractuels.

---

## 4. Règles d'exclusion technique

Les éléments hors périmètre sont :
- exclus des `tsconfig` contractuels
- exclus des runners de tests
- ignorés par la CI SPOFE
- non pris en compte dans les décisions de GO PROD

---

## 5. Autorité du périmètre

En cas de divergence entre :
- un fichier présent dans le dépôt
- et le périmètre défini dans ce document

👉 **Ce document fait foi.**

Le périmètre contractuel est :
- volontairement restreint
- explicitement défini
- juridiquement et techniquement opposable

---

## 6. Référence pour les futurs modules

Le présent document sert de **modèle officiel SPOFE** pour :
- le module Stock
- les modules futurs (Ventes, Comptabilité, RH, etc.)

Toute création de module doit fournir un `SCOPE.md`
avant le démarrage du write-side.

---

## 7. Référentiel comptable

Ce module est **référentiel-agnostique**.

Les faits qu'il expose sont destinés à être rattachés aux comptes du **référentiel comptable OHADA** (par défaut), via des **modules comptables dédiés** (Précomptabilité, Comptabilité Générale), conformément à la :

**CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md**

Ce module :
- ne contient aucun numéro de compte comptable,
- n'implémente aucune règle comptable,
- ne produit aucune écriture comptable.

Toute logique de rattachement aux comptes (ex. 52, 57) est **strictement hors périmètre**.

---

## 8. Statut

- Module : Immobilisation
- Version : v1.0.0
- Statut : 🟢 CONFORME
- BUILD_PROOF : valide et signé
- Date d'entrée en vigueur : (voir BUILD_PROOF.md)