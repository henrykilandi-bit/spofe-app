# MODULE BUDGET — SCOPE v1.0.0

## 1. RÔLE DU MODULE

Le module Budget est le module de pilotage et de projection financière.
Il permet de planifier, suivre et analyser des budgets (objectifs et trésorerie)
à partir de données certifiées fournies par les autres modules SPOFE.

Le module Budget agrège, projette et compare.
Il ne produit aucune vérité métier primaire.

## 2. TYPES DE BUDGETS (v1.0.0)

### A. Budget Objectif

- Budget par produit / activité
- Basé sur :
  - volumes prévisionnels
  - coûts unitaires (via Cost-Structure / COUTFLEX)
- Finalités :
  - fixation d'objectifs
  - mesure de la performance
  - analyse des écarts

### B. Budget de Trésorerie
- Prévision des encaissements / décaissements
- Basé sur :
  - ventes prévues
  - charges prévues
- Finalités :
  - anticipation des besoins de liquidité
  - prévention des ruptures de trésorerie

## IN SCOPE

- Création et mise à jour de budgets
- Validation des hypothèses budgétaires
- Projections temporelles
- Calcul des écarts (prévisionnel vs réel)
- Exposition des indicateurs budgétaires
- Alertes budgétaires (seuils, dérives)
- Read-models budgétaires
- API GET uniquement
- Guardian central
- Append-only
- Multi-tenant strict

## OUT OF SCOPE

- Création de nouvelles vérités métier
- Modifications des données sources
- Intégrations externes directes
- Logiques comptables ou financières

## 4. SOURCES CONSOMMÉES (READ-ONLY)

- Cost-Structure (COUTFLEX)
  - coûts unitaires
  - hypothèses de coûts
- Amortissement
  - dotations
  - renouvellements prévus
- Stock
  - niveaux de stock
  - alertes de seuil
- (Plus tard) Ventes
  - chiffres réels

## 5. OUT OF SCOPE (VOLONTAIRE)

- Calcul des coûts de revient
- Gestion des quantités physiques
- Calcul des amortissements
- Génération d'écritures comptables
- Fixation automatique des prix
- Décisions GO / STOP
- Arbitrages exécutifs automatiques

## 6. GOUVERNANCE

- Version : v1.0.0
- Niveau : SPOFE P0
- Mutable : NON
- Statut : CONTRACTUEL — GELÉ
