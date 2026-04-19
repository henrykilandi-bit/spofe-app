# BUDGET — READ MODELS v1.0.0

## OBJECTIF

Exposer des vues budgétaires lisibles et comparables,
issues exclusivement d'événements certifiés.

## READ MODELS

| Read Model | Description |
| ---------- | ------------- |
| BudgetObjectiveRM | Budget objectif par produit / activité |
| BudgetCashflowRM | Budget de trésorerie |
| BudgetVarianceRM | Écarts prévisionnel / réel |
| BudgetTimelineRM | Projection temporelle |
| BudgetAlertRM | Alertes budgétaires |

## RÈGLES

- Read-only strict
- Multi-tenant
- Aucun calcul de coût
- Aucun calcul de quantité
- Aucun arbitrage
