# PRÉCOMPTABILITÉ — API READ ONLY v1.0.0

## PRINCIPES

- GET uniquement
- Read-only strict
- Aucun effet de bord
- Multi-tenant

## ENDPOINTS

| Méthode | Endpoint | Description |
| ------- | -------- | ------------- |
| GET | /precomptabilite/documents | Documents |
| GET | /precomptabilite/status | Statuts |
| GET | /precomptabilite/analytics | Affectations |
| GET | /precomptabilite/exposure | Données exposables |

## HEADERS OBLIGATOIRES

| Header | Description |
| ------ | ----------- |
| Authorization | Authentification |
| X-Tenant-Id | Isolation tenant |

## INTERDICTIONS

- POST / PUT / DELETE interdits
- Aucune décision automatique
- Aucune écriture comptable
