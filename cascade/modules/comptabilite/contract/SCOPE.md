# 📄 SCOPE.md

# Module Comptabilité Générale — v1.0.0

## 🎯 Mission Constitutionnelle

La Comptabilité Générale est le registre légal et immuable des écritures comptables SPOFE. Elle constitue la source unique de vérité financière de l'organisation, en conformité avec les normes comptables applicables (OHADA, IFRS, PCG).

Elle ne calcule rien, ne décide rien, n'optimise rien. Elle enregistre ce que les autres modules produisent, en garantissant la conformité, la traçabilité et l'immutabilité.

## IN SCOPE

### 1️⃣ Registre des Écritures Comptables

- **Journal Général** : Toutes les écritures en partie double
- **Référenciation obligatoire** : Pièces, tiers, périodes, journaux
- **Immutabilité** : Aucune modification après validation
- **Traçabilité** : Historique complet des validations

### 2️⃣ Conformité Normative

- **Plan Comptable** : Respect du plan référencé dans Paramètres
- **États Comptables** : Production des états légaux (Bilan, Compte de Résultat, Tableau de Flux)
- **Périodes Fiscales** : Respect des périodes déclarées dans Paramètres
- **Devoir Légal** : Archivage et conservation des documents

### 3️⃣ Validation et Contrôle

- **Partie Double** : Équilibre Débit = Crédit systématique
- **Périodes Ouvertes** : Interdiction d'écrire sur périodes clôturées
- **Références Externes** : Liaison obligatoire avec tiers, pièces, modules sources
- **Pré-comptabilité** : Qualification des pièces justificatives

### 4️⃣ États Financiers

- **Bilan** : Situation patrimoniale à une date donnée
- **Compte de Résultat** : Performance sur une période
- **Tableau de Flux de Trésorerie** : Mouvements de trésorerie
- **Annexes** : Informations complémentaires obligatoires

### 5️⃣ Reporting Légal

- **Déclarations Fiscales** : Liens avec les obligations fiscales
- **États Regroupés** : Consolidations inter-périodes
- **Audits** : Préparation et support d'audit
- **Export Normé** : Formats standards (PDF, Excel, XML)

### 6️⃣ Archivage et Conservation

- **Conservation Légale** : Durées de rétention conformes
- **Intégrité** : Garantie d'altération zéro
- **Restauration** : Capacité de restitution historique
- **Preuve Numérique** : Signature et horodatage

## OUT OF SCOPE

La Comptabilité Générale ne fait pas et ne fera pas :

- **Calculs Métier** : Amortissements, provisions, valorisations
- **Intelligence Artificielle** : Suggestions, prédictions, optimisations
- **Workflow Organisationnel** : Circuits de validation, approbations hiérarchiques
- **Pilotage Stratégique** : Tableaux de bord de gestion, KPIs décisionnels
- **Opérations Bancaires** : Rapprochements automatiques, trésorerie prévisionnelle
- **Gestion Commerciale** : Facturation, relances, encaissements
- **Analyse Financière** : Ratios, diagnostics, recommandations
- **Planification Budgétaire** : Prévisions, simulations, analyses d'écarts

## 🔗 Positionnement Terminal

La Comptabilité Générale est le **terminal d'agrégation** de SPOFE :

- **Elle consomme** : Informations de tous les modules métiers
- **Elle ne produit jamais** : Données pour d'autres modules
- **Elle est read-only** : Pour tous les autres modules
- **Elle est write-only** : Via son Guardian unique

## 📦 Dépendances Entrantes (READ-ONLY)

- **Paramètres** : Plans comptables, cadres normatifs, états, périodes
- **Gestion des Tiers** : Référentiel clients, fournisseurs, autres tiers (classe 4)
- **Précomptabilité** : Pièces justificatives qualifiées
- **Vente** : Faits commerciaux (produits, chiffre d'affaires)
- **Banque** : Flux bancaires et relevés
- **Caisse** : Mouvements de trésorerie espèces
- **Immobilisation** : Amortissements calculés
- **Stock** : Valorisation des stocks et variations
- **COUTFLEX** : Coûts et charges
- **Budget** : Références prévisionnelles

## 🛡️ Garanties Constitutionnelles

### Passivité Absolue
- Aucune écriture générée spontanément
- Aucun calcul métier effectué
- Aucune décision automatique prise

### Immutabilité Légale
- Écritures non modifiables après validation
- Historique conservé intégralement
- Altération impossible

### Traçabilité Complète
- Chaque écriture référencée à sa source
- Historique des validations conservé
- Preuve numérique disponible

### Conformité Normative
- Respect strict des plans comptables
- Conformité aux normes applicables
- États légaux produits conformément

## 🔒 Règle de Gouvernance

Le module Comptabilité Générale est :

- **Passif** : Il enregistre, il ne produit pas
- **Déclaratif** : Il formalise, il ne calcule pas
- **Terminal** : Il consomme, il ne partage pas
- **Légal** : Il se conforme, il n'innove pas

Toute extension du périmètre nécessite :
- Une nouvelle version majeure
- Validation constitutionnelle complète
- BUILD_PROOF systématique

## 🧠 Synthèse Finale

La Comptabilité Générale v1.0.0 est le **registre légal immuable** de SPOFE.

Elle ne décide pas, ne calcule pas, n'optimise pas.
Elle enregistre, conserve, et prouve.

👉 **Elle est la Constitution financière de l'organisation.**
