# Référentiel comptable OHADA — SPOFE

Ce dossier contient le référentiel comptable **SYSCOHADA** utilisé par SPOFE.

---

## Nature du référentiel

| Propriété | Valeur |
|-----------|--------|
| Type | **PASSIF** |
| Mode | **DÉCLARATIF** |
| Versionnement | **OUI** |
| Logique métier | **AUCUNE** |

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
| `ohada.schema.json` | Structure officielle (JSON Schema) |
| `ohada.v1.json` | Données du référentiel SYSCOHADA 2017 |

---

## Structure hiérarchique

```
Référentiel OHADA
└── Classes (1-9)
    └── Comptes (niveau 2)
        └── Sous-comptes (niveau 3)
            └── Sous-sous-comptes (niveau 4+)
```

---

## Classes SYSCOHADA (rappel)

| Classe | Désignation |
|--------|-------------|
| 1 | Comptes de ressources durables |
| 2 | Comptes d'actif immobilisé |
| 3 | Comptes de stocks |
| 4 | Comptes de tiers |
| 5 | Comptes de trésorerie |
| 6 | Comptes de charges des activités ordinaires |
| 7 | Comptes de produits des activités ordinaires |
| 8 | Comptes des autres charges et autres produits |
| 9 | Comptes des engagements hors bilan et comptabilité analytique |

---

## Modules habilités

Seuls les modules suivants peuvent consommer ce référentiel :

- **Précomptabilité** (mapping faits → natures comptables)
- **Comptabilité Générale** (activation comptes, écritures)

---

## Évolution

- Toute modification du **schéma** nécessite une nouvelle charte de gouvernance
- Les **données** peuvent être enrichies (ajout de comptes) sans changement de schéma
- Chaque version est identifiée : `ohada.v1.json`, `ohada.v2.json`, etc.

---

## Références normatives

- [CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md](../../../CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md)
- [CHARTE_GESTION_PLAN_COMPTES_SPOFE.md](../../../CHARTE_GESTION_PLAN_COMPTES_SPOFE.md)

---

**Statut : PASSIF | GELÉ | VERSIONNÉ**  
**Date : 2026-02-03**
