# GUARDIAN — Module Tresoconsolidation

## 1. Rôle du Guardian

Le Guardian du module **Tresoconsolidation** est un **Guardian d'intégrité transverse**.

Il a pour responsabilité exclusive de garantir que :
- les données consolidées sont **factuelles, fiables et autorisées**,
- le module reste **strictement read-only**,
- aucune logique métier ou comptable n'est introduite indirectement.

Le Guardian ne valide pas des règles métier.
Il protège les **frontières architecturales** du module.

---

## 2. Nature du Guardian

- Type : Guardian transverse
- Portée : Lecture & agrégation uniquement
- Niveau : **P0 — non négociable**
- Statut : **IMMUTABLE**

---

## INVARIANTS

- TC01 : Read-only strict - Aucune commande, écriture, mutation ou effet de bord
- TC02 : Sources autorisées uniquement des read-models certifiés
- TC03 : Interdiction d'accès aux couches write
- TC04 : Isolation stricte par tenant
- TC05 : Append-only strict
- TC06 : Acteur SPOFE requis
- TC07 : Consolidation multi-devise uniquement
- TC08 : Traçabilité complète
- agrégats
- repositories write

**Violation → REJET + AUDIT CRITIQUE**

---

### G-TRESO-04 — Isolation multi-tenant
Toute donnée consolidée doit appartenir à un **unique tenant**.

Aucune agrégation cross-tenant n'est autorisée.

**Violation → REJET**

---

### G-TRESO-05 — Pas de logique métier
Le module ne doit contenir :
- aucune règle métier,
- aucun calcul interprétatif,
- aucune déduction fonctionnelle.

Les valeurs exposées sont **des faits bruts agrégés**.

**Violation → REJET**

---

### G-TRESO-06 — Pas de logique comptable
Le module ne doit :
- utiliser aucune nature comptable,
- utiliser aucun compte comptable,
- déclencher aucune écriture,
- interagir avec aucun module comptable.

**Violation → REJET**

---

### G-TRESO-07 — Agrégation déterministe
Les règles d'agrégation doivent être :
- simples (somme, concaténation, tri),
- déterministes,
- sans dépendance temporelle implicite.

**Violation → REJET**

---

### G-TRESO-08 — Traçabilité de la source
Chaque donnée exposée doit indiquer explicitement sa **source d'origine** :
- `CAISSE`
- `BANQUE`

**Violation → REJET**

---

### G-TRESO-09 — Données certifiées uniquement
Le Guardian doit refuser toute donnée issue d'un module :
- non certifié BUILD_PROOF,
- non gelé,
- ou hors gouvernance SPOFE.

**Violation → REJET**

---

### G-TRESO-10 — API GET uniquement
L'API exposée par le module :
- est strictement limitée aux méthodes GET,
- ne doit exposer aucun endpoint mutable.

**Violation → REJET**

---

## 4. Comportement en cas de violation

- Toute violation P0 entraîne un **rejet immédiat**
- Aucune dégradation gracieuse
- Aucun fallback implicite
- Les violations critiques doivent être **auditables**

---

## 5. Portée temporelle

Les règles de ce Guardian sont :
- valables à vie,
- rétrocompatibles,
- non désactivables,
- non contournables.

---

## 6. Relation avec les autres Guardians SPOFE

Ce Guardian :
- ne remplace aucun Guardian métier,
- complète les Guardians des modules Trésorerie-Caisse et Trésorerie-Banque,
- agit comme **dernier rempart transverse** avant exposition consolidée.

---

## 7. Statut du Guardian

```
GUARDIAN STATUS
────────────────────────────────
Module : Tresoconsolidation
Guardian Type : Intégrité transverse
Version : v1.0.0
Gouvernance : SPOFE P0
Statut : IMMUTABLE
────────────────────────────────
```

Ce Guardian est **opposable**, **définitif**, et conditionne toute certification BUILD_PROOF du module.
