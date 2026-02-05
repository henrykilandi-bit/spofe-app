# Guardian d'activation des comptes — SPOFE

**SPOFE P0 — IMMUTABLE**

---

## Rôle

Le Guardian d'activation garantit que **toute activation de compte comptable** (OHADA, PCG ou autre référentiel) respecte strictement la gouvernance SPOFE.

```
╔════════════════════════════════════════════════════════════════════╗
║  Aucune activation ne peut être effective sans validation          ║
║  de ce Guardian.                                                   ║
╚════════════════════════════════════════════════════════════════════╝
```

👉 Il ne gère pas la comptabilité  
👉 Il **contrôle l'accès** au plan des comptes

---

## Invariants P0

### G-ACT-01 — Référentiel valide

Un compte ne peut être activé que s'il **existe dans un référentiel comptable passif valide**.

| Condition | Résultat |
|-----------|----------|
| Compte inexistant dans référentiel | **REJET** |
| Référentiel non reconnu | **REJET** |

---

### G-ACT-02 — Module autorisé

Seuls les **modules comptables** (Précomptabilité, Comptabilité Générale) sont autorisés à déclencher une activation.

| Module | Autorisé |
|--------|----------|
| Précomptabilité | ✅ OUI |
| Comptabilité Générale | ✅ OUI |
| Tout autre module | ❌ **REJET** |

---

### G-ACT-03 — Jamais par module métier

```
╔════════════════════════════════════════════════════════════════════╗
║  ❌ Aucun module métier (Stock, Tiers, Trésorerie, Immobilisation) ║
║     ne peut activer un compte comptable.                           ║
║                                                                    ║
║  Violation → REJET + AUDIT CRITIQUE                                ║
╚════════════════════════════════════════════════════════════════════╝
```

---

### G-ACT-04 — Activation traçable

Toute activation **doit contenir** :

| Champ | Obligatoire |
|-------|-------------|
| `tenantId` | ✅ |
| `referential` | ✅ |
| `account` | ✅ |
| `activatedAt` | ✅ |
| `activatedBy` | ✅ |
| `activationReason` | ✅ |

**Violation → REJET**

---

### G-ACT-05 — Pas d'activation globale

```
╔════════════════════════════════════════════════════════════════════╗
║  ❌ L'activation globale d'un plan ou d'une classe complète        ║
║     est INTERDITE.                                                 ║
║                                                                    ║
║  Violation → REJET                                                 ║
╚════════════════════════════════════════════════════════════════════╝
```

---

### G-ACT-06 — Mapping requis pour activation croisée

Une activation PCG déclenchée par OHADA nécessite :

- ✅ un mapping existant (`ohada-pcg.v*.json`)
- ✅ une règle de mapping valide pour ce compte

**Violation → REJET**

---

### G-ACT-07 — Confiance LOW = validation requise

Toute activation issue d'un mapping avec `confidence = LOW` nécessite une **validation humaine explicite**.

| Confidence | Action |
|------------|--------|
| HIGH | Activation automatique |
| MEDIUM | Activation avec log |
| LOW | **Validation humaine requise** |

**Violation → REJET**

---

### G-ACT-08 — Activation idempotente

Un compte **déjà activé** ne peut être réactivé.

| Situation | Résultat |
|-----------|----------|
| Compte non activé | Activation |
| Compte déjà activé | **IGNORÉ** (idempotence) |

---

## Flux de validation

```
┌─────────────────────────────────────────────────────────────────┐
│  ACTIVATION REQUEST                                             │
│       ↓                                                         │
│  G-ACT-01 : Référentiel valide ?                                │
│       ↓                                                         │
│  G-ACT-02 : Module autorisé ?                                   │
│       ↓                                                         │
│  G-ACT-03 : Pas un module métier ?                              │
│       ↓                                                         │
│  G-ACT-04 : Activation traçable ?                               │
│       ↓                                                         │
│  G-ACT-05 : Pas d'activation globale ?                          │
│       ↓                                                         │
│  G-ACT-06 : Mapping valide (si croisé) ?                        │
│       ↓                                                         │
│  G-ACT-07 : Confidence OK ?                                     │
│       ↓                                                         │
│  G-ACT-08 : Pas déjà activé ?                                   │
│       ↓                                                         │
│  ✅ ACTIVATION EFFECTIVE + AUDIT EVENT                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## Portée

| Dimension | Couverture |
|-----------|------------|
| Multi-tenant | ✅ OUI |
| Multi-référentiels | ✅ OUI (OHADA, PCG, IFRS...) |
| Durée | **À vie** |

---

## Références normatives

- [CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md](../../CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md)
- [CHARTE_GESTION_PLAN_COMPTES_SPOFE.md](../../CHARTE_GESTION_PLAN_COMPTES_SPOFE.md)
- [Activations progressives](../activations/README.md)
- [Audit des activations](../audit/ACTIVATION_AUDIT.md)

---

**Statut : GUARDIAN P0 — IMMUTABLE**  
**Date : 2026-02-03**
