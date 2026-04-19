# GESTION-STOCKS — COMMANDS & EVENTS

## COMMANDS (WRITE)

| Command | Description |
|------|------------|
| RegisterStockEntry | Enregistrer une entrée en stock |
| RegisterStockExit | Enregistrer une sortie de stock |
| RegisterStockTransfer | Transférer entre dépôts |
| RegisterStockAdjustment | Ajustement documenté |

## EVENTS (FACTS UNIQUEMENT)

| Event | Description |
|----|------------|
| StockEntered | Entrée physique constatée |
| StockExited | Sortie physique constatée |
| StockTransferred | Transfert effectué |
| StockAdjusted | Ajustement appliqué |

## RÈGLES

- Un événement = un fait observé
- Aucun événement dérivé ou calculé
- Tous les événements sont immuables
- Les événements ne contiennent aucune logique financière
