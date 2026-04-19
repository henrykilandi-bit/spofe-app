# Module gestion-tiers

## Statut

Base guardian solide avec perimetre systeme encore a clarifier.

## Ce qui est vrai aujourd'hui

- Le module dispose d'un corpus important de tests guardian.
- Plusieurs invariants metier sur les tiers, les documents, les roles et l'isolation tenant sont deja explicitement testes.
- Le module compile et possede une base de validation plus riche que ne le laissait penser son ancien README.

## Ce que le module ne pretend pas encore etre

- un module tiers totalement eprouve de bout en bout
- une chaine systeme stable et pleinement integree dans la validation racine
- un perimetre produit ferme

## Scripts

- `npm run build` : verification TypeScript du module.
- `npm test` : validation Jest du module.
- `npm run test:integration` : validation complementaire du module selon sa configuration locale.

## Prochaine etape utile

- clarifier la place des tests systeme dans la chaine racine
- documenter les facades publiques et les usages reels
- poursuivre l'extension des scenarios bout en bout sur les cas metier tiers
