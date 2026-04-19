# READ_MODELS — Module Tresoconsolidation

## 1. Objet du document

Ce document définit l'ensemble des **read-models exposés** par le module
**Tresoconsolidation**.

Les read-models ont pour unique vocation de :
- consolider des données existantes,
- fournir des vues factuelles,
- être consommés via des API GET.

Aucun read-model ne produit d'effet de bord.

---

## 2. Principe fondamental

> **Un read-model de Tresoconsolidation est une projection dérivée exclusivement
> des read-models certifiés de Trésorerie-Caisse et Trésorerie-Banque.**

Les projections sont :
- déterministes,
- recalculables,
- sans état métier propre.

---

## 3. Sources autorisées

Les read-models de ce module consomment uniquement :

- Read-models du module **Trésorerie-Caisse**
- Read-models du module **Trésorerie-Banque**

Toute autre source est interdite.

---

## 4. Read-models définis (v1.0.0)

### 4.1 `ConsolidatedTreasuryBalance`

#### Description
Vue consolidée des soldes de trésorerie à un instant donné.

#### Contenu
- totalCaisse
- totalBanque
- totalTresorerie
- devise (si applicable)
- asOf (horodatage)

#### Règles
- totalTresorerie = totalCaisse + totalBanque
- aucun ajustement
- aucune interprétation

---

### 4.2 `TreasuryBalanceBySource`

#### Description
Ventilation des soldes par source de trésorerie.

#### Contenu
- source (`CAISSE` | `BANQUE`)
- sourceId (caisseId ou bankAccountId)
- solde
- devise
- asOf

---

### 4.3 `TreasuryBalanceByCaisse`

#### Description
Détail des soldes par caisse physique.

#### Contenu
- caisseId
- caisseLabel
- solde
- devise
- asOf

#### Source
- Exclusivement Trésorerie-Caisse

---

### 4.4 `TreasuryBalanceByBankAccount`

#### Description
Détail des soldes par compte bancaire.

#### Contenu
- bankAccountId
- bankName
- accountReference
- solde
- devise
- asOf

#### Source
- Exclusivement Trésorerie-Banque

---

### 4.5 `ConsolidatedTreasuryJournal`

#### Description
Journal consolidé des mouvements de trésorerie.

#### Contenu
- movementId
- date
- source (`CAISSE` | `BANQUE`)
- sourceId
- libelle
- montant
- devise
- referenceExterne (si fournie)
- createdAt

#### Règles
- concaténation des journaux source
- tri chronologique strict
- aucune transformation du montant

---

## 5. Règles transverses des read-models

### RM-01 — Read-only strict
Les read-models ne peuvent être modifiés par aucune commande.

---

### RM-02 — Isolation multi-tenant
Chaque read-model est strictement limité à un tenant unique.

---

### RM-03 — Déterminisme
À sources identiques, les projections doivent produire un résultat identique.

---

### RM-04 — Pas de logique métier
Aucune règle métier ou comptable n'est autorisée dans les projections.

---

### RM-05 — Source explicite
Chaque donnée projetée doit indiquer sa source (`CAISSE` ou `BANQUE`).

---

## 6. Évolution des read-models

- Toute extension doit être **additive**
- Aucun champ ne peut être supprimé rétroactivement
- Toute évolution nécessite une nouvelle version contractuelle

---

## 7. Statut du document

```
READ_MODELS STATUS
────────────────────────────────
Module : Tresoconsolidation
Version : v1.0.0
Type : Projections read-only
Gouvernance : SPOFE P0
────────────────────────────────
```

Ce document constitue la référence contractuelle des projections du module.
