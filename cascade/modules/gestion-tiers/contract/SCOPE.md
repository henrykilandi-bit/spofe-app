# 📐 SCOPE — MODULE GESTION DES TIERS

**Version :** v1.0.0  
**Framework :** SPOFE v2.1.0

## 🎯 Objectif du document

Ce document définit de manière explicite et non ambiguë le périmètre fonctionnel (IN / OUT) du module Gestion des Tiers.

👉 Il sert à :
- empêcher toute dérive fonctionnelle
- garantir la séparation des responsabilités
- sécuriser le BUILD_PROOF futur

**Toute fonctionnalité hors de ce périmètre est formellement exclue.**

## IN SCOPE
*(Ce que le module FAIT)*

### 1️⃣ Référentiel unique des tiers

- Création et gestion d'un tiers unique par tenant
- Attribution d'un `tierId` immutable
- Garantie d'unicité des tiers actifs

### 2️⃣ Gestion des rôles de tiers

Un tiers peut cumuler plusieurs rôles :
- Client
- Fournisseur
- Salarié
- Organisme social
- Autre (extensible par typage)

👉 Les rôles sont des qualifications, pas des entités séparées.

### 3️⃣ Données administratives et légales

Le module gère :
- raison sociale / nom
- forme juridique
- identifiants légaux (ICE, SIRET, etc.)
- pays et juridiction
- adresses (facturation, livraison, siège…)
- contacts (emails, téléphones, référents)

### 4️⃣ Documents Tiers (document-driven)

Le module gère les documents suivants :
- Fiche Tiers (création)
- Mise à jour Tiers
- Suspension Tiers
- Archivage Tiers

Chaque document :
- possède un état (`draft`, `validated`, `cancelled`)
- est validé par un `actor` SPOFE
- déclenche des events immuables

👉 **Aucune mutation sans document validé.**

### 5️⃣ Statuts du tiers

- **Actif :** utilisable dans les flux
- **Suspendu :** non utilisable dans de nouveaux flux
- **Archivé :** lecture seule, historique conservé

### 6️⃣ Traçabilité et historique

- Historique complet des modifications
- Append-only
- Traçabilité des acteurs et des dates
- Aucune suppression logique ou physique

### 7️⃣ Exposition des données (READ ONLY)

Le module expose en lecture seule :
- consultation d'un tiers par identifiant
- listes de tiers par rôle
- listes de tiers par statut
- filtres par tenant

👉 **API GET uniquement en v1.0.0**

## OUT OF SCOPE
*(Ce que le module NE FAIT PAS)*

Les éléments suivants sont **explicitement exclus** du périmètre :

### ❌ Fonctions financières et comptables

- suivi des créances
- créances douteuses
- lettrage / réconciliation
- calcul de soldes
- calcul des échéances
- délais de paiement
- provisions
- clôture comptable de comptes tiers

### ❌ Calculs et indicateurs

- DSO
- encours clients
- montants dus
- indicateurs de trésorerie
- KPI financiers

### ❌ Fiscalité et obligations légales

- TVA
- déclarations fiscales
- règles du plan comptable
- automatisation de conformité réglementaire

### ❌ Décisionnel et scoring

- scoring fournisseur
- credit risk
- classification automatique
- règles de blocage financier

👉 Ces responsabilités relèvent de modules distincts :
- Suivi de créances
- Credit Risk
- Comptabilité
- Trésorerie

## ⚖️ Règle de gouvernance (P0)

**Toute tentative d'implémenter une fonctionnalité listée OUT OF SCOPE dans le module Gestion des Tiers v1.0.0 entraîne l'invalidation du BUILD_PROOF.**

## 📦 Évolution future

- Toute extension fonctionnelle hors de ce scope :
  - nécessite un nouveau module
  - ou une version majeure v2+
- **Le présent scope est figé pour v1.0.0**

## Référentiel comptable

Ce module est **référentiel-agnostique**.

Les faits qu'il expose sont destinés à être rattachés aux comptes du **référentiel comptable OHADA** (par défaut), via des **modules comptables dédiés** (Précomptabilité, Comptabilité Générale), conformément à la :

**CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md**

Ce module :
- ne contient aucun numéro de compte comptable,
- n'implémente aucune règle comptable,
- ne produit aucune écriture comptable.

Toute logique de rattachement aux comptes (ex. 52, 57) est **strictement hors périmètre**.

## 🟢 Statut du scope

```
SCOPE STATUS
────────────────────────────────────
Module        : gestion-tiers
Version       : v1.0.0
State         : APPROVED
Governance    : SPOFE P0
Mutable       : NO
────────────────────────────────────
```

---

**✔️ FIN DU DOCUMENT SCOPE.md**
