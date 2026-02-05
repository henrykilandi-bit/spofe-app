# Mapping OHADA ↔ PCG — SPOFE

Ce dossier définit le **mapping passif** entre le référentiel SYSCOHADA et le Plan Comptable Général (France).

---

## Principe fondamental

```
╔════════════════════════════════════════════════════════════════════╗
║  On ne mappe PAS des faits vers des comptes.                       ║
║  On mappe des NATURES COMPTABLES vers des comptes.                 ║
╚════════════════════════════════════════════════════════════════════╝
```

```
┌─────────────────────────────────────────────────────────────────┐
│  FAIT MÉTIER                                                    │
│       ↓                                                         │
│  NATURE COMPTABLE (neutre)                                      │
│       ↓                                                         │
│  COMPTE OHADA ←──────── MAPPING ────────→ COMPTE PCG            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Principes de gouvernance

| Règle | Application |
|-------|-------------|
| Mapping déclaratif | ✅ OUI |
| Logique métier | ❌ NON |
| Activation automatique | ❌ NON |
| Utilisé par modules métier | ❌ NON |
| Utilisé par modules comptables | ✅ OUI |

---

## Fichiers

| Fichier | Description |
|---------|-------------|
| `ohada-pcg.schema.json` | Structure officielle du mapping (JSON Schema) |
| `ohada-pcg.v1.json` | Règles de mapping v1.0 |

---

## Niveau de confiance (Confidence)

Chaque règle de mapping est associée à un **niveau de confiance** :

| Niveau | Signification | Action requise |
|--------|---------------|----------------|
| **HIGH** | Équivalence forte | Mapping automatique possible |
| **MEDIUM** | Équivalence fonctionnelle | Validation recommandée |
| **LOW** | Interprétation nécessaire | Validation explicite obligatoire |

👉 Toute règle **LOW** doit faire l'objet d'une validation explicite avant utilisation.

---

## Mappings clés (v1.0)

### Classe 5 — Trésorerie

| Fonction | OHADA | PCG | Confidence |
|----------|-------|-----|------------|
| Banques | **52** | **51** | HIGH |
| Caisse | **57** | **53** | HIGH |

### Classe 4 — Tiers

| Fonction | OHADA | PCG | Confidence |
|----------|-------|-----|------------|
| Clients | 41 | 41 | HIGH |
| Fournisseurs | 40 | 40 | HIGH |

### Classe 6/7 — Charges & Produits

| Fonction | OHADA | PCG | Confidence |
|----------|-------|-----|------------|
| Achats | 60 | 60 | HIGH |
| Ventes | 70 | 70 | HIGH |
| Charges financières | 67 | 66 | MEDIUM |
| Produits financiers | 73 | 76 | MEDIUM |

---

## Utilisation

Ce mapping est consommé **exclusivement** par :

- **Module Précomptabilité** (détermination des comptes cibles)
- **Module Comptabilité Générale** (génération d'écritures multi-référentiels)

```
╔════════════════════════════════════════════════════════════════════╗
║  ❌ Aucun module métier ne peut consommer ce mapping directement.  ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Extension

- Ce mapping peut être étendu vers d'autres paires : OHADA ↔ IFRS, PCG ↔ IFRS
- Chaque extension suit la même structure
- Le versionnement permet l'évolution sans régression

---

## Références normatives

- [CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md](../../../CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md)
- [CHARTE_GESTION_PLAN_COMPTES_SPOFE.md](../../../CHARTE_GESTION_PLAN_COMPTES_SPOFE.md)
- [Référentiel OHADA](../referentials/ohada/README.md)
- [Référentiel PCG](../referentials/pcg/README.md)

---

**Statut : PASSIF | DÉCLARATIF | VERSIONNÉ**  
**Date : 2026-02-03**
