# COMMANDS_EVENTS.md
## Module Trésorerie Caisse — SPOFE v1.0.0

### 1. Objet du document

Ce document définit :

- les **commandes write autorisées** du module Trésorerie Caisse,
- les **événements métier produits**,
- le **cycle documentaire complet**,
- la **séquentialité obligatoire** entre commandes et événements.

👉 Ce document est **contractuel et opposable**.  
👉 Toute commande ou événement non listé ici est **interdit en v1.0.0**.

### 2. Principe fondamental SPOFE

- **Toute commande valide un document.**
- **Tout document validé et signé produit un événement.**
- **Aucun événement n'existe sans document signé.**

### 3. Cycle documentaire global (canonique)

```
[Create Document - DRAFT]
        ↓
[Validate Document]
        ↓
[Sign Document]
        ↓
[Guardian Validation]
        ↓
[Emit Event]
        ↓
[Update Read-Models]
```

- Le **Guardian** est appelé avant toute émission d'événement
- Les **événements** sont append-only
- Les **read-models** sont reconstruisibles

### 4. Commandes du module (WRITE)

#### 4.1 OpenCashRegister

**Description**  
Ouvre une caisse pour une période donnée.

**Préconditions Guardian**
- Caisse existante et active (G01)
- Aucune ouverture active en cours (G03)

**Payload minimal**
```typescript
{
  tenantId: string,
  actorId: string,
  cashRegisterId: string,
  openingAmount: number,
  documentId: string
}
```

**Événement émis**  
`CashRegisterOpened`

#### 4.2 RecordCashMovement

**Description**  
Enregistre un mouvement de caisse (entrée ou sortie espèces).

**Préconditions Guardian**
- Caisse ouverte (G02)
- Document validé et signé (G04)
- Typologie valide et montant > 0 (G08)

**Payload minimal**
```typescript
{
  tenantId: string,
  actorId: string,
  cashRegisterId: string,
  movementType: "IN" | "OUT",
  amount: number,
  documentId: string
}
```

**Événement émis**  
`CashMovementRecorded`

#### 4.3 CloseCashRegister

**Description**  
Clôture une caisse pour la période ouverte.

**Préconditions Guardian**
- Caisse ouverte (G02)
- Aucun verrou existant (G07)

**Payload minimal**
```typescript
{
  tenantId: string,
  actorId: string,
  cashRegisterId: string,
  theoreticalAmount: number,
  realAmount: number,
  documentId: string
}
```

**Événements émis**
- `CashRegisterClosed`
- `CashDiscrepancyRecorded` (uniquement si écart constaté)

#### 4.4 RecordCashDiscrepancy

**Description**  
Commande logique interne déclenchée uniquement lors de la clôture si un écart est constaté.

⚠️ **Cette commande n'est pas exposée à l'extérieur.**

**Préconditions Guardian**
- Clôture en cours (G09)

**Payload minimal**
```typescript
{
  tenantId: string,
  actorId: string,
  cashRegisterId: string,
  discrepancyAmount: number,
  documentId: string
}
```

**Événement émis**  
`CashDiscrepancyRecorded`

### 5. Événements du module (APPEND-ONLY)

#### 5.1 CashRegisterOpened
```typescript
{
  tenantId: string,
  cashRegisterId: string,
  openingAmount: number,
  openedAt: Date,
  actorId: string,
  documentId: string
}
```

#### 5.2 CashMovementRecorded
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

#### 5.3 CashRegisterClosed
```typescript
{
  tenantId: string,
  cashRegisterId: string,
  theoreticalAmount: number,
  realAmount: number,
  closedAt: Date,
  actorId: string,
  documentId: string
}
```

#### 5.4 CashDiscrepancyRecorded
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

### 6. Séquentialité des événements (OBLIGATOIRE)

```
CashRegisterOpened
    ↓
CashMovementRecorded (0..n)
    ↓
CashRegisterClosed
        ↓
CashDiscrepancyRecorded (0..1)
```

**Toute violation de cet ordre est rejetée par le Guardian.**

### 7. Interdictions explicites

Il est **strictement interdit** :

- d'émettre un événement sans **document signé**
- d'émettre un événement sans **passage Guardian**
- d'émettre un événement **hors séquence**
- de **modifier ou supprimer** un événement
- d'émettre un événement **comptable**
- d'émettre un événement **bancaire**

### 8. Lien avec les read-models

Les événements alimentent **exclusivement** :

- Journal de caisse
- État de caisse
- Historique des ouvertures / clôtures
- Historique des écarts

👉 **Aucun événement ne met à jour un autre module.**

### 9. Statut du document

```
COMMANDS / EVENTS STATUS
────────────────────────────────
Module        : Trésorerie Caisse
Version       : v1.0.0
Niveau        : SPOFE P0
Statut        : ACTIF
Mutable       : NON
────────────────────────────────
```

### 10. Règle d'or SPOFE

> **Les commandes expriment une intention.  
> Les événements expriment un fait irréversible.**
