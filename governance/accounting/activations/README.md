# Activation progressive des comptes — SPOFE

Les comptes comptables dans SPOFE sont **activés uniquement par usage réel ou décision explicite**.

---

## Principe fondamental

```
╔════════════════════════════════════════════════════════════════════╗
║  Un compte EXISTE dans le référentiel,                             ║
║  mais n'EXISTE FONCTIONNELLEMENT que s'il est ACTIVÉ.              ║
╠════════════════════════════════════════════════════════════════════╣
║  Référentiel = CONNAISSANCE                                        ║
║  Activation  = USAGE                                               ║
║  Usage       = MODULE COMPTABLE uniquement                         ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Architecture

```
governance/accounting/
├── referentials/          ← Connaissance (passif)
│   ├── ohada/
│   └── pcg/
├── mappings/              ← Correspondances inter-référentiels
│   └── ohada-pcg/
└── activations/           ← Usage (actif)
    ├── schema.json
    ├── tenant-activations.v1.json
    └── README.md
```

---

## Fichiers

| Fichier | Description |
|---------|-------------|
| `schema.json` | Structure officielle des activations (JSON Schema) |
| `tenant-activations.v1.json` | Exemple d'activations par tenant |

---

## Principes de gouvernance

| Règle | Application |
|-------|-------------|
| Activation ≠ Création | ✅ Le compte existe déjà dans le référentiel |
| Traçabilité obligatoire | ✅ Qui, quand, pourquoi |
| Multi-tenant natif | ✅ Chaque tenant a ses activations |
| Modules comptables uniquement | ✅ Précomptabilité, Comptabilité Générale |

---

## Raisons d'activation

| Raison | Description | Déclencheur |
|--------|-------------|-------------|
| **USAGE** | Fait métier nécessitant ce compte | Précomptabilité |
| **CONFIGURATION** | Décision administrative | Admin / Paramétrage |
| **REGULATORY** | Obligation réglementaire | Conformité |

---

## Ce qui active un compte ✅

- Un fait métier nécessitant une nature comptable
- Une configuration explicite (admin)
- Une obligation réglementaire

---

## Ce qui n'active JAMAIS un compte ❌

```
╔════════════════════════════════════════════════════════════════════╗
║  ❌ La simple existence dans le référentiel                        ║
║  ❌ Un module métier                                               ║
║  ❌ Une projection / read-model                                    ║
║  ❌ Une API read-only                                              ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## Flux d'activation (Précomptabilité)

```
┌─────────────────────────────────────────────────────────────────┐
│  FAIT MÉTIER                                                    │
│       ↓                                                         │
│  NATURE COMPTABLE                                               │
│       ↓                                                         │
│  VÉRIFICATION RÉFÉRENTIEL                                       │
│       ↓                                                         │
│  ACTIVATION SI ABSENTE  ←── traçabilité obligatoire             │
│       ↓                                                         │
│  ÉCRITURE PRÉCOMPTABLE                                          │
└─────────────────────────────────────────────────────────────────┘
```

👉 **Jamais l'inverse.**

---

## Exemple d'activation

```json
{
  "class": "5",
  "account": "521",
  "activationReason": "USAGE",
  "activatedBy": "PRECOMPTA_ENGINE",
  "activatedAt": "2026-01-15T09:31:00Z"
}
```

Le compte **521** (Banques locales) n'est activé que lorsqu'un fait de trésorerie banque le nécessite.

---

## Interdictions explicites (P0)

| Interdit | Motif |
|----------|-------|
| ❌ Activation automatique globale | Pollution fonctionnelle |
| ❌ Activation par les modules métier | Violation de séparation |
| ❌ Duplication du plan comptable | Dette structurelle |
| ❌ Activation sans traçabilité | Non-conformité audit |

---

## Auditabilité

Le système permet de répondre à :

- Quels comptes sont activés pour ce tenant ?
- Quand ont-ils été activés ?
- Par qui (humain ou moteur) ?
- Pour quelle raison ?

👉 **Conformité audit garantie.**

---

## Références normatives

- [CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md](../../CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md)
- [CHARTE_GESTION_PLAN_COMPTES_SPOFE.md](../../CHARTE_GESTION_PLAN_COMPTES_SPOFE.md)
- [Référentiel OHADA](../referentials/ohada/README.md)
- [Référentiel PCG](../referentials/pcg/README.md)

---

## Activation multi-référentiels

SPOFE permet l'activation progressive des comptes sur **plusieurs référentiels** (OHADA, PCG).

### Modes d'activation

| Mode | Description | Exemple |
|------|-------------|---------|
| **Direct** | Activation sur le référentiel cible | Tenant PCG-first |
| **Par correspondance** | Activation déclenchée via mapping | OHADA → PCG |

### Mode A — Activation directe PCG

Utilisé quand :
- l'entreprise est **PCG-first**,
- ou travaille **exclusivement en PCG**.

```json
{
  "class": "5",
  "account": "51",
  "activationReason": "USAGE",
  "activatedBy": "PRECOMPTA_ENGINE",
  "activatedAt": "2026-02-01T09:00:00Z"
}
```

### Mode B — Activation PCG par correspondance OHADA (recommandé)

```
┌─────────────────────────────────────────────────────────────────┐
│  Activation OHADA (compte 52)                                   │
│       ↓                                                         │
│  Consultation mapping OHADA ↔ PCG                               │
│       ↓                                                         │
│  Activation PCG correspondante (compte 51)                      │
└─────────────────────────────────────────────────────────────────┘
```

L'origine OHADA est **explicitement traçable** :

```json
{
  "class": "5",
  "account": "51",
  "activationReason": "USAGE",
  "activatedBy": "PRECOMPTA_ENGINE (OHADA→PCG)",
  "activatedAt": "2026-01-15T09:32:00Z"
}
```

### Règles de cohérence OHADA ↔ PCG

| Cas | Autorisé | Action |
|-----|----------|--------|
| Compte PCG activé sans équivalent OHADA | ✅ OUI | Documenter (CONFIGURATION) |
| Compte OHADA activé sans équivalent PCG | ✅ OUI | PCG non obligatoire |
| Mapping LOW confidence | ⚠️ OUI | Validation humaine requise |

### Fichiers d'activation

| Fichier | Description |
|---------|-------------|
| `tenant-activations.v1.json` | Activations OHADA (exemple) |
| `tenant-activations-pcg.v1.json` | Activations PCG directes |
| `tenant-activations-pcg-from-ohada.v1.json` | Activations PCG par correspondance |

---

**Statut : ACTIF | TRAÇABLE | MULTI-TENANT | MULTI-RÉFÉRENTIELS**  
**Date : 2026-02-03**
