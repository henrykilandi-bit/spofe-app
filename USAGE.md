# Usage

## Boucle quotidienne recommandee

Commande unique sante du depot :

```bash
npm run repo:health
```

Cette commande enchaine le socle stable (tests racine, e2e, systeme, modules).

Convention harmonisee (alias lisibles) :

```bash
npm run check:repo
npm run check:root
npm run check:e2e
npm run check:system
npm run check:modules
```

Validation racine rapide :

```bash
npm test -- --runInBand
npm run test:modules
```

Validation elargie :

```bash
npm run test:e2e -- --runInBand
npm run test:system
```

## Validation par module

Exemples :

```bash
npm run test:module:gestion-stocks
npm run test:module:comptabilite
npm run test:module:gestion-commandes
```

## Verification backend principal

```bash
npx tsx --eval "import('./src/api/http/server.ts').then(() => console.log('server-import-ok'))"
```

## Démarrage/arrêt backend (mode exploitation)

Verifier la configuration runtime minimale:

```bash
npm run server:env:check
```

Demarrage backend en arriere-plan:

```bash
npm run server:start
```

Smoke test /health:

```bash
npm run server:health
```

Arret backend:

```bash
npm run server:stop
```

Cycle complet de verification:

```bash
npm run server:smoke
```

## Operations base de donnees

Verification connectivite:

```bash
npm run db:ensure
npm run db:check
```

Application migrations SQL:

```bash
npm run db:migrate
```

Backup logique:

```bash
npm run db:backup
```

Test backup/restore non destructif:

```bash
npm run db:backup:smoke
```

## KPI exploitation (etape 5)

Generation du rapport KPI courant:

```bash
npm run kpi:exploitation
```

Sorties:

- rapport Markdown: `governance/KPI_EXPLOITATION_LATEST.md`
- detail JSON: `.spofe/kpi-exploitation-latest.json`

## Gouvernance changements sensibles (etape 6)

Validation Go/No-Go pour un changement `db`, `ci` ou `runtime`:

```bash
CHANGE_SCOPE=db CHANGE_SUMMARY="mise a jour migration" npm run change:governance:check
```

Sortie:

- gate technique (`release:gate`)
- controle docs operationnelles requises
- journal de decision: `governance/CHANGE_GOVERNANCE_LOG.md`

## Verrouillage final go-live (etape 8)

Commande unique de cloture readiness:

```bash
npm run go-live:readiness
```

Sorties:

- rapport Markdown: `governance/GO_LIVE_READINESS_LATEST.md`
- rapport JSON: `governance/GO_LIVE_READINESS_LATEST.json`

## GitHub Actions reel (ci-exploitation)

Preparer le run reel:

```bash
npm run ci:exploitation:precheck
```

Declencher le workflow:

```bash
npm run ci:exploitation:dispatch
```

## Contrats et outillage

```bash
npm run validate:contracts
npm run validate:dependencies
npm run build-proof
```

## A propos des scripts shell

Le dossier `scripts/` contient encore des scripts de bootstrap, build, validation, extension et deploiement. Ils peuvent servir de support operatoire ou de base d'evolution, mais ils ne doivent pas etre consideres comme la source unique de verite tant qu'ils n'ont pas ete completement revalidees contre l'etat actuel du depot.

Reference de statut:

- [scripts/README.md](C:/Users/henry/Desktop/SPOFE-APP%20VERS%201.0/scripts/README.md)

## Modules

Les statuts reels des modules les plus visibles sont documentes dans les `README.md` sous `cascade/modules/*`.
