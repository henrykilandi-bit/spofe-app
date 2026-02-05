# MODULE STOCK — SCOPE

**Module:** gestion-stocks  
**Version:** v1.0.0  
**Statut:** OFFICIEL — Contractuel  
**Type:** Module métier SPOFE  

---

## 🎯 Objectif

Définir de manière non ambiguë le périmètre fonctionnel du module **Stock**, incluant ses responsabilités, ses limites et ses exclusions explicites.

---

## ✅ IN SCOPE — v1.0.0

Le module Stock est responsable de :

- La gestion des **quantités physiques** de stock
- La gestion **multi-dépôts**
- La gestion des **catégories de stock**
- La gestion des **documents de stock**
- La génération des **mouvements physiques**
- La **traçabilité complète** des mouvements (append-only)
- L'exposition d'**états projetés (read-models)** :
  - Stock par dépôt
  - Stock par catégorie
  - Stock par produit
  - Historique des mouvements
- La validation des règles métier via le **Guardian Stock**
- L'exposition d'API **GET uniquement**

---

## ❌ OUT OF SCOPE — v1.0.0

Le module Stock ne gère **aucun** des éléments suivants :

- Calcul de prix de vente
- Calcul de coûts ou valorisation financière
- Comptabilisation
- Budgets
- Production
- MRP
- Réapprovisionnement automatique
- Prévisions intelligentes
- Optimisation de stock
- Simulation avancée
- Scoring fournisseurs

---

## 🔒 Règle de non-recouvrement

Le module Stock est une **source de vérité physique**, jamais financière.

Toute tentative d'introduire des responsabilités financières, budgétaires ou comptables constitue une violation contractuelle.

---

## Référentiel comptable

Ce module est **référentiel-agnostique**.

Les faits qu'il expose sont destinés à être rattachés aux comptes du **référentiel comptable OHADA** (par défaut), via des **modules comptables dédiés** (Précomptabilité, Comptabilité Générale), conformément à la :

**CHARTE_REFERENTIEL_COMPTABLE_SPOFE.md**

Ce module :
- ne contient aucun numéro de compte comptable,
- n'implémente aucune règle comptable,
- ne produit aucune écriture comptable.

Toute logique de rattachement aux comptes (ex. 52, 57) est **strictement hors périmètre**.

---

**Fin du document**
