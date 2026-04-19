# Module amortissement

## Statut

Socle fiable sur le noyau guardian et la lecture systeme.

## Ce qui est vrai aujourd'hui

- Le module dispose de tests guardian et systeme branches.
- Le noyau metier d'amortissement a deja servi a reveler puis corriger un vrai defaut fonctionnel.
- Le module expose un comportement de lecture exploitable sur les plans, echeanciers, historiques et valeurs nettes.

## Ce que le module ne pretend pas encore etre

- un domaine amortissement exhaustif sur tous les cas comptables
- une couverture complete de tous les traitements annexes
- un module produit finalise sur l'ensemble de son perimetre

## Scripts

- `npm test` : validation Jest du module.

## Prochaine etape utile

- etendre encore les cas limites metier d'amortissement
- documenter plus precisement les regles supportees
- clarifier les surfaces non encore exposees si le module doit grandir
