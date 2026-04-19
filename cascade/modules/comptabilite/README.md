# Module comptabilite

## Statut

Socle fiable sur la chaine guardian -> projection -> repository -> API de lecture.

## Ce qui est vrai aujourd'hui

- Le module compile et ses tests locaux passent.
- Les invariants critiques du guardian sont testes sur plusieurs cas limites comptables.
- La chaine read-side est couverte jusqu'a l'API de lecture.
- Une cloture de periode opposable est executee via le use-case `CloseAccountingPeriod`.
- Une periode cloturee passe en `CLOSED`, interdit les nouvelles ecritures, et reste lisible cote read-model.
- Le module offre deja une base serieuse pour la comptabilite generale en lecture et en controle.

## Ce que le module ne pretend pas encore etre

- un moteur comptable complet couvrant tout le cycle d'exploitation
- une implementation finalisee de tous les ecritures, clotures et cas d'audit possibles
- un module declare "termine" ou "certifie" au sens produit

## Scripts

- `npm run build` : verification TypeScript du module.
- `npm test` : validation Jest du guardian, des projections, des repositories et des tests systeme branches.

## Prochaine etape utile

- etendre les scenarios metier sur les clotures et les cas d'erreur complexes
- augmenter la profondeur des tests de chaines applicatives
- clarifier les facades encore partielles si d'autres usages doivent etre exposes
