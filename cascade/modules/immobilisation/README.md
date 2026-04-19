# Module immobilisation

## Statut

Socle fiable oriente lecture systeme.

## Ce qui est vrai aujourd'hui

- Le module participe a la chaine de validation stable du depot.
- Les scenarios systeme de lecture sont branches et passent.
- Le module expose deja un comportement lisible sur la consultation des immobilisations et de certains filtres.

## Ce que le module ne pretend pas encore etre

- un domaine immobilisation complet sur tout le cycle de vie
- un module declare finalise sur tous les cas metier et toutes les operations d'ecriture
- une surface fonctionnelle exhaustive

## Scripts

- `npm run build` : verification TypeScript du module.
- `npm test` : validation Jest du module.

## Prochaine etape utile

- documenter plus finement les cas couverts en lecture
- clarifier les limites du write-side si celui-ci doit etre active plus tard
- etendre les cas metier au-dela du read-side deja fiabilise
