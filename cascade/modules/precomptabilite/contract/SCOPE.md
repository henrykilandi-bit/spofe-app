# MODULE PRÉCOMPTABILITÉ — SCOPE v1.0.0

## 1. RÔLE DU MODULE

Le module Précomptabilité est le module de vérité documentaire financière.
Il capte, qualifie, valide et expose des documents financiers
avant leur consommation par les autres modules SPOFE.

Il agit comme un filtre de confiance en amont de la comptabilité.

## 2. RESPONSABILITÉ PRINCIPALE

Garantir que toute donnée financière consommée par :

- Budget
- Cost-Structure
- Banque
- Comptabilité

provient d'un document :
- identifié
- validé
- traçable
- non modifiable (append-only)

## IN SCOPE

### Documents gérés

- Factures fournisseurs
- Tickets / reçus
- Notes de frais
- Justificatifs financiers

### Fonctions principales
- Capture des documents (upload, scan)
- Extraction factuelle des champs (date, montant, fournisseur, référence)
- Qualification métier (charge, immobilisation détectée)
- Affectation analytique (projet, centre)
- Workflow de validation
- Statuts documentaires
- Archivage et traçabilité
- Exposition inter-modules en lecture seule

## 4. MODULES CONSOMMATEURS

- Budget (consommation budgétaire)
- Cost-Structure (charges qualifiées)
- Banque (factures validées à payer)
- Comptabilité (documents propres et pré-codés)

## OUT OF SCOPE

- Calcul de TVA
- Écritures comptables définitives
- Fiscalité
- Décisions automatiques
- Paiement bancaire
- Rapprochement bancaire automatique
- IA auto-apprenante avancée

## 6. GOUVERNANCE

- Version : v1.0.0
- Niveau : SPOFE P0
- Mutable : NON
- Statut : CONTRACTUEL — GELÉ
