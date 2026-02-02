#!/usr/bin/env node

/**
 * Frontend Contract Enforcer - Validation Script (Node.js)
 * 
 * Valide que le frontend respecte le contrat SPOFE
 * Usage: node scripts/validate-fce.mjs [--strict]
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

const STRICT = process.argv.includes('--strict');
const SOURCE_PATH = process.argv[2] || 'src';

let errorCount = 0;
let warningCount = 0;

// Colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m'
};

function section(title, number) {
  console.log('');
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
  console.log(`${colors.cyan}  [${number}/5] ${title}${colors.reset}`);
  console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
}

function pass(message) {
  console.log(`${colors.green}✓ PASSÉ${colors.reset}: ${message}`);
}

function fail(message) {
  console.log(`${colors.red}✗ ÉCHEC${colors.reset}: ${message}`);
  errorCount++;
}

function warn(message) {
  console.log(`${colors.yellow}⚠ AVERTISSEMENT${colors.reset}: ${message}`);
  warningCount++;
}

function searchFiles(dir, pattern, exclude = []) {
  const results = [];

  function walk(currentPath) {
    if (!fs.existsSync(currentPath)) return;

    const files = fs.readdirSync(currentPath);

    files.forEach(file => {
      const fullPath = path.join(currentPath, file);
      const stat = fs.statSync(fullPath);

      // Skip excluded
      if (exclude.some(ex => fullPath.includes(ex))) {
        return;
      }

      if (stat.isDirectory()) {
        walk(fullPath);
      } else if (stat.isFile() && /\.(ts|js|tsx|jsx)$/.test(fullPath)) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        if (pattern.test(content)) {
          results.push({ path: fullPath, content });
        }
      }
    });
  }

  walk(dir);
  return results;
}

// Main validation
console.log('');
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log(`${colors.cyan}  SPOFE Frontend Contract Enforcer - Validation${colors.reset}`);
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);

// 1. CHECK: Pas de fetch() direct
section('Pas de fetch() en dehors de FCE', '1');

const fetchResults = searchFiles(
  path.join(projectRoot, SOURCE_PATH),
  /fetch\s*\(/,
  ['spofe-contract', '__tests__', 'node_modules']
);

if (fetchResults.length > 0) {
  fail('fetch() détecté en dehors de spofe-contract');
  fetchResults.forEach(r => {
    console.log(`  → ${r.path}`);
  });
} else {
  pass('Aucun fetch() direct');
}

// 2. CHECK: Pas de localStorage métier
section('Pas de localStorage/sessionStorage métier', '2');

const storageResults = searchFiles(
  path.join(projectRoot, SOURCE_PATH),
  /(localStorage|sessionStorage).*\.(status|balance|aggregate|amount|permission)/,
  ['spofe-contract', '__tests__', 'node_modules']
);

if (storageResults.length > 0) {
  fail('localStorage métier détecté');
  storageResults.forEach(r => {
    console.log(`  → ${r.path}`);
  });
} else {
  pass('Aucun localStorage métier');
}

// 3. CHECK: Pas de logique métier dans les vues
section('Pas de logique métier dans les vues', '3');

const componentPath = path.join(projectRoot, SOURCE_PATH, 'components');
let suspectLogic = [];

if (fs.existsSync(componentPath)) {
  suspectLogic = searchFiles(
    componentPath,
    /if\s*\(.*\.(status|balance|closed|approved)/,
    ['__tests__']
  );
}

if (suspectLogic.length > 0) {
  warn('Logique métier potentielle dans les vues');
  suspectLogic.forEach(r => {
    console.log(`  → ${r.path}`);
  });
} else {
  pass('Aucune logique métier suspecte');
}

// 4. CHECK: Imports FCE cohérents
section('Imports FCE utilisent le point d\'entrée', '4');

const importResults = searchFiles(
  path.join(projectRoot, SOURCE_PATH),
  /from\s+['"]@\/core\/spofe-contract\//,
  ['spofe-contract', '__tests__', 'node_modules']
);

if (importResults.length > 0) {
  fail('Import direct depuis un sous-module FCE');
  importResults.forEach(r => {
    console.log(`  → ${r.path}`);
  });
  console.log(`${colors.yellow}    → Utiliser: import { ... } from '@/core/spofe-contract'${colors.reset}`);
} else {
  pass('Tous les imports FCE correctement structurés');
}

// 5. CHECK: Contract chargé au startup
section('Contract chargé au startup', '5');

const startupFiles = ['main.ts', 'index.ts', 'app.ts'];
let contractLoaded = false;

for (const file of startupFiles) {
  const files = fs.readdirSync(path.join(projectRoot, SOURCE_PATH))
    .filter(f => f === file);

  for (const f of files) {
    const content = fs.readFileSync(path.join(projectRoot, SOURCE_PATH, f), 'utf-8');
    if (/loadContract\s*\(\)/.test(content)) {
      contractLoaded = true;
      break;
    }
  }

  if (contractLoaded) break;
}

if (contractLoaded) {
  pass('Contract chargé au startup');
} else {
  warn('loadContract() non détecté au startup');
  console.log(`${colors.yellow}    → Ajouter dans main.ts: await loadContract()${colors.reset}`);
}

// RÉSUMÉ
console.log('');
console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);

if (errorCount === 0) {
  console.log(`${colors.green}✓ TOUS LES CHECKS PASSÉS${colors.reset}`);
  console.log(`${colors.green}  Frontend respecte le contrat SPOFE${colors.reset}`);
  if (warningCount > 0) {
    console.log(`${colors.yellow}  Avertissements: ${warningCount}${colors.reset}`);
  }
} else {
  console.log(`${colors.red}✗ VALIDATION ÉCHOUÉE${colors.reset}`);
  console.log(`${colors.red}  Erreurs: ${errorCount} | Avertissements: ${warningCount}${colors.reset}`);
  console.log(`${colors.red}  Veuillez corriger les violations avant de merger${colors.reset}`);
}

console.log(`${colors.cyan}═══════════════════════════════════════════════════════════${colors.reset}`);
console.log('');

if (STRICT && errorCount > 0) {
  process.exit(1);
}

process.exit(0);
