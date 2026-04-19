# Module Trésorerie Banque — SPOFE v1.0.0

## 1. Objectif du module

Le module Trésorerie Banque est responsable de la traçabilité factuelle des flux bancaires dématérialisés, constatés sur les comptes bancaires d'une entreprise, sur la base de documents bancaires électroniques officiels.

Il constitue une source de vérité bancaire, indépendante de toute interprétation comptable, financière ou prévisionnelle.

## 2. Gouvernance & référentiel

Le module est conçu conformément à la gouvernance SPOFE P0.

- **Référentiel comptable par défaut** : OHADA
- **Référentiels alternatifs** (PCG, IFRS…) : via adapters
- Le core métier est référentiel-agnostique
- Aucune règle comptable n'est implémentée dans ce module

**Référence normative obligatoire** :  
`cascade/governance/accounting/CHARTE_SPOFE_REFERENTIEL_COMPTABLE_P0.md`

## 3. Principe fondamental (non négociable)

> **Aucun mouvement bancaire n'existe sans document bancaire électronique validé.**

Les faits bancaires :
- sont constatés a posteriori,
- sont portés par des documents bancaires officiels,
- sont immuables,
- sont conservés en append-only.

**Le module constate les faits, il ne les initie jamais.**

## Référentiel comptable

Ce module est **référentiel-agnostique**.

Les faits qu'il expose sont destinés à être rattachés aux comptes du **référentiel comptable OHADA** (par défaut), via des **modules comptables dédiés** (Précomptabilité, Comptabilité Générale), conformément à la :

**CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md**

Ce module :
- ne contient aucun numéro de compte comptable,
- n'implémente aucune règle comptable,
- ne produit aucune écriture comptable.

Toute logique de rattachement aux comptes (ex. 52, 57) est **strictement hors périmètre**.

## IN SCOPE

### 4.1 Gestion multi-banques & multi-comptes (règle explicite)

Le module Trésorerie Banque gère un référentiel multi-comptes bancaires, potentiellement répartis sur plusieurs établissements bancaires, pour un même tenant.

Le module permet :
- la gestion de plusieurs banques par entreprise,
- la gestion de plusieurs comptes bancaires par banque,
- le rattachement explicite de chaque compte bancaire à :
  - un `tenantId`,
  - un `bankId` (ou code banque),
  - un `bankAccountId`,
- le suivi du statut du compte bancaire :
  - actif,
  - inactif / archivé.

👉 Chaque compte bancaire est une entité factuelle indépendante, support de flux bancaires constatés.

❗ **Aucune consolidation inter-comptes n'est effectuée dans le core du module.**

### 4.2 Documents bancaires gérés

Le module gère exclusivement des documents bancaires électroniques officiels, notamment :
- relevé bancaire,
- avis de débit,
- avis de crédit.

Chaque document bancaire :
- est rattaché à un compte bancaire précis,
- est électronique,
- est validé,
- est immuable après validation,
- sert de preuve factuelle aux mouvements constatés.

### 4.3 Faits bancaires gérés

Sur la base des documents bancaires, le module enregistre :
- crédits bancaires constatés,
- débits bancaires constatés,
- soldes bancaires à date (factuels, non interprétés).

👉 Les faits sont :
- horodatés,
- traçables,
- rattachés à un compte bancaire unique,
- sans enrichissement métier.

### 4.4 Traçabilité et isolation

Le module garantit :
- isolation stricte par tenant,
- absence totale de faits cross-banque,
- absence totale de faits cross-compte,
- historique complet des mouvements bancaires,
- conservation append-only des faits.

### 4.5 Read-models exposés

Le module expose en lecture seule :
- journal bancaire par compte,
- solde bancaire à date par compte,
- historique des mouvements bancaires,
- historique des relevés bancaires.

👉 Exposition GET uniquement, sans mutation.

## OUT OF SCOPE

Le module Trésorerie Banque ne fait **explicitement pas** :

- rapprochement bancaire (manuel ou automatique),
- émission de virements ou prélèvements,
- gestion des moyens de paiement (cartes, chèques émis),
- synchronisation API bancaire directe,
- import technique de fichiers bancaires (EBICS, SWIFT, OFX…),
- génération d'écritures comptables,
- calcul d'agios, commissions, intérêts,
- consolidation multi-comptes,
- prévision de trésorerie,
- alertes stratégiques,
- catégorisation comptable,
- détection de fraude,
- gestion des habilitations bancaires.

👉 Ces responsabilités relèvent :
- d'autres modules SPOFE,
- ou de versions ultérieures clairement séparées.

## 6. Responsabilité du module

Le module Trésorerie Banque est un module de **vérité factuelle bancaire**.

**Il :**
- constate les flux bancaires,
- enregistre des faits prouvés,
- trace leur origine documentaire,
- expose des états de lecture.

**Il ne :**
- décide pas,
- n'initie pas,
- n'interprète pas,
- ne rapproche pas.

## 7. Statut du scope

```
SCOPE STATUS
────────────────────────────────
Module        : Trésorerie Banque
Version       : v1.0.0
Niveau        : SPOFE P0
Référentiel   : OHADA-first
Multi-banques : OUI
Multi-comptes : OUI
Mutable       : NON
────────────────────────────────
```

## 8. Clause finale

Toute implémentation du module Trésorerie Banque doit respecter strictement ce périmètre.

Toute fonctionnalité sortant de ce scope :
- invalide le BUILD_PROOF,
- nécessite un nouveau contrat,
- ou un nouveau module.
