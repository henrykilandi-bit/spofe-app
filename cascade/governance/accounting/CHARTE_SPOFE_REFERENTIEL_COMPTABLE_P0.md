# CHARTE SPOFE
## Référentiel Comptable & Gouvernance Économique

**Statut :** FONDATRICE (P0)  
**Niveau :** P0 – GOUVERNANCE  
**Portée :** Transverse à tous les modules  
**Applicabilité :** OBLIGATOIRE  
**Version :** 1.1.0  
**Date :** 2026-02-03

---

## 1. Objet de la charte

La présente charte définit le principe de gouvernance comptable et économique du système SPOFE, ainsi que la hiérarchie des référentiels comptables pris en charge.

Elle vise à garantir :

- la neutralité économique du cœur du système,
- la conformité réglementaire multi-juridictionnelle,
- la pérennité architecturale de SPOFE.

## 2. Principe fondamental SPOFE

**SPOFE est un système de gestion des faits économiques,  
et non un système comptable dépendant d'un référentiel unique.**

En conséquence :

- SPOFE capture des **faits économiques réels**,
- SPOFE ne produit **pas d'écritures comptables** dans son cœur,
- SPOFE délègue toute interprétation comptable à des **couches dédiées**.

## 3. Référentiel comptable par défaut

### 🔹 Décision officielle

**Le référentiel comptable par défaut de SPOFE est le référentiel OHADA.**

Ce choix s'explique par :

- sa portée multi-pays,
- sa structuration rigoureuse,
- sa cohérence avec les économies émergentes,
- sa compatibilité naturelle avec une approche factuelle.

## 4. Statut des autres référentiels (PCG, IFRS, etc.)

Les autres référentiels comptables sont traités comme des **extensions optionnelles**, jamais comme le socle.

### Hiérarchie officielle :

```
📊 SPOFE Core
   ├─ neutre
   ├─ factuel
   └─ indépendant de tout référentiel

📋 Précomptabilité SPOFE
   ├─ interprétation économique générique
   └─ sans dépendance réglementaire directe

🔌 Adapters comptables
   ├─ OHADA (par défaut)
   ├─ PCG (extension)
   └─ IFRS (extension future)
```

👉 **Aucun référentiel ne doit influencer la conception des modules factuels.**

## 5. Impact sur la conception des modules

### 5.1 Modules factuels (actifs, flux, opérations)

Les modules suivants sont **référentiel-agnostiques** :

- Immobilisation
- Stock
- Gestion des tiers
- Trésorerie caisse
- Trésorerie banque

Ils manipulent uniquement :

- des **faits observables**,
- des **documents validés**,
- des **événements traçables**.

**Aucune écriture comptable n'y est autorisée.**

### 5.2 Modules interprétatifs

Les modules suivants sont **référentiel-dépendants** :

- Précomptabilité
- Comptabilité
- Reporting réglementaire

Ils consomment les faits produits par les modules factuels et appliquent :

- les règles **OHADA** (par défaut),
- ou celles d'un autre référentiel via **adapter**.

## 6. Principe d'extension par adapter

Tout ajout ou support d'un nouveau référentiel comptable doit respecter le principe suivant :

**Un référentiel comptable est un adapter, jamais une dépendance du core.**

### Structure de référence :

```
accounting/
├── pre-accounting/
└── adapters/
    ├── ohada/
    ├── pcg/
    └── ifrs/
```

**Toute violation de ce principe est considérée comme une rupture de gouvernance.**

## 7. Compatibilité OHADA / PCG

La structure fondamentale des classes comptables (2 à 5 notamment) étant commune entre OHADA et PCG, la conception actuelle de SPOFE est :

- ✔ **OHADA-first** par défaut,
- ✔ **PCG-compatible** par extension,
- ✔ sans duplication de logique,
- ✔ sans refactorisation du core.

## 8. Règle d'or SPOFE

> **Les faits économiques sont universels.  
> Leur interprétation comptable est contextuelle.**

**SPOFE sépare strictement ces deux dimensions.**

## 9. Gouvernance et opposabilité

La présente charte :

- fait partie intégrante de la **gouvernance SPOFE P0**,
- est **opposable** à toute évolution de module,
- **prévaut** sur toute décision locale ou technique.

Toute dérogation nécessite :

- une **justification écrite**,
- une **validation d'architecture**,
- une **version supérieure** de la charte.

## 10. Statut final

```
🏛️ CHARTE SPOFE — RÉFÉRENTIEL COMPTABLE
───────────────────────────────────────
Référentiel par défaut : OHADA
PCG                   : EXTENSION
IFRS                  : EXTENSION
Niveau                : P0
Statut                : ACTIF
Mutable               : NON (v1)
───────────────────────────────────────
```

---

### 🧠 Mot de l'architecte (officiel)

> Cette charte positionne SPOFE non comme un logiciel comptable local,  
> mais comme une **plateforme économique universelle**, adaptable,  
> durable et gouvernée.

---

**Date de création :** 2026-02-03  
**Version :** 1.0  
**Statut :** ACTIF - P0 GOUVERNANCE  
**Révision :** Nécessite validation architecturale