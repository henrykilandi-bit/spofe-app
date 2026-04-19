# 📄 COMMANDS_EVENTS.md — Module Trésorerie Banque — SPOFE v1.0.0

## 1. Principe général

Le module Trésorerie Banque suit strictement le pattern **Command → Guardian → Event**.

- Une **commande** exprime une intention technique contrôlée.
- Le **Guardian** valide l'intention selon les invariants P0.
- Un **événement** est émis uniquement si la validation réussit.
- Les événements sont **append-only**, immuables, horodatés.

👉 **Aucun événement bancaire n'existe sans commande validée par le Guardian.**

---

## 2. Cycle documentaire bancaire

### 📄 Documents bancaires supportés

Les commandes du module reposent exclusivement sur des **documents bancaires électroniques officiels** :

- Relevé bancaire
- Avis de débit
- Avis de crédit

Chaque document :
- est rattaché à un seul compte bancaire,
- est validé avant toute utilisation,
- constitue la preuve factuelle du fait bancaire.

---

## 3. Commandes du module (WRITE SIDE)

---

### 🏦 C01 — RegisterBankAccount

**Responsabilité**  
Déclarer l'existence d'un compte bancaire dans le référentiel du module.

**Commande**
```typescript
RegisterBankAccountCommand {
  tenantId
  bankId
  bankAccountId
  currency
  actorId
}
```

**Règles Guardian associées**
- G01 — Compte bancaire obligatoire
- G02 — Banque obligatoire
- G03 — Isolation par tenant

**Événement émis**  
`BankAccountRegistered`

---

### 📄 C02 — RegisterBankDocument

**Responsabilité**  
Enregistrer un document bancaire électronique validé.

**Commande**
```typescript
RegisterBankDocumentCommand {
  tenantId
  bankId
  bankAccountId
  documentId
  documentType   // STATEMENT | DEBIT_NOTICE | CREDIT_NOTICE
  documentDate
  actorId
}
```

**Règles Guardian associées**
- G01 — Compte bancaire obligatoire
- G04 — Document bancaire obligatoire
- G05 — Document bancaire immuable

**Événement émis**  
`BankDocumentRegistered`

---

### 💳 C03 — RecordBankDebit

**Responsabilité**  
Constater un débit bancaire effectif à partir d'un document bancaire validé.

**Commande**
```typescript
RecordBankDebitCommand {
  tenantId
  bankId
  bankAccountId
  documentId
  amount
  bankDate
  actorId
}
```

**Règles Guardian associées**
- G01 — Compte bancaire obligatoire
- G04 — Document bancaire obligatoire
- G06 — Fait bancaire constaté uniquement
- G08 — Isolation par compte
- G09 — Temporalité bancaire

**Événement émis**  
`BankDebitRecorded`

---

### 💰 C04 — RecordBankCredit

**Responsabilité**  
Constater un crédit bancaire effectif à partir d'un document bancaire validé.

**Commande**
```typescript
RecordBankCreditCommand {
  tenantId
  bankId
  bankAccountId
  documentId
  amount
  bankDate
  actorId
}
```

**Règles Guardian associées**
- G01 — Compte bancaire obligatoire
- G04 — Document bancaire obligatoire
- G06 — Fait bancaire constaté uniquement
- G08 — Isolation par compte
- G09 — Temporalité bancaire

**Événement émis**  
`BankCreditRecorded`

---

### 📊 C05 — RecordBankBalanceSnapshot

**Responsabilité**  
Enregistrer un solde bancaire factuel tel qu'indiqué sur un document bancaire.

**Commande**
```typescript
RecordBankBalanceSnapshotCommand {
  tenantId
  bankId
  bankAccountId
  documentId
  balance
  bankDate
  actorId
}
```

**Règles Guardian associées**
- G04 — Document bancaire obligatoire
- G09 — Temporalité bancaire
- G10 — Solde bancaire factuel uniquement

**Événement émis**  
`BankBalanceSnapshotRecorded`

---

## 4. Événements métier (EVENTS)

> Les événements sont la **seule source de vérité** du module.

---

### 🏦 E01 — BankAccountRegistered

```typescript
{
  tenantId
  bankId
  bankAccountId
  currency
  registeredAt
  actorId
}
```

---

### 📄 E02 — BankDocumentRegistered

```typescript
{
  tenantId
  bankId
  bankAccountId
  documentId
  documentType
  documentDate
  registeredAt
  actorId
}
```

---

### 💳 E03 — BankDebitRecorded

```typescript
{
  tenantId
  bankId
  bankAccountId
  documentId
  amount
  bankDate
  recordedAt
  actorId
}
```

---

### 💰 E04 — BankCreditRecorded

```typescript
{
  tenantId
  bankId
  bankAccountId
  documentId
  amount
  bankDate
  recordedAt
  actorId
}
```

---

### 📊 E05 — BankBalanceSnapshotRecorded

```typescript
{
  tenantId
  bankId
  bankAccountId
  documentId
  balance
  bankDate
  recordedAt
  actorId
}
```

---

## 5. Séquentialité & cohérence

- Un **document bancaire** doit être enregistré avant tout débit/crédit.
- Un **compte bancaire** doit exister avant tout document.
- Les événements sont **indépendants** :
  - aucun rapprochement,
  - aucune agrégation,
  - aucun recalcul.

---

## 6. Interdictions explicites

Le module **REFUSE** toute commande visant à :

- ❌ rapprocher des mouvements,
- ❌ modifier un événement existant,
- ❌ enregistrer un fait sans document,
- ❌ enregistrer un fait multi-comptes,
- ❌ initier un paiement.

---

## 7. Statut du contrat

```
COMMANDS / EVENTS STATUS
────────────────────────────────
Module        : Trésorerie Banque
Version       : v1.0.0
Commands      : 5
Events        : 5
Pattern       : SPOFE P0
Mutable       : NON
────────────────────────────────
```

---

## 8. Clause de gel

Ce contrat est **figé** pour la version v1.0.0.

Toute modification implique :
- nouvelle version,
- nouveaux événements,
- nouveau BUILD_PROOF.
