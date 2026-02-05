# 📜 CHARTE DU RÉFÉRENTIEL COMPTABLE SPOFE

**SPOFE P0 — OHADA-first**  
**Version :** 1.1.0  
**Date :** 2026-02-03  
**Statut :** NORMATIF — OPPOSABLE

---

## 1. Objet de la charte

La présente charte a pour objet de fixer de manière définitive et non ambiguë les principes de référence comptable applicables à l'ensemble de l'écosystème SPOFE.

Elle définit :

- le référentiel comptable de base,
- la séparation stricte entre modules métier et comptabilité,
- les règles de rattachement des faits métier aux comptes comptables.

**Cette charte est normative, opposable, et s'impose à tous les modules présents et futurs.**

---

## 2. Principe fondamental — OHADA-first

SPOFE est conçu selon le principe **OHADA-first**.

Cela signifie que :

- le référentiel SYSCOHADA est le référentiel comptable par défaut,
- toute implémentation comptable dans SPOFE se conforme en priorité :
  - au Plan Comptable SYSCOHADA,
  - à ses classes, comptes et règles associées.

### Rappel (non exhaustif)

| Classe | Désignation |
|--------|-------------|
| Classe 1 | Capitaux |
| Classe 2 | Immobilisations |
| Classe 3 | Stocks |
| Classe 4 | Tiers |
| Classe 5 | Trésorerie |
| 52 | Banques |
| 57 | Caisse |

👉 **Ces numéros sont normatifs, mais n'appartiennent pas aux modules métier.**

---

## 3. Principe d'extension — PCG et autres référentiels

SPOFE permet l'extension vers d'autres référentiels comptables, notamment :

- PCG (France),
- IFRS,
- référentiels sectoriels.

Ces référentiels sont :

- **secondaires**,
- **optionnels**,
- **implémentés par extension ou adaptation**,
- **jamais imposés au core métier**.

👉 **Le core SPOFE reste référentiel-agnostique.**

---

## 4. Séparation stricte des responsabilités (principe clé)

### 4.1 Modules métier SPOFE

Les modules métier (exemples non exhaustifs) :

- Immobilisation
- Gestion des stocks
- Gestion des tiers
- Trésorerie Caisse
- Trésorerie Banque

Ces modules :

- ✅ constatent des faits économiques ou physiques,
- ✅ exposent des événements factuels,
- ✅ fournissent des read-models métier.

**Ces modules NE DOIVENT JAMAIS :**

- ❌ contenir de numéros de comptes comptables,
- ❌ implémenter des règles comptables,
- ❌ produire des écritures comptables,
- ❌ dépendre d'un plan comptable.

```
╔════════════════════════════════════════════════════════════════════╗
║  ❌ Toute violation de ce principe invalide la gouvernance SPOFE.  ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## 5. Rattachement comptable — responsabilité exclusive des modules comptables

Le rattachement des faits métier aux comptes comptables est effectué **exclusivement** par :

- le module **Précomptabilité**,
- le module **Comptabilité Générale**,
- ou tout module comptable **certifié SPOFE**.

Ce rattachement est :

- **déclaratif**,
- **versionné**,
- **traçable**,
- **configurable par référentiel** (OHADA, PCG…).

👉 **Exemple :**

- un fait issu de **Trésorerie Caisse** pourra être rattaché au compte **57\***,
- un fait issu de **Trésorerie Banque** pourra être rattaché au compte **52\***,

👉 **sans que ces comptes n'apparaissent dans les modules source.**

---

## 6. Principe de non-pollution inter-modules

Aucun module métier ne peut :

- ❌ anticiper le traitement comptable d'un fait,
- ❌ imposer une logique comptable,
- ❌ supposer un compte cible.

```
┌─────────────────────────────────────────────────────────────────┐
│  Les modules métier EXPOSENT                                    │
│  Les modules comptables INTERPRÈTENT                            │
└─────────────────────────────────────────────────────────────────┘
```

👉 **Ce découplage est structurel et irréversible.**

---

## 7. Clause de référence obligatoire

Tout module SPOFE futur **DOIT** référencer explicitement cette charte dans son `SCOPE.md` ou son `README.md`, via la clause suivante (ou équivalent) :

```
« Ce module est référentiel-agnostique.
Les faits qu'il expose sont destinés à être rattachés aux comptes du référentiel 
comptable OHADA via des modules comptables dédiés, conformément à la 
CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md. »
```

---

## 8. Gouvernance & gel

```
╔════════════════════════════════════════════════════════════════════╗
║                         CHARTE STATUS                              ║
╠════════════════════════════════════════════════════════════════════╣
║  Nom            : CHARTE_REFERENTIEL_COMPTABLE_SPOFE               ║
║  Niveau         : SPOFE P0                                         ║
║  Référentiel    : OHADA-first                                      ║
║  Modifiable     : NON                                              ║
║  Opposable      : OUI                                              ║
╚════════════════════════════════════════════════════════════════════╝
```

Toute évolution :

- nécessite une nouvelle charte,
- implique une nouvelle version de gouvernance,
- ne peut être rétroactive.

---

## 9. Clause finale

La présente charte constitue un **pilier structurel** de SPOFE.

Elle garantit :

- ✅ la conformité réglementaire,
- ✅ la cohérence comptable,
- ✅ la pérennité de l'architecture,
- ✅ l'absence de dette comptable dans le core métier.

---

**Certifié SPOFE P0**  
**Date d'entrée en vigueur : 2026-02-03**  
**Status : GELÉ & OPPOSABLE**
