# Module tresorerie-banque

## Statut

Socle fiable avec validation outillage et scenarios metier de base.

## Ce qui est vrai aujourd'hui

- Le module compile et ses tests locaux passent.
- Les epreuves de validation ne sont plus parasitees par le seuil de couverture ou une configuration Jest obsolete.
- Le module dispose de scenarios systeme minimaux exploitables sur les operations bancaires principales.
- Les imports de mouvements bancaires sont deduplicables par `externalReference` et `bankAccountId`.
- Le signal de test du module est maintenant interpretable comme un vrai signal fonctionnel.

## Ce que le module ne pretend pas encore etre

- un perimetre complet de tresorerie bancaire
- une implementation exhaustive de tous les flux, rapprochements et cas d'erreur
- un module totalement finalise produit

## Scripts

- `npm run build` : verification TypeScript du module.
- `npm test` : validation Jest du module.

## Prochaine etape utile

- etendre les cas metier au-dela du cycle bancaire minimal
- renforcer les cas limites sur les erreurs fonctionnelles
- expliciter les contrats publics si le module doit etre davantage consomme par d'autres briques
