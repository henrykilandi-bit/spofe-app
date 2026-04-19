# 📊 READ MODELS — MODULE GESTION DES TIERS

**Version :** v1.0.0  
**Framework :** SPOFE v2.1.0

## 🎯 Objectif du document

Ce document définit les projections de lecture (read-models) exposées par le module Gestion des Tiers.

👉 Les read-models sont :
- dérivés exclusivement des événements
- en lecture seule
- optimisés pour la consultation
- sans logique métier ni calcul

## 🧠 Principe SPOFE fondamental

Les read-models :
- ne déclenchent jamais de commandes
- ne contiennent aucune règle Guardian
- ne modifient aucun état
- ne remplacent jamais les événements

**Ils sont reconstruisibles à 100 % depuis l'event store.**

## 🧱 Read-models exposés — v1.0.0

### 🟢 RM-01 — TierSummaryView

**Vue synthétique d'un tiers.**

**Clé primaire :**
- `tenantId`
- `tierId`

**Champs exposés :**
- `tierId`
- `tenantId`
- statut (ACTIVE / SUSPENDED / ARCHIVED)
- rôles
- nom / raison sociale
- identifiants légaux (masqués si nécessaire)
- date de création
- date de dernière mise à jour

**Source événements :**
- `TierCreated`
- `TierUpdated`
- `TierSuspended`
- `TierArchived`

### 🟢 RM-02 — TierByRoleView

**Liste des tiers par rôle.**

**Clé primaire :**
- `tenantId`
- `role`
- `tierId`

**Champs exposés :**
- `tierId`
- `rôle`
- `statut`
- `nom / raison sociale`

**Usage principal :**
- filtres UI
- sélection de tiers par rôle

### 🟢 RM-03 — TierByStatusView

**Liste des tiers par statut.**

**Clé primaire :**
- `tenantId`
- `status`
- `tierId`

**Champs exposés :**
- `tierId`
- `statut`
- `rôles`
- `nom / raison sociale`

### 🟢 RM-04 — TierContactView

**Vue des coordonnées d'un tiers.**

**Clé primaire :**
- `tenantId`
- `tierId`

**Champs exposés :**
- adresses (par type)
- contacts
- personnes référentes

**Remarque :**
- aucune validation métier ici
- données déjà validées côté commandes

### 🟢 RM-05 — TierAuditView

**Vue d'audit et d'historique.**

**Clé primaire :**
- `tenantId`
- `tierId`
- `eventTimestamp`

**Champs exposés :**
- type d'événement
- acteur
- horodatage
- résumé du changement

**Usage :**
- traçabilité
- audit interne
- conformité

## 🚫 Données explicitement exclues des read-models

Les read-models ne doivent **jamais** contenir :

❌ montants  
❌ soldes  
❌ échéances  
❌ indicateurs financiers  
❌ statuts comptables  
❌ données calculées (DSO, encours, etc.)

👉 **Toute tentative est une violation SPOFE P0.**

## 🔄 Mise à jour des read-models

Les read-models sont mis à jour :
- de manière asynchrone
- en réaction aux événements

**Aucun read-model :**
- n'émet d'événement
- n'écrit dans le domaine

## 🔐 Sécurité & isolation

Tous les read-models sont :
- strictement scopés par tenant
- filtrés côté infrastructure

**Aucune lecture cross-tenant autorisée**

## 🧪 Impacts sur les tests

Chaque read-model :
- doit avoir au minimum :
  - un test de projection nominal
  - un test de cohérence après reconstruction
- ne doit pas être testé pour de la logique métier

## 📦 Évolutivité

De nouveaux read-models peuvent être ajoutés :
- sans casser le contrat v1
- sans modifier les événements existants

**Toute exposition financière nécessite :**
- un nouveau module
- ou une version majeure v2+

## 🟢 Statut du document

```
READ_MODELS STATUS
────────────────────────────────────
Module        : gestion-tiers
Version       : v1.0.0
State         : APPROVED
Governance    : SPOFE P0
Mutable       : NO
────────────────────────────────────
```

---

**✔️ FIN DU DOCUMENT READ_MODELS.md**
