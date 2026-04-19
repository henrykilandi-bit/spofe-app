# SCOPE — Module Tresoconsolidation

## 1. Objet du module

Le module **Tresoconsolidation** est un module **read-only transverse** dont la responsabilité est de fournir une **vision consolidée, factuelle et horodatée de la trésorerie** d'une entreprise.

Il agrège exclusivement les données issues des modules :
- **Trésorerie-Caisse**
- **Trésorerie-Banque**

Ce module ne crée aucun fait, n'écrit aucune donnée et n'implémente aucune logique métier ou comptable.

---

## 2. Principe fondamental

> **Tresoconsolidation est un module de lecture et d'agrégation factuelle uniquement.**

À ce titre :
- il consomme des **read-models certifiés**,
- il n'accède ni aux commandes ni aux événements bruts,
- il ne déclenche aucun traitement en aval.

---

## IN SCOPE

Le module Tresoconsolidation est responsable de :

### 3.1 Consolidation des soldes factuels
- solde total des caisses
- solde total des comptes bancaires
- solde global de trésorerie (somme arithmétique)

Les soldes sont fournis :
- à une date donnée,
- ou à l'instant courant selon les read-models disponibles.

---

### 3.2 Ventilation de la trésorerie
- par caisse
- par compte bancaire
- par source de trésorerie (CAISSE | BANQUE)
- par devise, si exposée par les modules sources

---

### 3.3 Journal consolidé des mouvements
- agrégation du journal de caisse et du journal bancaire
- tri chronologique unique
- identification explicite de la source :
  - `CAISSE`
  - `BANQUE`

---

### 3.4 Multi-caisses / multi-banques / multi-tenant
- aucune hypothèse métier sur le nombre de caisses
- aucune hypothèse métier sur le nombre de comptes bancaires
- stricte séparation par tenant

---

### 3.5 Exposition read-only
- exposition via API **GET uniquement**
- aucun endpoint d'écriture
- filtres autorisés :
  - période
  - source (CAISSE | BANQUE)
  - caisseId
  - bankAccountId

---

## OUT OF SCOPE

Le module Tresoconsolidation **ne fait PAS** :

- rapprochement de trésorerie
- calcul de solde disponible
- prévision de trésorerie
- alertes ou seuils
- logique budgétaire
- logique comptable
- utilisation des natures comptables
- activation de comptes
- production d'écritures
- interprétation métier
- intelligence ou optimisation

Ces fonctionnalités relèvent d'autres modules ou de versions ultérieures.

---

## 5. Sources de données autorisées

Le module consomme **exclusivement** :

- les read-models certifiés du module **Trésorerie-Caisse**
- les read-models certifiés du module **Trésorerie-Banque**

Toute autre source est interdite.

---

## 6. Règles de gouvernance

- Aucun accès en écriture n'est autorisé
- Aucune donnée n'est modifiable
- Aucune duplication de logique métier n'est permise
- Le module respecte strictement l'isolation multi-tenant
- Toute tentative de contournement est rejetée

---

## 7. Référentiel comptable

Ce module est **référentiel-agnostique**.

Les faits qu'il expose sont destinés à être rattachés aux comptes du **référentiel comptable OHADA** (par défaut), via des **modules comptables dédiés** (Précomptabilité, Comptabilité Générale), conformément à la :

**CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md**

Ce module :
- ne contient aucun numéro de compte comptable,
- n'implémente aucune règle comptable,
- ne produit aucune écriture comptable.

---

## 8. Statut du contrat

```
SCOPE STATUS
────────────────────────────────
Module : Tresoconsolidation
Version : v1.0.0
Type : Read-only transverse
Gouvernance : SPOFE P0
Évolutivité : v1.1+
────────────────────────────────
```

Ce contrat est **opposable** et constitue la référence normative du module.
