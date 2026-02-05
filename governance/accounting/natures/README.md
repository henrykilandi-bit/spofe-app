# Natures comptables — SPOFE

Les natures comptables sont le **pivot central** entre les faits métier et les comptes comptables.

---

## Définition fondamentale

```
╔════════════════════════════════════════════════════════════════════╗
║  Une NATURE COMPTABLE est une classification NEUTRE, STABLE et     ║
║  RÉFÉRENTIEL-AGNOSTIQUE d'un fait économique.                      ║
╚════════════════════════════════════════════════════════════════════╝
```

```
┌─────────────────────────────────────────────────────────────────┐
│  FAIT MÉTIER (module SPOFE)                                     │
│       ↓                                                         │
│  NATURE COMPTABLE   ←── PIVOT CENTRAL                           │
│       ↓                                                         │
│  COMPTE (OHADA / PCG)                                           │
└─────────────────────────────────────────────────────────────────┘
```

---

## Rôle des natures comptables

| Objectif | Description |
|----------|-------------|
| **Découplage** | Séparer le métier de la comptabilité |
| **Multi-référentiels** | Permettre OHADA, PCG, IFRS... |
| **Cohérence** | Garantir l'uniformité comptable |
| **Auditabilité** | Tracer chaque écriture jusqu'au fait |
| **Évolutivité** | S'adapter aux évolutions réglementaires |

---

## Structure d'une nature comptable

| Champ | Description | Exemple |
|-------|-------------|---------|
| `code` | Identifiant stable et universel | `ENCAISSEMENT_CLIENT` |
| `label` | Libellé lisible | "Encaissement client" |
| `direction` | Sens comptable abstrait | `DEBIT` ou `CREDIT` |
| `scope` | Lien logique avec les modules | `TRESORERIE`, `STOCK`... |
| `description` | Explication détaillée | "Encaissement d'un règlement client" |

---

## Scopes disponibles

| Scope | Modules SPOFE concernés |
|-------|-------------------------|
| `TRESORERIE` | Trésorerie Caisse, Trésorerie Banque |
| `TIERS` | Gestion des Tiers |
| `STOCK` | Gestion des Stocks |
| `IMMOBILISATION` | Immobilisation |
| `CHARGE` | Charges d'exploitation |
| `PRODUIT` | Produits d'exploitation |
| `AUTRE` | Cas spécifiques |

---

## Fichiers

| Fichier | Description |
|---------|-------------|
| `natures.schema.json` | Structure officielle (JSON Schema) |
| `natures.v1.json` | Natures comptables v1.0 |

---

## Natures comptables v1.0

| Code | Label | Direction | Scope |
|------|-------|-----------|-------|
| `ENCAISSEMENT_CLIENT` | Encaissement client | DEBIT | TRESORERIE |
| `DECAISSEMENT_FOURNISSEUR` | Décaissement fournisseur | CREDIT | TRESORERIE |
| `VENTE_PRODUIT` | Vente de produit | CREDIT | PRODUIT |
| `ACHAT_CHARGE` | Achat – charge | DEBIT | CHARGE |
| `MOUVEMENT_STOCK_ENTREE` | Entrée de stock | DEBIT | STOCK |
| `MOUVEMENT_STOCK_SORTIE` | Sortie de stock | CREDIT | STOCK |
| `ACQUISITION_IMMOBILISATION` | Acquisition immobilisation | DEBIT | IMMOBILISATION |
| `DOTATION_AMORTISSEMENT` | Dotation aux amortissements | DEBIT | CHARGE |
| `PRODUIT_FINANCIER` | Produit financier | CREDIT | PRODUIT |
| `CHARGE_FINANCIERE` | Charge financière | DEBIT | CHARGE |

---

## Règles de gouvernance

```
╔════════════════════════════════════════════════════════════════════╗
║                         RÈGLES P0                                  ║
╠════════════════════════════════════════════════════════════════════╣
║  ❌ Les modules métier n'utilisent JAMAIS les natures              ║
║  ✅ Seuls les modules comptables les utilisent                     ║
║  ✅ Une nature est stable, neutre et versionnée                    ║
║  ❌ Aucune suppression rétroactive                                 ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Flux complet SPOFE

```
┌─────────────────────────────────────────────────────────────────┐
│  MODULE MÉTIER                                                  │
│       ↓ (fait)                                                  │
│  PRÉCOMPTABILITÉ                                                │
│       ↓ (détermination)                                         │
│  NATURE COMPTABLE                                               │
│       ↓ (mapping)                                               │
│  COMPTE OHADA / PCG                                             │
│       ↓                                                         │
│  ÉCRITURE COMPTABLE                                             │
└─────────────────────────────────────────────────────────────────┘
```

👉 **Tout est traçable. Tout est gouverné.**

---

## Évolution

- Toute nouvelle nature nécessite une nouvelle version (`natures.v2.json`)
- Aucune suppression rétroactive
- Les natures existantes restent stables

---

## Références normatives

- [CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md](../../CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md)
- [CHARTE_GESTION_PLAN_COMPTES_SPOFE.md](../../CHARTE_GESTION_PLAN_COMPTES_SPOFE.md)
- [Référentiels comptables](../referentials/)
- [Mappings inter-référentiels](../mappings/)
- [Activations progressives](../activations/)

---

**Statut : PIVOT CENTRAL | STABLE | VERSIONNÉ**  
**Date : 2026-02-03**
