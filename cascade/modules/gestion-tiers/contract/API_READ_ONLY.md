# 🌐 API READ ONLY — MODULE GESTION DES TIERS

**Version :** v1.0.0  
**Framework :** SPOFE v2.1.0

## 🎯 Objectif du document

Ce document définit l'ensemble des endpoints API exposés en **lecture seule** par le module Gestion des Tiers.

👉 Ces API permettent aux autres modules et à l'UI :
- de consulter les tiers
- de vérifier leur statut
- de filtrer par rôle ou état

❌ **Aucune API d'écriture n'est exposée en v1.0.0.**

## 🧠 Principes fondamentaux SPOFE

- **GET uniquement**
- **Lecture seule**
- **Aucune mutation**
- **Aucune logique métier**
- **Aucun calcul**
- **Isolation stricte par tenant**
- **Source = read-models uniquement**

👉 **Toute tentative de POST / PUT / PATCH / DELETE est rejetée.**

## 🔐 Sécurité & gouvernance

Toutes les requêtes :
- sont scopées par `tenantId`
- nécessitent un `actor` SPOFE authentifié
- sont auditables

❌ **Aucun accès cross-tenant**  
❌ **Aucun accès anonyme**

## 📌 BASE PATH
`/api/tiers`

## 🟢 ENDPOINTS AUTORISÉS — v1.0.0

### 🔹 GET /api/tiers/{tierId}

**Description**  
Retourne la vue synthétique d'un tiers.

**Source read-model**  
`TierSummaryView`

**Paramètres**
| Nom | Type | Requis |
|-----|------|--------|
| tierId | UUID | ✅ |

**Réponse 200 (exemple)**
```json
{
  "tierId": "uuid",
  "status": "ACTIVE",
  "roles": ["CLIENT", "FOURNISSEUR"],
  "name": "ACME SARL",
  "legalIdentifiers": ["ICE123"],
  "createdAt": "2026-02-02T10:00:00Z",
  "updatedAt": "2026-02-10T09:30:00Z"
}
```

**Erreurs**
- `404` — tiers inexistant
- `403` — accès interdit (cross-tenant)

### 🔹 GET /api/tiers

**Description**  
Liste des tiers avec filtres.

**Source read-models**  
- `TierByRoleView`
- `TierByStatusView`

**Query params (optionnels)**
| Nom | Type | Description |
|-----|------|-------------|
| role | string | Filtrer par rôle |
| status | string | ACTIVE / SUSPENDED / ARCHIVED |

**Réponse 200**
```json
[
  {
    "tierId": "uuid",
    "name": "ACME SARL",
    "status": "ACTIVE",
    "roles": ["CLIENT"]
  }
]
```

### 🔹 GET /api/tiers/{tierId}/contacts

**Description**  
Retourne les coordonnées et contacts d'un tiers.

**Source read-model**  
`TierContactView`

**Réponse 200**
```json
{
  "addresses": [
    {
      "type": "BILLING",
      "value": "10 rue Exemple"
    }
  ],
  "contacts": [
    {
      "type": "EMAIL",
      "value": "contact@acme.com"
    }
  ]
}
```

### 🔹 GET /api/tiers/{tierId}/audit

**Description**  
Retourne l'historique événementiel d'un tiers.

**Source read-model**  
`TierAuditView`

**Réponse 200**
```json
[
  {
    "eventType": "TierCreated",
    "actorId": "actor-123",
    "timestamp": "2026-02-02T10:00:00Z",
    "summary": "Création du tiers"
  }
]
```

### 🔹 GET /api/tiers/exists/{tierId}

**Description**  
Vérifie l'existence d'un tiers.

**Réponse 200**
```json
{
  "exists": true
}
```

### 🔹 GET /api/tiers/{tierId}/status

**Description**  
Retourne uniquement le statut d'un tiers.

**Usage**
- vérification rapide par d'autres modules
- contrôle d'éligibilité

**Réponse 200**
```json
{
  "tierId": "uuid",
  "status": "ACTIVE"
}
```

## 🚫 ENDPOINTS INTERDITS (v1.0.0)

Les endpoints suivants sont **formellement interdits** :

- `POST /api/tiers`
- `PUT /api/tiers/{id}`
- `PATCH /api/tiers/{id}`
- `DELETE /api/tiers/{id}`
- tout endpoint contenant :
  - montants
  - soldes
  - échéances
  - indicateurs financiers

👉 **Toute exposition de ce type invalide le BUILD_PROOF.**

## 🔄 Évolution de l'API

- **Toute API d'écriture :**
  - nécessite une version majeure v2+

- **Toute exposition financière :**
  - nécessite un module distinct

## 🧪 Impacts sur les tests

Chaque endpoint :
- doit avoir un test de lecture nominal
- doit refuser toute mutation

**Les tests API :**
- ne doivent jamais appeler le domaine en écriture

## 🟢 Statut du document

```
API_READ_ONLY STATUS
────────────────────────────────────
Module        : gestion-tiers
Version       : v1.0.0
State         : APPROVED
Governance    : SPOFE P0
Mutable       : NO
────────────────────────────────────
```

---

**✔️ FIN DU DOCUMENT API_READ_ONLY.md**
