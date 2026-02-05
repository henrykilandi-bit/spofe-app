# Référentiel comptable PCG — SPOFE

Ce dossier contient le référentiel passif du **Plan Comptable Général (France)**.

---

## Nature du référentiel

| Propriété | Valeur |
|-----------|--------|
| Type | **PASSIF** |
| Mode | **DÉCLARATIF** |
| Versionnement | **OUI** |
| Logique métier | **AUCUNE** |
| Structure | **IDENTIQUE À OHADA** |

---

## Règles de gouvernance

```
╔════════════════════════════════════════════════════════════════════╗
║                    RÈGLES D'UTILISATION P0                         ║
╠════════════════════════════════════════════════════════════════════╣
║  ❌ Aucun module métier ne consomme ce référentiel directement     ║
║  ✅ Seuls les modules comptables peuvent l'utiliser                ║
║  ✅ Les comptes ne sont activés que par usage                      ║
║  ❌ Le référentiel ne déclenche aucun comportement                 ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Fichiers

| Fichier | Description |
|---------|-------------|
| `pcg.schema.json` | Structure officielle (JSON Schema) |
| `pcg.v1.json` | Données du référentiel PCG 2014 |

---

## Interopérabilité multi-référentiels

Le référentiel PCG est **strictement aligné structurellement** avec le référentiel OHADA, permettant :

- un mapping multi-référentiels sans duplication de logique,
- une coexistence propre des deux référentiels,
- une extension future vers IFRS ou autres.

```
┌─────────────────────────────────────────────────────────────────┐
│                    ARCHITECTURE MULTI-RÉFÉRENTIELS              │
├─────────────────────────────────────────────────────────────────┤
│  governance/accounting/referentials/                            │
│  ├── ohada/                                                     │
│  │   ├── ohada.schema.json                                      │
│  │   └── ohada.v1.json                                          │
│  └── pcg/                                                       │
│      ├── pcg.schema.json                                        │
│      └── pcg.v1.json                                            │
└─────────────────────────────────────────────────────────────────┘
```

---

## Différences clés OHADA / PCG (Classe 5)

| Fonction | OHADA | PCG |
|----------|-------|-----|
| Banques | 52 | 51 |
| Caisse | 57 | 53 |
| Trésorerie | Classe 5 | Classe 5 |

👉 Ces différences sont **gérées par le module Précomptabilité**, jamais par les modules métier.

---

## Classes PCG (rappel)

| Classe | Désignation |
|--------|-------------|
| 1 | Comptes de capitaux |
| 2 | Comptes d'immobilisations |
| 3 | Comptes de stocks et en-cours |
| 4 | Comptes de tiers |
| 5 | Comptes financiers |
| 6 | Comptes de charges |
| 7 | Comptes de produits |
| 8 | Comptes spéciaux |

---

## Modules habilités

Seuls les modules suivants peuvent consommer ce référentiel :

- **Précomptabilité** (mapping faits → natures comptables)
- **Comptabilité Générale** (activation comptes, écritures)

---

## Évolution

- Toute modification du **schéma** nécessite une nouvelle charte de gouvernance
- Les **données** peuvent être enrichies sans changement de schéma
- Chaque version est identifiée : `pcg.v1.json`, `pcg.v2.json`, etc.

---

## Références normatives

- [CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md](../../../CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md)
- [CHARTE_GESTION_PLAN_COMPTES_SPOFE.md](../../../CHARTE_GESTION_PLAN_COMPTES_SPOFE.md)

---

**Statut : PASSIF | GELÉ | VERSIONNÉ**  
**Date : 2026-02-03**
