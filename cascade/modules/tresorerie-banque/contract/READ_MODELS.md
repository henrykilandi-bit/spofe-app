# 📄 READ_MODELS.md — Module Trésorerie Banque — SPOFE v1.0.0

## 1. Rôle des read-models

Les read-models du module Trésorerie Banque fournissent des **vues de lecture optimisées**, construites exclusivement à partir des événements validés du module.

Ils permettent :
- la consultation des flux bancaires constatés,
- la visualisation de l'état factuel des comptes bancaires,
- l'exploitation des données par les modules consommateurs.

👉 **Les read-models :**
- ne contiennent aucune logique métier,
- ne déclenchent aucune écriture,
- sont rejouables,
- sont **read-only**.

---

## 2. Principes non négociables (P0)

| Principe | Description |
|----------|-------------|
| **Event-driven only** | Aucun read-model sans événement |
| **Isolation stricte** | Par `tenantId`, `bankId`, `bankAccountId` |
| **Fact-only** | Aucune interprétation, aucun calcul prévisionnel |
| **Append-only** | Côté événements |
| **Aucun couplage** | Inter-modules |

---

## 3. Sources d'événements

Les read-models sont alimentés exclusivement par les événements suivants :

| Événement | Description |
|-----------|-------------|
| `BankAccountRegistered` | Création d'un compte bancaire |
| `BankDocumentRegistered` | Enregistrement d'un document bancaire |
| `BankDebitRecorded` | Débit bancaire constaté |
| `BankCreditRecorded` | Crédit bancaire constaté |
| `BankBalanceSnapshotRecorded` | Solde bancaire factuel |

---

## 4. Read-models exposés (IN SCOPE)

---

### 📘 RM01 — Journal bancaire par compte

**Description**  
Vue chronologique de tous les faits bancaires constatés pour un compte bancaire.

**Clé d'accès**
- `tenantId`
- `bankId`
- `bankAccountId`

**Contenu**
- date bancaire
- type d'événement (débit / crédit / solde)
- montant ou solde
- document source
- acteur technique

👉 Aucun regroupement, aucun calcul.

---

### 📗 RM02 — État factuel d'un compte bancaire

**Description**  
État courant factuel d'un compte bancaire à partir du dernier événement connu.

**Clé d'accès**
- `tenantId`
- `bankId`
- `bankAccountId`

**Contenu**
- statut du compte
- dernière date bancaire connue
- dernier solde bancaire constaté
- devise

👉 Pas de solde disponible, pas de projection.

---

### 📙 RM03 — Historique des mouvements bancaires

**Description**  
Liste détaillée des débits et crédits constatés.

**Clé d'accès**
- `tenantId`
- `bankId`
- `bankAccountId`
- période

**Contenu**
- type (DEBIT / CREDIT)
- montant
- date bancaire
- document bancaire
- horodatage d'enregistrement

---

### 📕 RM04 — Historique des documents bancaires

**Description**  
Liste des documents bancaires électroniques enregistrés.

**Clé d'accès**
- `tenantId`
- `bankId`
- `bankAccountId`

**Contenu**
- type de document
- date du document
- identifiant du document
- date d'enregistrement

---

### 📓 RM05 — Historique des soldes bancaires

**Description**  
Historique des soldes bancaires factuels tels qu'indiqués par les documents.

**Clé d'accès**
- `tenantId`
- `bankId`
- `bankAccountId`

**Contenu**
- date bancaire
- solde
- document source

---

## 5. Règles d'exposition

Les read-models :
- sont exposés en **lecture seule**
- sont filtrables par :
  - période
  - compte bancaire
  - banque
- ne supportent **aucune écriture**
- ne réalisent **aucune consolidation multi-comptes**

---

## 6. Consommation inter-modules

Les read-models peuvent être consommés par :
- Précomptabilité
- Comptabilité
- Budget
- Trésorerie (vue consolidée externe)
- Coaching

👉 Le module Banque n'oriente pas la consommation.

---

## 7. Hors périmètre explicite

Les read-models **n'exposent pas** :
- ❌ rapprochement bancaire
- ❌ états certifiés de rapprochement
- ❌ soldes prévisionnels
- ❌ indicateurs de performance
- ❌ alertes
- ❌ catégorisation comptable

---

## 8. Statut du contrat

```
READ-MODELS STATUS
────────────────────────────────
Module        : Trésorerie Banque
Version       : v1.0.0
Read-models   : RM01 → RM05
Pattern       : Event-driven
Mutable       : NON
────────────────────────────────
```

---

## 9. Clause de gel

Ce document est **figé** pour la version v1.0.0.

Toute évolution nécessitera :
- de nouveaux read-models,
- ou une nouvelle version du module,
- et un nouveau BUILD_PROOF.
