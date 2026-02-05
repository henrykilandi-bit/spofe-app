# Audit des activations comptables — SPOFE

**SPOFE P0 — IMMUTABLE**

---

## Principe fondamental

```
╔════════════════════════════════════════════════════════════════════╗
║  Toute activation de compte comptable génère un événement          ║
║  d'audit IMMUABLE.                                                 ║
║                                                                    ║
║  Aucun événement d'audit ne peut être modifié ou supprimé.         ║
╚════════════════════════════════════════════════════════════════════╝
```

👉 L'audit permet de répondre à :  
**"Pourquoi ce compte a-t-il été activé, quand, par qui, et à partir de quel fait ?"**

---

## Événement d'audit standard

Chaque activation génère un enregistrement contenant au minimum :

| Champ | Type | Description |
|-------|------|-------------|
| `auditId` | string | Identifiant unique de l'événement |
| `tenantId` | string | Identifiant du tenant |
| `referential` | enum | OHADA / PCG / IFRS |
| `class` | string | Classe du compte (1-8) |
| `account` | string | Numéro du compte |
| `activationReason` | enum | USAGE / CONFIGURATION / REGULATORY |
| `sourceModule` | string | Module déclencheur |
| `sourceEvent` | string? | Événement source (si applicable) |
| `mappingUsed` | string? | Mapping utilisé (si activation croisée) |
| `confidenceLevel` | enum? | HIGH / MEDIUM / LOW (si mapping) |
| `activatedBy` | string | Acteur (humain ou moteur) |
| `activatedAt` | datetime | Date et heure UTC |

---

## Types d'événements audités

| Type | Description |
|------|-------------|
| `ACTIVATION_CREATED` | Compte nouvellement activé |
| `ACTIVATION_REJECTED` | Activation refusée par le Guardian |
| `ACTIVATION_SKIPPED` | Activation ignorée (idempotence) |
| `ACTIVATION_REQUIRES_VALIDATION` | Validation humaine requise |
| `ACTIVATION_APPROVED` | Validation humaine accordée |
| `ACTIVATION_DENIED` | Validation humaine refusée |

---

## Règles d'audit P0

### A-AUD-01 — Append-only

```
╔════════════════════════════════════════════════════════════════════╗
║  Aucun événement ne peut être modifié ou supprimé.                 ║
║                                                                    ║
║  Toute tentative de modification = VIOLATION CRITIQUE              ║
╚════════════════════════════════════════════════════════════════════╝
```

---

### A-AUD-02 — Traçabilité complète

Toute activation doit être reliée :

| Source | Exemple |
|--------|---------|
| Fait métier | Encaissement client → ENCAISSEMENT_CLIENT → 52 |
| Configuration explicite | Admin active 57 manuellement |
| Obligation réglementaire | Compte obligatoire secteur bancaire |

---

### A-AUD-03 — Lisibilité humaine

Les événements doivent être **compréhensibles par un auditeur non technique**.

Exemple d'événement lisible :

```json
{
  "auditId": "AUD-2026-0001",
  "description": "Le compte 52 (Banques) a été activé automatiquement suite à l'enregistrement d'un crédit bancaire pour le tenant TENANT_001",
  "tenantId": "TENANT_001",
  "referential": "OHADA",
  "account": "52",
  "activationReason": "USAGE",
  "sourceModule": "PRECOMPTA_ENGINE",
  "activatedAt": "2026-01-15T09:30:00Z"
}
```

---

### A-AUD-04 — Consultable read-only

Les données d'audit sont exposées **uniquement via des API GET**.

| Opération | Autorisée |
|-----------|-----------|
| GET (lecture) | ✅ OUI |
| POST (création) | ✅ OUI (système uniquement) |
| PUT (modification) | ❌ NON |
| DELETE (suppression) | ❌ NON |

---

## Flux d'audit

```
┌─────────────────────────────────────────────────────────────────┐
│  FAIT MÉTIER                                                    │
│       ↓                                                         │
│  NATURE COMPTABLE                                               │
│       ↓                                                         │
│  COMPTE CIBLE ABSENT ?                                          │
│       ↓                                                         │
│  ACTIVATION REQUEST                                             │
│       ↓                                                         │
│  GUARDIAN (validation)                                          │
│       ↓                                                         │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  AUDIT EVENT (immuable)                                  │   │
│  │  - ACTIVATION_CREATED                                    │   │
│  │  - ACTIVATION_REJECTED                                   │   │
│  │  - ACTIVATION_SKIPPED                                    │   │
│  │  - ACTIVATION_REQUIRES_VALIDATION                        │   │
│  └──────────────────────────────────────────────────────────┘   │
│       ↓                                                         │
│  ACTIVATION EFFECTIVE (si validé)                               │
└─────────────────────────────────────────────────────────────────┘
```

---

## Cas d'usage audit

### Audit interne

> "Lister tous les comptes activés pour TENANT_001 en janvier 2026"

### Audit externe

> "Prouver que le compte 52 a été activé suite à un fait bancaire réel"

### Conformité réglementaire

> "Démontrer que seuls les modules comptables activent des comptes"

---

## Portée

| Dimension | Couverture |
|-----------|------------|
| Audit interne | ✅ OUI |
| Audit externe | ✅ OUI |
| Conformité réglementaire | ✅ OUI |
| Durée de rétention | **Permanente** |

---

## Références normatives

- [CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md](../../CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md)
- [CHARTE_GESTION_PLAN_COMPTES_SPOFE.md](../../CHARTE_GESTION_PLAN_COMPTES_SPOFE.md)
- [Guardian d'activation](../guardians/ACTIVATION_GUARDIAN.md)
- [Activations progressives](../activations/README.md)

---

**Statut : AUDIT P0 — IMMUTABLE**  
**Date : 2026-02-03**
