# AMORTISSEMENT — API READ ONLY

## PRINCIPES

- GET uniquement
- Aucun effet de bord
- Multi-tenant strict
- Read-only

## ENDPOINTS

| Méthode | Endpoint | Description |
|------|---------|-------------|
| GET | /amortization/plans | Plans d’amortissement |
| GET | /amortization/schedule | Échéanciers |
| GET | /amortization/accumulated | Amortissements cumulés |
| GET | /amortization/net-value | Valeurs nettes |
| GET | /amortization/history | Historique |

## HEADERS OBLIGATOIRES

| Header | Description |
|-----|------------|
| Authorization | Authentification |
| X-Tenant-Id | Isolation tenant |

## INTERDICTIONS

- POST / PUT / DELETE interdits
- Aucune simulation
- Aucune décision
