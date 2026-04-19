# GESTION-STOCKS — API READ ONLY

## PRINCIPES

- GET uniquement
- Aucun effet de bord
- Multi-tenant strict
- Aucun paramètre déclenchant une mutation

## ENDPOINTS

| Méthode | Endpoint | Description |
|------|---------|-------------|
| GET | /stocks/by-depot | Stock par dépôt |
| GET | /stocks/by-product | Stock par produit |
| GET | /stocks/by-category | Stock par catégorie |
| GET | /stocks/movements | Historique mouvements |

## HEADERS OBLIGATOIRES

| Header | Description |
|-----|------------|
| Authorization | Authentification |
| X-Tenant-Id | Isolation tenant |

## INTERDICTIONS

- POST / PUT / DELETE interdits
- Aucun calcul serveur
- Aucun paramètre métier implicite
