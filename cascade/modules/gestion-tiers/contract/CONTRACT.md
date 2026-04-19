# 📜 CONTRACT — MODULE GESTION DES TIERS

**Version :** v1.0.0  
**Framework :** SPOFE v2.1.0

## 🎯 Responsabilité du module

Le module Gestion des Tiers est responsable de la gestion du référentiel unique des tiers d'une entreprise (tenant), incluant leur identité, leurs rôles, leur statut et leur traçabilité, sur la base de documents validés.

👉 Le module est une source de vérité administrative.  
👉 Il ne porte aucune logique financière ou comptable.

## 🧱 Ce que le module GÈRE (IN SCOPE)

### 🧑‍🤝‍🧑 1. Les Tiers

- Création et identification unique des tiers (`tierId`)
- Appartenance à un seul tenant
- Support multi-rôles :
  - Client
  - Fournisseur  
  - Salarié
  - Organisme social
  - Autre (extensible)

### 🧾 2. Les données administratives et légales

- Identité (raison sociale / nom)
- Forme juridique
- Identifiants légaux (ICE, SIRET, etc.)
- Pays / juridiction
- Coordonnées (adresses, contacts)

### 📄 3. Les documents Tiers (document-driven)

Les documents suivants existent obligatoirement :
- Fiche Tiers (création)
- Mise à jour Tiers
- Suspension Tiers
- Archivage Tiers

Chaque document :
- possède un état (`draft`, `validated`, `cancelled`)
- est validé par un `actor` SPOFE
- génère des events immuables
- respecte une séquentialité stricte

👉 **Aucune mutation n'existe sans document validé.**

### ⚖️ 4. Le statut des tiers

- **Actif :** utilisable dans les flux
- **Suspendu :** non utilisable dans de nouveaux flux
- **Archivé :** lecture seule, historique conservé

### 🔍 5. Traçabilité complète

- Historique append-only
- Qui a fait quoi, quand
- Aucun effacement ou écrasement de l'historique

### 📊 6. Exposition (read-only)

Le module expose :
- Tiers par identifiant
- Tiers par rôle
- Tiers par statut
- Listes filtrées (actifs / suspendus)

👉 **API GET uniquement en v1.0.0**

## 🚫 Ce que le module NE FAIT PAS (OUT OF SCOPE v1)

❌ Suivi des créances  
❌ Créances douteuses  
❌ Lettrage / réconciliation  
❌ Calcul de soldes ou d'échéances  
❌ Indicateurs financiers (DSO, encours, etc.)  
❌ TVA, fiscalité, obligations comptables  
❌ Provisionnement  
❌ Clôture comptable de comptes tiers  

👉 Ces responsabilités relèvent de modules distincts :
- Suivi de créances
- Credit Risk  
- Comptabilité / Trésorerie

## 🔐 Invariants Guardian (P0 — non négociables)

Le module doit rejeter toute opération violant l'un des invariants suivants :

1. Un tiers appartient à un seul tenant
2. Aucun doublon légal actif (identifiant fiscal unique par tenant)
3. Un tiers archivé est immutable
4. Un tiers suspendu :
   - ❌ ne peut pas être utilisé dans un nouveau flux
   - ✅ reste consultable
5. Aucune mutation sans document validé
6. Historique strictement append-only

## 🔗 Interfaces inter-modules (lecture seule)

**Les autres modules peuvent :**
- référencer un `tierId`
- consulter le statut d'un tiers
- vérifier l'existence d'un tiers

**Ils ne peuvent jamais :**
- modifier un tiers
- changer son statut
- créer ou valider un document tiers

## 🧩 Architecture SPOFE imposée

- CQRS strict
- Guardian central
- Events immuables
- Read models séparés
- API GET only (v1)
- BUILD_PROOF isolé

👉 **Toute implémentation non conforme invalide le BUILD_PROOF.**

## 📦 Versioning & évolution

- Ce contrat définit v1.0.0
- Toute extension fonctionnelle (finance, scoring, crédit, etc.) :
  - se fait via nouveau module
  - ou version majeure v2+
- **Aucune évolution ne doit casser ce contrat**

## 🟢 Statut du contrat

```
CONTRACT STATUS
────────────────────────────────────
Module        : gestion-tiers
Version       : v1.0.0
State         : APPROVED
Governance    : SPOFE P0
Mutable       : NO
────────────────────────────────────
```

---

**✔️ FIN DU CONTRAT CONTRACT.md**
