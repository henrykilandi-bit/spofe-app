# 📜 CHARTE DE GESTION DU PLAN DES COMPTES — SPOFE

**SPOFE P0 — Référentiels comptables déclaratifs**  
**Version :** 1.1.0  
**Date :** 2026-02-03  
**Statut :** NORMATIF — OPPOSABLE

---

## 1. Objet de la charte

La présente charte définit la manière dont le plan des comptes est géré dans SPOFE, indépendamment des modules métier.

Elle vise à garantir :

- la conformité réglementaire (OHADA-first),
- la flexibilité d'usage,
- l'évolutivité multi-référentiels,
- l'absence de dette structurelle.

**Cette charte est normative, opposable et s'impose à tous les modules comptables présents et futurs.**

---

## 2. Principe fondamental

Dans SPOFE, **le plan des comptes n'est jamais codé en dur**.

Il est :

- **référencé**,
- **déclaratif**,
- **versionné**,
- et **activé uniquement par l'usage**.

---

## 3. Référentiel comptable passif

### 3.1 Définition

Un **référentiel comptable passif** est un ensemble de données décrivant :

- la structure officielle d'un plan comptable,
- ses classes,
- ses comptes,
- leurs libellés et hiérarchies,

👉 **sans déclencher aucun comportement automatique.**

### 3.2 Référentiel OHADA

Le plan comptable SYSCOHADA est intégré dans SPOFE comme :

- un référentiel normatif passif,
- conforme aux textes officiels,
- versionné selon les évolutions réglementaires.

Il peut être stocké sous forme :

- de données (JSON, YAML, tables),
- lisibles,
- auditables.

---

## 4. Activation progressive des comptes (principe clé)

**Un compte comptable n'existe fonctionnellement dans SPOFE que s'il est utilisé.**

Cela implique :

- ❌ aucun chargement automatique de l'intégralité du plan,
- ❌ aucune obligation d'utiliser tous les comptes,
- ✅ activation à la demande,
- ✅ activation par usage métier réel.

👉 **Exemple :**

- le compte **57\*** (Caisse) n'est activé que si des faits de trésorerie caisse existent,
- le compte **52\*** (Banque) n'est activé que si des faits bancaires existent.

---

## 5. Séparation stricte des responsabilités

### 5.1 Modules métier

Les modules métier SPOFE :

- ✅ ne connaissent pas le plan des comptes,
- ✅ n'exposent que des faits,
- ✅ ignorent totalement les numéros de comptes.

```
╔════════════════════════════════════════════════════════════════════╗
║  ❌ Toute tentative d'introduire un numéro de compte dans un       ║
║     module métier constitue une violation de gouvernance.          ║
╚════════════════════════════════════════════════════════════════════╝
```

### 5.2 Modules comptables

Les modules comptables (Précomptabilité, Comptabilité Générale) sont les **seuls habilités** à :

- consulter les référentiels comptables,
- activer des comptes,
- mapper des faits métier vers :
  - des natures comptables,
  - puis des comptes (OHADA, PCG, etc.).

---

## 6. Principe de multi-référentiels

SPOFE permet la coexistence de plusieurs référentiels comptables :

| Référentiel | Statut |
|-------------|--------|
| SYSCOHADA | Par défaut |
| PCG | Optionnel |
| IFRS | Optionnel |
| Référentiels sectoriels ou nationaux | Optionnel |

Chaque référentiel est :

- **indépendant**,
- **versionné**,
- **activé explicitement**.

👉 **Aucun référentiel ne peut polluer le core métier.**

---

## 7. Gouvernance et auditabilité

Le système doit permettre :

- d'identifier quel référentiel est utilisé,
- quelle version est active,
- quels comptes sont activés,
- à partir de quels faits métier.

👉 **Toute écriture comptable doit être traçable jusqu'au fait source.**

```
┌─────────────────────────────────────────────────────────────────┐
│  FAIT MÉTIER  →  NATURE COMPTABLE  →  COMPTE ACTIVÉ  →  ÉCRITURE │
│     (source)        (mapping)         (référentiel)     (trace)  │
└─────────────────────────────────────────────────────────────────┘
```

---

## 8. Interdictions explicites (P0)

Sont **formellement interdits** :

| Interdit | Motif |
|----------|-------|
| ❌ Hardcodage des plans de comptes | Rigidité, dette technique |
| ❌ Activation globale automatique | Pollution fonctionnelle |
| ❌ Création libre de comptes sans référentiel | Non-conformité |
| ❌ Duplication du plan dans les modules métier | Violation de séparation |
| ❌ Dépendance directe d'un module métier à un compte comptable | Couplage interdit |

```
╔════════════════════════════════════════════════════════════════════╗
║         Toute violation invalide la conformité SPOFE.              ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## 9. Clause de référence obligatoire

Tout module comptable SPOFE **DOIT** référencer explicitement :

- la **CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md**,
- la présente charte.

```
« Ce module comptable respecte les principes de gestion du plan des comptes
définis dans la CHARTE_GESTION_PLAN_COMPTES_SPOFE.md.
Les comptes sont référencés de manière déclarative, versionnée et activés
uniquement par usage, conformément à la gouvernance SPOFE P0. »
```

---

## 10. Statut de la charte

```
╔════════════════════════════════════════════════════════════════════╗
║                         CHARTE STATUS                              ║
╠════════════════════════════════════════════════════════════════════╣
║  Nom            : CHARTE_GESTION_PLAN_COMPTES_SPOFE                ║
║  Niveau         : SPOFE P0                                         ║
║  Type           : Gouvernance comptable                            ║
║  Référentiel    : Déclaratif / Passif                              ║
║  Modifiable     : NON                                              ║
║  Opposable      : OUI                                              ║
╚════════════════════════════════════════════════════════════════════╝
```

---

## 11. Clause finale

Cette charte garantit que SPOFE :

- ✅ reste conforme aux référentiels officiels,
- ✅ demeure flexible face aux évolutions réglementaires,
- ✅ évite toute rigidité inutile,
- ✅ et préserve un core métier sain et durable.

---

**Certifié SPOFE P0**  
**Date d'entrée en vigueur : 2026-02-03**  
**Status : GELÉ & OPPOSABLE**

---

**Référence complémentaire :**  
[CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md](CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md)
