# 🌐 API_READ_ONLY.md
**Module Trésorerie Caisse — SPOFE v1.0.0**

## 1. Objet du document

Ce document définit l'API de consultation (read-only) du module Trésorerie Caisse.

L'API :
- expose uniquement des données de lecture
- s'appuie exclusivement sur les read-models
- ne permet aucune mutation
- ne déclenche aucune logique métier
- est indépendante de toute infrastructure

**👉 Toute route non définie ici est interdite en v1.0.0.**

## 2. Principes généraux de l'API SPOFE

Les règles suivantes sont non négociables :
- **Méthodes HTTP autorisées** : GET uniquement
- **Aucune commande write**
- **Aucune création / modification / suppression**
- **Aucune dépendance au Guardian**
- **Isolation stricte par tenantId**
- **Réponses déterministes** (no side effects)

## 3. Base path & versioning

```
/api/v1/tresorerie-caisse
```

- La version API est figée pour toute la durée de la v1.0.0
- Toute évolution nécessite une nouvelle version

## 4. Endpoints officiels (IN SCOPE)

### 4.1 Journal de caisse

**Endpoint**
```
GET /api/v1/tresorerie-caisse/journal
```

**Description**
Retourne le journal chronologique des opérations de caisse.

**Query params (optionnels)**
- `cashRegisterId`
- `fromDate`
- `toDate`
- `actorId`

**Source**
`CashJournalView`

**Réponse (exemple)**
```json
[
  {
    "cashRegisterId": "CR-001",
    "eventType": "CashMovementRecorded",
    "movementType": "IN",
    "amount": 5000,
    "actorId": "actor-123",
    "documentId": "doc-789",
    "occurredAt": "2026-01-15T09:42:00Z"
  }
]
```

### 4.2 État courant d'une caisse

**Endpoint**
```
GET /api/v1/tresorerie-caisse/state/{cashRegisterId}
```

**Description**
Retourne l'état synthétique d'une caisse à l'instant T.

**Source**
`CashRegisterStateView`

**Réponse**
```json
{
  "cashRegisterId": "CR-001",
  "status": "OPEN",
  "openingAmount": 10000,
  "currentTheoreticalAmount": 13500,
  "openedAt": "2026-01-15T08:00:00Z"
}
```

### 4.3 Historique des sessions de caisse

**Endpoint**
```
GET /api/v1/tresorerie-caisse/sessions
```

**Description**
Retourne l'historique des ouvertures et clôtures de caisse.

**Query params (optionnels)**
- `cashRegisterId`
- `fromDate`
- `toDate`

**Source**
`CashRegisterSessionHistoryView`

### 4.4 Historique des mouvements de caisse

**Endpoint**
```
GET /api/v1/tresorerie-caisse/movements
```

**Description**
Retourne la liste détaillée des mouvements espèces.

**Query params (optionnels)**
- `cashRegisterId`
- `movementType` (IN | OUT)
- `fromDate`
- `toDate`

**Source**
`CashMovementHistoryView`

### 4.5 Liste des écarts de caisse

**Endpoint**
```
GET /api/v1/tresorerie-caisse/discrepancies
```

**Description**
Retourne la liste des écarts de caisse constatés.

**Query params (optionnels)**
- `cashRegisterId`
- `fromDate`
- `toDate`

**Source**
`CashDiscrepancyView`

## 5. Sécurité & isolation

- Toutes les requêtes sont scopées par `tenantId`
- Le `tenantId` est résolu par le contexte d'exécution (auth middleware)
- Aucune donnée cross-tenant n'est exposée
- Aucun filtrage ne peut contourner l'isolation

## 6. Gestion des erreurs (lecture)

| Situation | Réponse |
|-----------|---------|
| Ressource inexistante | 404 |
| Paramètres invalides | 400 |
| Accès non autorisé | 403 |
| Erreur technique | 500 |

**👉 Aucune erreur métier Guardian n'est exposée via cette API.**

## 7. Exclusions explicites

L'API Trésorerie Caisse ne fournit aucun endpoint pour :
- création de document
- validation ou signature
- ouverture ou clôture de caisse
- enregistrement de mouvement
- correction ou annulation
- export comptable
- rapprochement bancaire

**👉 Toute tentative est hors contrat.**

## 8. Conformité BUILD_PROOF

Pour être certifiée :
- ✔ Tous les endpoints sont GET
- ✔ Chaque endpoint mappe 1 read-model
- ✔ Aucune dépendance write
- ✔ Aucune logique métier
- ✔ Aucun effet de bord

**Toute violation invalide le BUILD_PROOF.**

## 9. Statut du document

```
API READ-ONLY STATUS
────────────────────────────────
Module        : Trésorerie Caisse
Version       : v1.0.0
Niveau        : SPOFE P0
Statut        : ACTIF
Mutable       : NON
────────────────────────────────
```

## 10. Règle d'or SPOFE (API)

> **Une API read-only expose l'état du monde.**  
> **Elle ne le modifie jamais.**