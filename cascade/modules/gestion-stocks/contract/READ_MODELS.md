# GESTION-STOCKS — READ MODELS

## OBJECTIF

Fournir des vues de consultation strictement factuelles,
sans calcul métier ni interprétation.

## READ MODELS

| Read Model | Description |
|---------|-------------|
| StockByDepotRM | Quantités par dépôt |
| StockByProductRM | Quantités par produit |
| StockByCategoryRM | Quantités par catégorie |
| StockMovementsRM | Historique chronologique |

## RÈGLES

- Read-only strict
- Données issues exclusivement des événements
- Multi-tenant obligatoire
- Aucun calcul financier
- Agrégations mécaniques uniquement
