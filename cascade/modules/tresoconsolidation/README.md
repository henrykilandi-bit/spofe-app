# Module tresoconsolidation

> **🔒 FROZEN v1.0.0 — SPOFE P0 CERTIFIED**

## Statut

```
════════════════════════════════════════════════════════════════
MODULE STATUS
────────────────────────────────────────────────────────────────
Module          : tresoconsolidation
Version         : v1.0.0
Type            : Read-only transverse
Gouvernance     : SPOFE P0
Status          : ✅ FROZEN
Certified At    : 2026-02-03T15:47:24Z
════════════════════════════════════════════════════════════════
```

## Signature

```
SHA256: 7486A878A0F9F0CB130C90DB9C80FF25CD2FA4691C9CFAEA05787255075A2FFD
```

## Description

Module **read-only transverse** fournissant une vision consolidée de la trésorerie.

**Sources :**
- `tresorerie-caisse` (certifié BUILD_PROOF)
- `tresorerie-banque` (certifié BUILD_PROOF)

## API Endpoints (GET only)

| Endpoint | Description |
|----------|-------------|
| `GET /balance` | Solde consolidé global |
| `GET /balance/by-source` | Ventilation CAISSE / BANQUE |
| `GET /balance/by-caisse` | Détail par caisse |
| `GET /balance/by-bank-account` | Détail par compte bancaire |
| `GET /journal` | Journal consolidé chronologique |

## Guardian (10 invariants P0)

- G-TRESO-01: Read-only strict
- G-TRESO-02: Sources autorisées uniquement
- G-TRESO-03: Interdiction accès couches write
- G-TRESO-04: Isolation multi-tenant
- G-TRESO-05: Pas de logique métier
- G-TRESO-06: Pas de logique comptable
- G-TRESO-07: Agrégation déterministe
- G-TRESO-08: Traçabilité de la source
- G-TRESO-09: Données certifiées uniquement
- G-TRESO-10: API GET uniquement

## Tests

| Suite | Tests | Status |
|-------|-------|--------|
| Guardian P0 | 21 | ✅ PASS |
| System E2E | 7 | ✅ PASS |
| **TOTAL** | **28** | **✅ PASS** |

## Structure

```
tresoconsolidation/
├── contract/
│   ├── SCOPE.md
│   ├── GUARDIAN.md
│   ├── READ_MODELS.md
│   └── API_READ_ONLY.md
├── src/
│   ├── guardian/
│   ├── application/
│   ├── read-models/
│   └── api/
├── tests/
│   ├── guardian/
│   └── system/
├── BUILD_PROOF_GLOBAL.json
├── BUILD_PROOF_GLOBAL.sha256
├── BUILD_PROOF_GLOBAL.sig
└── README.md
```

## Certification

Ce module est **FROZEN** et **IMMUTABLE**.
Toute modification nécessite une nouvelle version.
