# COST-STRUCTURE — API READ ONLY

## PRINCIPES

- GET uniquement
- Read-only strict
- Aucun effet de bord
- Multi-tenant

## ENDPOINTS

| Méthode | Endpoint | Description |
| ------- | -------- | ------------- |
| GET | /costs/by-product | Coûts par produit |
| GET | /costs/by-activity | Coûts par activité |
| GET | /costs/by-period | Coûts par période |
| GET | /costs/breakdown | Décomposition des coûts |
| GET | /costs/scenarios | Scénarios analytiques |

## HEADERS OBLIGATOIRES

| Header | Description |
| ------ | ----------- |
| Authorization | Authentification |
| X-Tenant-Id | Isolation tenant |

## INTERDICTIONS

- POST / PUT / DELETE interdits
- Aucune décision
- Aucune simulation exécutive
