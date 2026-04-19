# BUDGET — COMMANDS & EVENTS v1.0.0

## COMMANDS (WRITE)

| Command | Description |
| ------- | ----------- |
| CreateBudget | Création d'un budget (objectif ou trésorerie) |
| UpdateBudget | Mise à jour append-only |
| ValidateBudget | Validation d'un budget |
| CloseBudget | Clôture d'une période budgétaire |

## EVENTS (FACTS BUDGÉTAIRES)

| Event | Description |
| ----- | ----------- |
| BudgetCreated | Budget créé |
| BudgetUpdated | Budget révisé |
| BudgetValidated | Budget validé |
| BudgetClosed | Budget clôturé |
| BudgetVarianceComputed | Écart calculé |

## RÈGLES

- Événements budgétaires uniquement
- Aucun événement de coût
- Aucun événement comptable
- Aucun événement décisionnel
- Append-only strict
