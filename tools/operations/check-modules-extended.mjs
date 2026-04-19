import { existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import path from 'node:path';

const MODULES = [
  {
    name: 'gestion-stocks',
    sentinel: 'cascade/modules/gestion-stocks/tests/system/gestion-stocks.e2e.spec.ts',
  },
  {
    name: 'tresorerie-banque',
    sentinel: 'cascade/modules/tresorerie-banque/tests/system/tresorerie-banque.e2e.spec.ts',
  },
  {
    name: 'cost-structure',
    sentinel: 'cascade/modules/cost-structure/tests/system/cost-structure.e2e.spec.ts',
  },
  {
    name: 'objectif-indicateurs-evenements',
    sentinel:
      'cascade/modules/objectif-indicateurs-evenements/tests/system/oie-read-models.spec.ts',
  },
  {
    name: 'budget',
    sentinel: 'cascade/modules/budget/tests/system/budget.e2e.spec.ts',
  },
  {
    name: 'amortissement',
    sentinel: 'cascade/modules/amortissement/tests/system/amortissement.e2e.spec.ts',
  },
  {
    name: 'immobilisation',
    sentinel: 'cascade/modules/immobilisation/tests/system/immobilisation.e2e.spec.ts',
  },
  {
    name: 'gestion-commandes',
    sentinel: 'cascade/modules/gestion-commandes/tests/system/create-cancel-read.system.spec.ts',
  },
  {
    name: 'tresoconsolidation',
    sentinel: 'cascade/modules/tresoconsolidation/tests/system/Tresoconsolidation.e2e.spec.ts',
  },
  {
    name: 'parametres',
    sentinel: 'cascade/modules/parametres/tests/system/parametres.read.e2e.spec.ts',
  },
  {
    name: 'precomptabilite',
    sentinel: 'cascade/modules/precomptabilite/tests/system/precomptabilite.e2e.spec.ts',
  },
  {
    name: 'comptabilite',
    sentinel: 'cascade/modules/comptabilite/tests/system/comptabilite.read.e2e.spec.ts',
  },
  {
    name: 'oie',
    sentinel: 'cascade/modules/oie/tests/guardian/OIEGuardian.spec.ts',
  },
  {
    name: 'budgeting',
    sentinel: 'cascade/modules/budgeting/tests/guardian/guardian.invariants.spec.ts',
  },
  {
    name: 'gestion-tiers',
    sentinel: 'cascade/modules/gestion-tiers/test/build-proof/api-read-models-conformity.test.ts',
  },
  {
    name: 'vente',
    sentinel: 'cascade/modules/vente/tests/e2e/vente.e2e.spec.ts',
  },
  {
    name: 'coaching',
    sentinel: 'cascade/modules/coaching/tests/e2e/coaching.e2e.spec.ts',
  },
  {
    name: 'investisseurs',
    sentinel: 'cascade/modules/investisseurs/tests/e2e/investisseurs.cap-table.e2e.spec.ts',
  },
];

function fail(message) {
  console.error(`[SPOFE modules:extended] ${message}`);
  process.exit(1);
}

function info(message) {
  console.log(`[SPOFE modules:extended] ${message}`);
}

if (!existsSync('cascade/modules')) {
  info('skip: cascade/modules absent on this checkout');
  process.exit(0);
}

const availableModules = [];
const skippedModules = [];

for (const moduleDef of MODULES) {
  if (!existsSync(moduleDef.sentinel)) {
    skippedModules.push(moduleDef);
    info(`skip: sentinel missing for "${moduleDef.name}"`);
    continue;
  }
  availableModules.push(moduleDef);
}

if (availableModules.length === 0) {
  info('skip: no module sentinels found on this checkout');
  process.exit(0);
}

for (const moduleDef of availableModules) {
  const modulePath = path.join('cascade', 'modules', moduleDef.name);
  info(`running tests for ${moduleDef.name}`);
  const result =
    process.platform === 'win32'
      ? spawnSync('cmd.exe', ['/d', '/c', 'npm', '--prefix', modulePath, 'test', '--', '--runInBand'], {
          stdio: 'inherit',
          shell: false,
          env: process.env,
        })
      : spawnSync('npm', ['--prefix', modulePath, 'test', '--', '--runInBand'], {
          stdio: 'inherit',
          shell: false,
          env: process.env,
        });

  if ((result.status ?? 1) !== 0) {
    const details = [
      `module failed: ${moduleDef.name}`,
      `status=${result.status ?? 'null'}`,
      `signal=${result.signal ?? 'null'}`,
      `error=${result.error ? result.error.message : 'null'}`,
    ].join(' | ');
    fail(details);
  }
}

info(
  `completed: ${availableModules.length} modules, skipped: ${skippedModules.length}`
);
