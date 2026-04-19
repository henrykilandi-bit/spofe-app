# API_READ_ONLY — Module Tresoconsolidation

## 1. Objet du document

Ce document définit l'API **read-only** exposée par le module
**Tresoconsolidation**.

Cette API permet de consulter les projections consolidées de trésorerie,
sans possibilité de modification ou d'effet de bord.

---

## 2. Principes généraux

- API strictement **GET**
- Aucun endpoint mutable
- Aucun calcul métier
- Aucune logique comptable
- Données issues exclusivement des read-models certifiés

Toute violation entraîne un rejet par le Guardian.

---

## 3. Base path

```
/api/tresoconsolidation
```

---

## 4. Endpoints exposés (v1.0.0)

---

### 4.1 Obtenir le solde consolidé de trésorerie

**GET** `/balance`

#### Description
Retourne le solde consolidé global de la trésorerie
(caisse + banque) à un instant donné.

#### Paramètres (query)
- `asOf` (optionnel, ISO date-time)

#### Réponse (200)
```json
{
  "totalCaisse": 125000,
  "totalBanque": 340000,
  "totalTresorerie": 465000,
  "devise": "XOF",
  "asOf": "2026-03-01T10:00:00Z"
}
```

---

### 4.2 Ventilation des soldes par source

**GET** `/balance/by-source`

#### Description
Retourne la ventilation des soldes par source de trésorerie.

#### Paramètres (query)
- `source` (optionnel) : `CAISSE` | `BANQUE`
- `asOf` (optionnel)

#### Réponse (200)
```json
[
  {
    "source": "CAISSE",
    "sourceId": "CAISSE_01",
    "solde": 85000,
    "devise": "XOF",
    "asOf": "2026-03-01T10:00:00Z"
  },
  {
    "source": "BANQUE",
    "sourceId": "BANK_ACC_01",
    "solde": 340000,
    "devise": "XOF",
    "asOf": "2026-03-01T10:00:00Z"
  }
]
```

---

### 4.3 Détail des soldes par caisse

**GET** `/balance/by-caisse`

#### Description
Retourne les soldes détaillés par caisse physique.

#### Paramètres (query)
- `caisseId` (optionnel)
- `asOf` (optionnel)

#### Réponse (200)
```json
[
  {
    "caisseId": "CAISSE_01",
    "caisseLabel": "Caisse Principale",
    "solde": 50000,
    "devise": "XOF",
    "asOf": "2026-03-01T10:00:00Z"
  }
]
```

---

### 4.4 Détail des soldes par compte bancaire

**GET** `/balance/by-bank-account`

#### Description
Retourne les soldes détaillés par compte bancaire.

#### Paramètres (query)
- `bankAccountId` (optionnel)
- `asOf` (optionnel)

#### Réponse (200)
```json
[
  {
    "bankAccountId": "BANK_ACC_01",
    "bankName": "Banque Atlantique",
    "accountReference": "CI123456789",
    "solde": 340000,
    "devise": "XOF",
    "asOf": "2026-03-01T10:00:00Z"
  }
]
```

---

### 4.5 Journal consolidé de trésorerie

**GET** `/journal`

#### Description
Retourne le journal consolidé des mouvements de trésorerie.

#### Paramètres (query)
- `fromDate` (optionnel)
- `toDate` (optionnel)
- `source` (optionnel) : `CAISSE` | `BANQUE`
- `sourceId` (optionnel)

#### Réponse (200)
```json
[
  {
    "movementId": "MOV_001",
    "date": "2026-02-28",
    "source": "CAISSE",
    "sourceId": "CAISSE_01",
    "libelle": "Encaissement client",
    "montant": 15000,
    "devise": "XOF",
    "referenceExterne": "FACT_2026_001",
    "createdAt": "2026-02-28T09:15:00Z"
  }
]
```

---

## 5. Règles de sécurité et d'accès

- Accès en lecture uniquement
- Isolation stricte par tenant
- Aucune modification possible
- Aucune action déclenchée en aval

---

## 6. Erreurs standard

- `400` : paramètres invalides
- `401` : non authentifié
- `403` : accès interdit
- `404` : ressource inexistante
- `500` : erreur interne (sans effet de bord)

---

## 7. Évolution de l'API

- Toute évolution est **additive**
- Aucune suppression rétroactive
- Versionnement contractuel obligatoire

---

## 8. Statut du document

```
API_READ_ONLY STATUS
────────────────────────────────
Module        : Tresoconsolidation
Version       : v1.0.0
Type          : API GET uniquement
Gouvernance   : SPOFE P0
────────────────────────────────
```

Ce document constitue le contrat officiel de l'API du module Tresoconsolidation.
