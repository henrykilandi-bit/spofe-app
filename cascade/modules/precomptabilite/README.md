# Module precomptabilite

## Statut

Socle fiable oriente guardian et lecture systeme.

## Ce qui est vrai aujourd'hui

- Le module compile et ses tests locaux sont branches.
- Il dispose d'un guardian et de scenarios systeme de lecture exploitables.
- Le module couvre deja un premier socle autour des documents et de l'exposition read-only.

## Ce que le module ne pretend pas encore etre

- une precomptabilite complete sur tous les circuits documentaires
- un perimetre finalise sur tous les cas de traitement et d'integration
- un module clos produit

## Scripts

- `npm run build` : verification TypeScript du module.
- `npm test` : validation Jest du module.

## Prochaine etape utile

- etendre les cas metier autour des documents et des statuts
- clarifier les interfaces publiques du module
- approfondir la couverture sur les cas limites de read-side
