# Guardian — gestion-commandes

## Règle fondamentale
Aucune logique métier hors Guardian.

## INVARIANTS

- GC01 : Isolation stricte par tenant
- GC02 : Référence tiers obligatoire
- GC03 : Référence stock obligatoire
- GC04 : Documents validés uniquement
- GC05 : Append-only strict
- GC06 : Quantités positives
- GC07 : Immutabilité post-validation
- GC08 : Acteur SPOFE requis
