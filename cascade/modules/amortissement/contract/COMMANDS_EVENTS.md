# AMORTISSEMENT — COMMANDS & EVENTS

## COMMANDS (WRITE)

| Command | Description |
|------|------------|
| CreateAmortizationPlan | Création d’un plan d’amortissement |
| ReviseAmortizationPlan | Révision durée / valeur résiduelle |
| StopAmortization | Arrêt du plan (sortie d’actif) |

## EVENTS (FACTS UNIQUEMENT)

| Event | Description |
|----|------------|
| AmortizationPlanCreated | Plan initial créé |
| AmortizationPlanRevised | Révision appliquée |
| AmortizationStopped | Plan arrêté |
| AmortizationAccrued | Dotation constatée |

## RÈGLES

- Les événements sont factuels
- Aucun événement fiscal
- Aucun événement comptable
- Append-only strict
