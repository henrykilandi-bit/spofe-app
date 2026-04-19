# Module tresorerie-caisse

## Statut

Socle fiable avec particularite d'outillage Vitest.

## Ce qui est vrai aujourd'hui

- Les tests Guardian et systeme du module sont presents et passent dans un environnement Vitest normal.
- Les scripts du module sont alignes sur Vitest, ce qui correspond bien au contenu reel des suites.
- Le build TypeScript ne simule plus un succes fictif.
- Le module emet maintenant un signal de validation fonctionnel interpretable.

## Ce que le module ne pretend pas encore etre

- un perimetre complet de tresorerie caisse
- un module sans dette d'environnement ou de confort d'execution
- une implementation exhaustive de tous les flux de caisse

## Scripts

- `npm test` : execute les suites Vitest du module.
- `npm run guardian` : execute uniquement les tests Guardian.
- `npm run test:integration` : execute les suites systeme actuellement branchees.
- `npm run build` : verification TypeScript du module.

## Note d'execution

Dans cette session Codex, l'execution Vitest peut etre sensible au sandbox local avec une erreur `spawn EPERM`. Cette contrainte vient de l'environnement d'execution, pas d'un faux script du module.

## Prochaine etape utile

- poursuivre l'extension des cas metier de caisse
- reduire encore le bruit d'outillage selon l'environnement local
- clarifier les contrats publics si le module doit etre consomme au-dela de ses tests actuels
