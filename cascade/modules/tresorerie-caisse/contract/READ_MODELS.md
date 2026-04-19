# READ_MODELS.md
## Module Trésorerie Caisse — SPOFE v1.0.0

### 1. Objet du document

Ce document définit l'ensemble des **read-models (modèles de lecture)** exposés par le module Trésorerie Caisse.

Les read-models :

- sont **strictement en lecture seule** (GET)
- sont **dérivés exclusivement des événements**
- ne contiennent **aucune logique métier**
- sont **reconstruisibles** à partir de l'event store

👉 Ils constituent la **surface de consultation officielle** du module.

### 2. Principes SPOFE applicables aux read-models

Les read-models du module respectent les principes suivants :

- **Event-driven only** : aucune donnée source externe
- **No write / no mutation**
- **No Guardian logic**
- **No calcul interprétatif**
- **Isolation par tenant**
- **Append-only côté événements**

**Les read-models ne sont jamais une source de vérité :**  
ils reflètent uniquement l'état issu des **faits validés**.

### 3. Liste officielle des read-models (IN SCOPE)

#### 3.1 Journal de caisse

**Nom logique**  
`CashJournalView`

**Description**  
Vue chronologique de tous les mouvements de caisse (entrées et sorties espèces).

**Événements sources**
- CashRegisterOpened
- CashMovementRecorded  
- CashRegisterClosed
- CashDiscrepancyRecorded

**Champs exposés (indicatifs)**
```typescript
{
  tenantId: string,
  cashRegisterId: string,
  eventType: string,
  movementType?: "IN" | "OUT",
  amount?: number,
  documentId: string,
  actorId: string,
  occurredAt: Date
}
```

**Cas d'usage**
- Consultation quotidienne
- Audit interne
- Recherche par période / caisse / acteur

#### 3.2 État de caisse à date

**Nom logique**  
`CashRegisterStateView`

**Description**  
Vue synthétique de l'état courant d'une caisse.

**Événements sources**
- CashRegisterOpened
- CashMovementRecorded
- CashRegisterClosed

**Champs exposés**
```typescript
{
  tenantId: string,
  cashRegisterId: string,
  status: "OPEN" | "CLOSED",
  openingAmount: number,
  currentTheoreticalAmount: number,
  openedAt?: Date,
  closedAt?: Date
}
```

👉 Le **solde théorique** est une agrégation mécanique des faits  
(autorisé car non interprétatif).

#### 3.3 Historique des ouvertures et clôtures

**Nom logique**  
`CashRegisterSessionHistoryView`

**Description**  
Historique des sessions de caisse (périodes ouvertes / clôturées).

**Événements sources**
- CashRegisterOpened
- CashRegisterClosed

**Champs exposés**
```typescript
{
  tenantId: string,
  cashRegisterId: string,
  openedAt: Date,
  closedAt?: Date,
  openingAmount: number,
  theoreticalAmount?: number,
  realAmount?: number,
  actorId: string,
  documentId: string
}
```

#### 3.4 Historique des mouvements de caisse

**Nom logique**  
`CashMovementHistoryView`

**Description**  
Liste détaillée des mouvements espèces uniquement.

**Événements sources**
- CashMovementRecorded

**Champs exposés**
```typescript
{
  tenantId: string,
  cashRegisterId: string,
  movementType: "IN" | "OUT",
  amount: number,
  recordedAt: Date,
  actorId: string,
  documentId: string
}
```

#### 3.5 Liste des écarts de caisse

**Nom logique**  
`CashDiscrepancyView`

**Description**  
Vue dédiée aux écarts constatés lors des clôtures.

**Événements sources**
- CashDiscrepancyRecorded

**Champs exposés**
```typescript
{
  tenantId: string,
  cashRegisterId: string,
  discrepancyAmount: number,
  recordedAt: Date,
  actorId: string,
  documentId: string
}
```

👉 **Aucun jugement, aucune correction**, uniquement le fait constaté.

### 4. Exclusions explicites

Les read-models ne doivent **jamais** :

- calculer de **résultat comptable**
- agréger par **compte comptable**
- interpréter un écart (perte / gain)
- produire des **KPI financiers**
- croiser avec banque / ventes / tiers
- exposer des données **cross-tenant**

**Toute violation invalide le BUILD_PROOF.**

### 5. Reconstruction & résilience

Tous les read-models doivent être :

- **rejouables** à partir de zéro
- **tolérants** à l'ordre strict des événements
- **indépendants** les uns des autres

👉 La perte d'un read-model **ne détruit aucun fait**.

### 6. Lien avec l'API read-only

Chaque read-model est exposé via :

- une **route GET**
- **sans paramètre de mutation**
- **sans effet de bord**

👉 La définition précise des routes figure dans **API_READ_ONLY.md**.

### 7. Statut du document

```
READ MODELS STATUS
────────────────────────────────
Module        : Trésorerie Caisse
Version       : v1.0.0
Niveau        : SPOFE P0
Statut        : ACTIF
Mutable       : NON
────────────────────────────────
```

### 8. Règle d'or SPOFE (lecture)

> **Un read-model montre ce qui est arrivé.  
> Il n'explique jamais pourquoi.**
