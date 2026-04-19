# Contract Debt Acceptance — 2026-04-19

## Decision

L'équipe SPOFE accepte explicitement la dette de contrats actuelle sur `SCOPE.md` et `GUARDIAN.md` afin de continuer l'exploitation sans masquer le risque.

Cette acceptation est conditionnelle:

- Aucun nouveau warning SCOPE/GUARDIAN n'est autorisé.
- Toute dérive (même total inchangé mais contenu différent) exige une ré-acceptation explicite.
- Toute baisse de dette est autorisée et attendue.

## Baseline accepté

Fichier de référence: `governance/contract-debt-baseline.json`

- Dependencies: `0`
- Scope: `61` (`SCOPE_OVERLAP=61`)
- Guardian: `18` (`EMPTY_INVARIANTS=17`, `MISSING_INVARIANTS=1`)
- Total: `79`

## Contrôle en chaîne

Le contrôle anti-régression est implémenté via:

- `npm run contracts:debt:check`
- Intégration dans `npm run release:gate`

Le rapport courant est produit dans:

- `governance/CONTRACT_DEBT_STATUS_LATEST.json`

## Plan de sortie de dette

- Sprint A: réduire `MISSING_INVARIANTS` à `0`
- Sprint B: réduire `EMPTY_INVARIANTS` module par module
- Sprint C: réduire les `SCOPE_OVERLAP` les plus critiques inter-modules
- À chaque palier: mise à jour volontaire du baseline après revue

## Cloture et revue (Etape 3)

- Statut de verification: `PASSED` (anti-regression valide).
- Reference statut courant: `governance/CONTRACT_DEBT_STATUS_LATEST.json`.
- Date de cloture etape 3: `2026-04-19`.
- Prochaine revue planifiee: `2026-05-03`.
- Regle de maintien: toute modification de fingerprint SCOPE/GUARDIAN requiert revue explicite avant release.
