# 🛡️ TESTS GUARDIAN — Tresoconsolidation

> ⚠️ **Document normatif**
> Chaque test décrit ici doit exister en code.
> Aucun test ne peut être supprimé sans version majeure.

---

## 🎯 Objectif

Vérifier que le module **Tresoconsolidation** :
- respecte strictement son rôle **read-only**,
- ne consomme que des **sources autorisées**,
- ne viole aucune **frontière SPOFE**.

---

## 🔒 G-TRESO-01 — Read-only strict

### Test G01.1 — Rejet de toute commande

```
Étant donné une tentative d'appel d'une commande
Quand le module est invoqué
Alors la requête est rejetée
```

✔ attendu : exception `READ_ONLY_VIOLATION`

---

### Test G01.2 — Absence de handlers write

```
Étant donné le module chargé
Quand on inspecte les handlers enregistrés
Alors aucun handler de type write n'existe
```

✔ attendu : liste vide

---

## 🔒 G-TRESO-02 — Sources autorisées uniquement

### Test G02.1 — Source caisse autorisée

✔ lecture depuis read-model `tresorerie-caisse` acceptée

---

### Test G02.2 — Source banque autorisée

✔ lecture depuis read-model `tresorerie-banque` acceptée

---

### Test G02.3 — Source non autorisée rejetée

```
Quand une source différente est injectée
```

✔ attendu : `SOURCE_NOT_ALLOWED`

---

## 🔒 G-TRESO-03 — Interdiction d'accès aux couches write

### Test G03.1 — Accès event store interdit

✔ tentative → rejet

---

### Test G03.2 — Accès commandes interdit

✔ tentative → rejet + audit critique

---

## 🔒 G-TRESO-04 — Isolation multi-tenant

### Test G04.1 — Agrégation mono-tenant autorisée

✔ consolidation avec tenant unique acceptée

---

### Test G04.2 — Agrégation cross-tenant rejetée

✔ tentative → `TENANT_VIOLATION`

---

## 🔒 G-TRESO-05 — Pas de logique métier

### Test G05.1 — Pas de calcul interprétatif

✔ uniquement somme / concaténation / tri

---

### Test G05.2 — Rejet d'une règle métier injectée

✔ tentative → `BUSINESS_LOGIC_DETECTED`

---

## 🔒 G-TRESO-06 — Pas de logique comptable

### Test G06.1 — Interdiction nature comptable

✔ tentative → rejet

---

### Test G06.2 — Interdiction compte comptable

✔ tentative → rejet

---

## 🔒 G-TRESO-07 — Agrégation déterministe

### Test G07.1 — Déterminisme

✔ mêmes entrées → mêmes sorties

---

### Test G07.2 — Pas de dépendance implicite au temps

✔ horodatage explicite requis

---

## 🔒 G-TRESO-08 — Traçabilité de la source

### Test G08.1 — Champ source obligatoire

✔ chaque ligne contient `CAISSE` ou `BANQUE`

---

### Test G08.2 — Valeur source invalide rejetée

✔ tentative → `INVALID_SOURCE`

---

## 🔒 G-TRESO-09 — Données certifiées uniquement

### Test G09.1 — Module certifié accepté

✔ read-model BUILD_PROOF OK

---

### Test G09.2 — Module non certifié rejeté

✔ tentative → `UNCERTIFIED_SOURCE`

---

## 🔒 G-TRESO-10 — API GET uniquement

### Test G10.1 — GET autorisé

✔ endpoints GET répondent

---

### Test G10.2 — POST / PUT / DELETE rejetés

✔ tentative → `METHOD_NOT_ALLOWED`

---

## 📊 SYNTHÈSE DES TESTS

| Invariant | Tests | Statut attendu |
|-----------|-------|----------------|
| G01 | 2 | PASS |
| G02 | 3 | PASS |
| G03 | 2 | PASS |
| G04 | 2 | PASS |
| G05 | 2 | PASS |
| G06 | 2 | PASS |
| G07 | 2 | PASS |
| G08 | 2 | PASS |
| G09 | 2 | PASS |
| G10 | 2 | PASS |
| **TOTAL** | **21 tests** | **100% PASS** |

---

## 🔐 Statut du document

```
GUARDIAN TESTS STATUS
────────────────────────────────
Module        : Tresoconsolidation
Tests         : 21
Type          : Guardian P0
Criticité     : MAXIMALE
Statut        : OBLIGATOIRES
────────────────────────────────
```

Ce document est **normatif** et conditionne toute certification BUILD_PROOF du module.
