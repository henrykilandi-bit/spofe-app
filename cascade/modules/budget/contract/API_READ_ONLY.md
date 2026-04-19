# BUDGET — API READ ONLY v1.0.0

## PRINCIPES

- GET uniquement
- Read-only strict
- Aucun effet de bord
- Multi-tenant

## ENDPOINTS

| Méthode | Endpoint | Description |
| ------- | -------- | ------------- |
| GET | /budget/objectives | Budgets objectifs |
| GET | /budget/cashflow | Budgets de trésorerie |
| GET | /budget/variance | Écarts budgétaires |
| GET | /budget/timeline | Projections temporelles |
| GET | /budget/alerts | Alertes budgétaires |

## HEADERS OBLIGATOIRES

| Header | Description |
| ------ | ----------- |
| Authorization | Authentification |
| X-Tenant-Id | Isolation tenant |

## INTERDICTIONS

- POST / PUT / DELETE interdits
- Aucune décision automatique
- Aucune écriture comptable
