# MODULE COST-STRUCTURE (COUTFLEX) — SCOPE v1.0.0

## 1. RÔLE DU MODULE

Le module Cost-Structure (COUTFLEX) est responsable du calcul,
de la structuration et de l'exposition des coûts analytiques
à partir de faits certifiés émis par d'autres modules SPOFE.

Il constitue la source de vérité des coûts analytiques,
sans jamais prendre de décision métier ni dépendre des prix.

## 2. IN SCOPE

- Construction des coûts analytiques :
  - coûts directs
  - coûts indirects
  - amortissements (consommés depuis le module Amortissement)
- Calculs analytiques :
  - coût unitaire par produit / service
  - coût par période
  - coût par activité / centre
- Ventilation des coûts par composant
- Modèle COUTFLEX :
  - niveaux de coûts (N1 / N2 / N3)
  - capacités
  - paliers
- Scénarios analytiques (exposition uniquement) :
  - 70 %
  - 100 %
  - 130 %
- Read-models analytiques
- API GET uniquement
- Guardian central
- Append-only
- Multi-tenant strict

## 3. SOURCES AUTORISÉES

- Module Gestion-Stocks (read-only)
  - quantités consommées
  - sorties par produit
- Module Amortissement (read-only)
  - dotations par période
  - amortissements cumulés

## 4. CONSOMMATEURS

- Module Budget (read-only)
- Reporting / Pilotage
- Coaching (consommation analytique uniquement)

## 5. OUT OF SCOPE (VOLONTAIRE)

- Gestion des stocks
- Gestion des immobilisations
- Calcul de prix de vente
- Calcul de marge commerciale finale
- Budgets et arbitrages
- Décisions GO / STOP
- Comptabilisation
- Fiscalité
- Simulation stratégique exécutive

## 6. GOUVERNANCE

- Version : v1.0.0
- Niveau : SPOFE P0
- Mutable : NON
- Statut : CONTRACTUEL — GELÉ
