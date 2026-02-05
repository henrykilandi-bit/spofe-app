# COST-STRUCTURE — COMMANDS & EVENTS

## COMMANDS (WRITE)

| Command | Description |
| ------- | ----------- |
| BuildCostStructure | Construction d'une structure de coûts |
| ReviseCostStructure | Révision d'une structure (append-only) |

## EVENTS (FACTS ANALYTIQUES)

| Event | Description |
| ----- | ----------- |
| CostStructureBuilt | Structure de coûts construite |
| CostStructureRevised | Révision historisée |
| CostComputed | Coût analytique calculé |

## RÈGLES

- Les événements sont analytiques
- Aucun événement financier
- Aucun événement comptable
- Aucun événement décisionnel
- Append-only strict
