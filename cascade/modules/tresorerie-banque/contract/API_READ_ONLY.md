# 🌐 API_READ_ONLY.md — Module Trésorerie Banque — SPOFE v1.0.0

## 1. Rôle de l'API read-only

L'API read-only du module Trésorerie Banque expose exclusivement des **vues de lecture** issues des read-models validés.

Elle permet :
- la consultation des faits bancaires constatés,
- l'accès aux états factuels des comptes bancaires,
- la consommation sécurisée des données par les autres modules SPOFE.

👉 **Aucune écriture n'est autorisée via cette API.**

---

## 2. Principes non négociables (P0)

| Principe | Règle |
|----------|-------|
| **GET uniquement** | ✅ |
| **Read-models only** | ✅ |
| **Aucune logique métier** | ✅ |
| **Aucun accès write** | ✅ |
| **Aucun appel Guardian** | ✅ |
| **Aucune dépendance inter-module** | ✅ |
| **Isolation stricte par tenant** | ✅ |

> ❌ Toute violation entraîne un refus de certification BUILD_PROOF.

---

## 3. Ressources exposées

Toutes les routes sont contextualisées par compte bancaire.

**Contexte obligatoire**
- `tenantId`
- `bankId`
- `bankAccountId`

---

## 4. Endpoints exposés (IN SCOPE v1.0.0)

---

### 📘 GET /bank/accounts

**Description**  
Liste des comptes bancaires enregistrés pour un tenant.

**Query params**
- `tenantId` (obligatoire)
- `bankId` (optionnel)
- `status` (optionnel)

**Source**  
Read-model : État factuel d'un compte bancaire

---

### 📗 GET /bank/accounts/{bankAccountId}/state

**Description**  
Retourne l'état factuel courant d'un compte bancaire.

**Path params**
- `bankAccountId`

**Query params**
- `tenantId` (obligatoire)
- `bankId` (obligatoire)

**Source**  
Read-model : RM02 — État factuel d'un compte bancaire

---

### 📘 GET /bank/accounts/{bankAccountId}/journal

**Description**  
Journal chronologique des faits bancaires d'un compte.

**Path params**
- `bankAccountId`

**Query params**
- `tenantId` (obligatoire)
- `bankId` (obligatoire)
- `fromDate` (optionnel)
- `toDate` (optionnel)

**Source**  
Read-model : RM01 — Journal bancaire par compte

---

### 📙 GET /bank/accounts/{bankAccountId}/movements

**Description**  
Liste des débits et crédits bancaires constatés.

**Path params**
- `bankAccountId`

**Query params**
- `tenantId` (obligatoire)
- `bankId` (obligatoire)
- `type` = `DEBIT` | `CREDIT` (optionnel)
- `fromDate` / `toDate` (optionnel)

**Source**  
Read-model : RM03 — Historique des mouvements bancaires

---

### 📕 GET /bank/accounts/{bankAccountId}/documents

**Description**  
Liste des documents bancaires électroniques enregistrés.

**Path params**
- `bankAccountId`

**Query params**
- `tenantId` (obligatoire)
- `bankId` (obligatoire)

**Source**  
Read-model : RM04 — Historique des documents bancaires

---

### 📓 GET /bank/accounts/{bankAccountId}/balances

**Description**  
Historique des soldes bancaires factuels.

**Path params**
- `bankAccountId`

**Query params**
- `tenantId` (obligatoire)
- `bankId` (obligatoire)
- `fromDate` / `toDate` (optionnel)

**Source**  
Read-model : RM05 — Historique des soldes bancaires

---

## 5. Format des réponses

| Aspect | Valeur |
|--------|--------|
| **Format** | JSON |
| **Encodage** | UTF-8 |
| **Dates** | ISO 8601 |
| **Montants** | numériques, sans interprétation |

👉 Aucun enrichissement ni transformation métier.

---

## 6. Sécurité & isolation

- L'API **ne gère pas** l'authentification
- Elle suppose un `tenantId` valide fourni par la couche supérieure
- Toute incohérence tenant / banque / compte est rejetée

---

## 7. Erreurs standard

| Code | Signification |
|------|---------------|
| `400` | Paramètres invalides |
| `401` | Contexte tenant absent |
| `404` | Ressource inexistante |
| `409` | Incohérence de contexte |
| `500` | Erreur technique |

---

## 8. Hors périmètre explicite

L'API **n'expose pas** :
- ❌ endpoints write
- ❌ rapprochement bancaire
- ❌ états certifiés
- ❌ indicateurs
- ❌ alertes
- ❌ prévisions
- ❌ consolidation multi-comptes

---

## 9. Statut du contrat

```
API READ-ONLY STATUS
────────────────────────────────
Module        : Trésorerie Banque
Version       : v1.0.0
Endpoints     : 6
Méthodes      : GET uniquement
Mutable       : NON
────────────────────────────────
```

---

## 10. Clause de gel

Ce contrat est **figé** pour la version v1.0.0.

Toute modification :
- invalide la certification,
- nécessite une nouvelle version,
- impose un nouveau BUILD_PROOF.
