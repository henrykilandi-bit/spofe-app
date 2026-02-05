# DEPENDENCIES.md
Module Paramètres — Dépendances

Ce document formalise toutes les dépendances autorisées du module Paramètres.

---

## 🔗 Nature du module

- **Type** : Transverse
- **Sens des flux** : SORTANT uniquement
- **Rôle** : Fournisseur de cadres normatifs

---

## CONSUMED DEPENDENCIES

Ce module consomme les données des modules suivants :

<!-- DEPENDENCIES_CONSUMED_START -->
Aucune. Le module Paramètres est complètement autonome.
<!-- AUCUN -->
<!-- Le module Paramètres ne consomme aucun autre module SPOFE et est totalement autonome -->
<!-- DEPENDENCIES_CONSUMED_END -->

---

## CONSUMER DEPENDENCIES

Ce module expose ses données aux modules suivants :

<!-- DEPENDENCIES_CONSUMER_START -->
- amortissement
- budget
- budgeting
- coaching
- cost-structure
- gestion-commandes
- gestion-stocks
- gestion-tiers
- immobilisation
- investisseurs
- objectif-indicateur-evenement
- oie
- precomptabilite
- tresoconsolidation
- tresorerie-banque
- tresorerie-caisse
- vente
<!-- DEPENDENCIES_CONSUMER_END -->

---

## 📋 Modules consommateurs (READ-only)

Tous les modules métiers SPOFE peuvent consommer Paramètres en lecture seule :

| Module | Finalité |
|--------|----------|
| gestion-stocks | Devises, périodes, états |
| cost-structure | Typologies, cadres |
| immobilisation | Méthodes autorisées |
| budget | Exercices, périodicités |
| precomptabilite | Types de documents |
| vente | Devises, taxes |
| coaching | Cadres normatifs |
| oie | Fréquences, sources |
| investisseurs | Cadres réglementaires |
| tresorerie-* | Socle intégral |

---

## 🚫 Dépendances interdites

❌ Écriture depuis un autre module  
❌ Dépendance inverse  
❌ Orchestration inter-modules  
❌ Logique conditionnelle  
❌ Accès direct à des bases externes  

---

## 🔒 Règle de gouvernance

Toute modification de dépendance :
- nécessite une nouvelle version du module
- implique un BUILD_PROOF
- est soumise au check DEPENDENCIES

---

## VALIDATION

Cette déclaration est automatiquement vérifiée par :
- Le système de validation des dépendances SPOFE
- Les tests d'intégration inter-modules
- La vérification de cohérence contractuelle

📌 Statut : ✅ FINAL — AUDITABLE