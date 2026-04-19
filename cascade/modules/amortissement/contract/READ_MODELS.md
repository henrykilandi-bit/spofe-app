# AMORTISSEMENT — READ MODELS

## OBJECTIF

Exposer des vues descriptives et analytiques
issues exclusivement des événements.

## READ MODELS

| Read Model | Description |
|---------|-------------|
| AmortizationPlanRM | Plan d’amortissement détaillé |
| AmortizationScheduleRM | Échéancier par période |
| AmortizationAccumulatedRM | Amortissements cumulés |
| AssetNetValueRM | Valeur nette comptable |
| AmortizationHistoryRM | Historique des dotations |

## RÈGLES

- Read-only strict
- Multi-tenant
- Aucune logique décisionnelle
- Aucun calcul fiscal ou comptable
