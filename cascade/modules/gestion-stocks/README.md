# Module gestion-stocks

## Statut

Socle fiable avec scenarios systeme deja exploitables.

## Ce qui est vrai aujourd'hui

- Le module fait partie de la chaine de validation racine stable.
- Les tests systeme couvrent deja plusieurs flux concrets de stock.
- Le signal de test du module est utilisable pour detecter un vrai regressif metier sur son socle actuel.

## Ce que le module ne pretend pas encore etre

- un perimetre complet de gestion logistique
- une couverture exhaustive de tous les flux d'entree, sortie, transfert et ajustement
- un module clos produit

## Scripts

- `npm run build` : verification TypeScript du module.
- `npm test` : validation Jest du module.

## Prochaine etape utile

- completer les cas limites metier sur les flux de stock
- expliciter les contrats publics du module
- etendre la documentation fonctionnelle des scenarii deja supportes
