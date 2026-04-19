# Module objectif-indicateurs-evenements

## Statut

Module partiellement branche avec une base metier credible.

## Ce qui est vrai aujourd'hui

- Le module compile et ses tests locaux passent.
- Le Guardian couvre plusieurs invariants metier sur les objectifs, les indicateurs et les evenements.
- Les projections de read-models couvrent la creation et la mise a jour.
- Les exports publics principaux du module sont verifies.
- Le module reste encore centré sur son noyau de lecture, de validation et de projection.

## Ce que le module ne pretend pas encore etre

- un module fonctionnel complet de pilotage strategique
- une API metier totalement branchée de bout en bout
- un perimetre ferme sur tous les cas limites du domaine

## Scripts

- `npm run build` : verification TypeScript du module.
- `npm test` : validation Jest du guardian, des projections et des points d'entree couverts.

## Prochaine etape utile

- etendre la couverture aux repositories et aux facades de lecture
- clarifier le contrat public complet du module
- poursuivre les cas limites metier sur les mises a jour et les enchainements d'evenements
