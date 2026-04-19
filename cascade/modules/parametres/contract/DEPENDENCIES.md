# 📄 DEPENDENCIES.md

# Module Paramètres — Dépendances

Ce document formalise toutes les dépendances autorisées du module Paramètres.

## 🔗 Nature du module

- **Type** : Transverse
- **Sens des flux** : SORTANT uniquement
- **Rôle** : Fournisseur de cadres normatifs

## 📥 Modules consommés

👉 **AUCUN**

Le module Paramètres :

- ne consomme aucun autre module SPOFE
- est totalement autonome

## 📤 Modules consommateurs (READ-ONLY)

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
| objectif-indicateurs-evenements | Fréquences, sources |
| investisseurs | Cadres réglementaires |
| comptabilite | Socle intégral |
| amortissement | Méthodes et cadres |
| gestion-commandes | Devises et états |
| gestion-tiers | Cadres référentiels |
| tresorerie-banque | Devises et périodes |
| tresorerie-caisse | Devises et périodes |
| budgeting | Exercices et périodes |

## 🚫 Dépendances interdites

❌ Écriture depuis un autre module

❌ Dépendance inverse

❌ Orchestration inter-modules

❌ Logique conditionnelle

❌ Accès direct à des bases externes

## 🔒 Règle de gouvernance

Toute modification de dépendance :

- nécessite une nouvelle version du module
- implique un BUILD_PROOF
- est soumise au check DEPENDENCIES

📌 Statut : ✅ FINAL — AUDITABLE
