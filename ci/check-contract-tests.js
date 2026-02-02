#!/usr/bin/env node

/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CI CONTRACT TESTS — Pipeline Bloquant SPOFE
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * 🎯 Ce script orchestre TOUS les tests contractuels FE ↔ BE
 * 
 * Ordre d'exécution (bloquant):
 * 1. ✅ Génération OpenAPI (backend)
 * 2. ✅ Génération client frontend
 * 3. ✅ Build TypeScript frontend (NIVEAU 1 - compilation = contrat)
 * 4. ✅ Tests contractuels backend OpenAPI (NIVEAU 2)
 * 5. ✅ Tests contractuels frontend (NIVEAU 1+2)
 * 6. ✅ Tests E2E FE ↔ BE (NIVEAU 3) [optionnel en CI rapide]
 * 
 * ⚠️ RÈGLES SPOFE:
 * ❌ Un seul échec = CI rouge
 * ❌ Aucun bypass autorisé
 * ✅ OpenAPI = loi
 * ✅ TypeScript = juge
 * ✅ CI = arbitre final
 * 
 * Usage:
 *   node ci/check-contract-tests.js
 *   node ci/check-contract-tests.js --module immobilisation
 *   node ci/check-contract-tests.js --full (inclut E2E)
 */

import { execSync, spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

// ═══════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

const MODULES = {
  immobilisation: {
    name: 'Immobilisation',
    backendPath: 'cascade/modules/immobilisation',
    frontendApiPath: 'frontend/src/api/immobilisation',
    openapiPath: 'cascade/modules/immobilisation/openapi/immobilisation.openapi.json',
    contractTestBackend: 'cascade/modules/immobilisation/tests/contract',
    contractTestFrontend: 'frontend/src/contract-tests/immobilisation.contract.spec.ts',
    e2eTestPath: 'frontend/cypress/e2e/contract/immobilisation.contract.cy.js',
  },
  'cost-structure': {
    name: 'Cost-Structure',
    backendPath: 'cascade/modules/cost-structure',
    frontendApiPath: 'frontend/src/api/cost-structure',
    openapiPath: 'cascade/modules/cost-structure/openapi/cost-structure.openapi.json',
    contractTestBackend: 'cascade/modules/cost-structure/tests/contract',
    contractTestFrontend: 'frontend/src/contract-tests/cost-structure.contract.spec.js',
    e2eTestPath: null,
  },
};

// Parse CLI arguments
const args = process.argv.slice(2);
const targetModule = args.find(a => a.startsWith('--module='))?.split('=')[1];
const runFull = args.includes('--full');
const verbose = args.includes('--verbose') || args.includes('-v');

// ═══════════════════════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════════════════════

const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(title) {
  console.log('');
  log('═'.repeat(70), 'cyan');
  log(`  ${title}`, 'bold');
  log('═'.repeat(70), 'cyan');
  console.log('');
}

function step(num, title) {
  log(`\n[STEP ${num}] ${title}`, 'blue');
  log('─'.repeat(50), 'blue');
}

function success(message) {
  log(`✅ ${message}`, 'green');
}

function error(message) {
  log(`❌ ${message}`, 'red');
}

function warning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function runCommand(command, cwd = ROOT, options = {}) {
  if (verbose) {
    log(`  > ${command}`, 'cyan');
  }
  
  try {
    execSync(command, {
      cwd,
      stdio: verbose ? 'inherit' : 'pipe',
      encoding: 'utf-8',
      ...options,
    });
    return { success: true };
  } catch (err) {
    return { success: false, error: err.message, stderr: err.stderr };
  }
}

function checkFileExists(relativePath) {
  return fs.existsSync(path.join(ROOT, relativePath));
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTRACT TEST STEPS
// ═══════════════════════════════════════════════════════════════════════════

const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  details: [],
};

function recordResult(name, passed, message = '') {
  if (passed) {
    results.passed++;
    success(`${name}: PASSED`);
  } else {
    results.failed++;
    error(`${name}: FAILED - ${message}`);
  }
  results.details.push({ name, passed, message });
}

/**
 * Step 1: Verify OpenAPI specification exists and is valid
 */
function checkOpenAPISpec(module) {
  const moduleDef = MODULES[module];
  
  if (!checkFileExists(moduleDef.openapiPath)) {
    recordResult(
      `OpenAPI Spec (${module})`,
      false,
      `File not found: ${moduleDef.openapiPath}`
    );
    return false;
  }
  
  try {
    const spec = JSON.parse(fs.readFileSync(path.join(ROOT, moduleDef.openapiPath), 'utf-8'));
    
    if (!spec.openapi || !spec.info || !spec.paths) {
      recordResult(
        `OpenAPI Spec (${module})`,
        false,
        'Invalid OpenAPI structure'
      );
      return false;
    }
    
    const pathCount = Object.keys(spec.paths).length;
    const schemaCount = Object.keys(spec.components?.schemas || {}).length;
    
    recordResult(
      `OpenAPI Spec (${module})`,
      true,
      `Version ${spec.info.version}, ${pathCount} paths, ${schemaCount} schemas`
    );
    return true;
  } catch (err) {
    recordResult(`OpenAPI Spec (${module})`, false, err.message);
    return false;
  }
}

/**
 * Step 2: Verify frontend client is generated
 */
function checkFrontendClient(module) {
  const moduleDef = MODULES[module];
  
  const requiredFiles = ['index.ts', 'types.d.ts', 'hooks.ts'];
  const missingFiles = requiredFiles.filter(
    f => !checkFileExists(path.join(moduleDef.frontendApiPath, f))
  );
  
  if (missingFiles.length > 0) {
    recordResult(
      `Frontend Client (${module})`,
      false,
      `Missing files: ${missingFiles.join(', ')}`
    );
    return false;
  }
  
  // Check for auto-generated marker
  const indexContent = fs.readFileSync(
    path.join(ROOT, moduleDef.frontendApiPath, 'index.ts'),
    'utf-8'
  );
  
  if (!indexContent.includes('AUTO-GENERATED FROM OPENAPI')) {
    warning(`Frontend client (${module}) may have been manually modified!`);
  }
  
  recordResult(`Frontend Client (${module})`, true);
  return true;
}

/**
 * Step 3: TypeScript compilation (NIVEAU 1)
 */
function checkTypeScriptCompilation() {
  const result = runCommand('npm run typecheck', path.join(ROOT, 'frontend'));
  
  if (!result.success) {
    recordResult(
      'TypeScript Compilation (NIVEAU 1)',
      false,
      'TypeScript compilation failed - CONTRACT BROKEN'
    );
    return false;
  }
  
  recordResult('TypeScript Compilation (NIVEAU 1)', true);
  return true;
}

/**
 * Step 4: Backend contract tests (NIVEAU 2)
 */
function runBackendContractTests(module) {
  const moduleDef = MODULES[module];
  const testDir = path.join(ROOT, moduleDef.contractTestBackend);
  
  if (!fs.existsSync(testDir)) {
    warning(`No backend contract tests found for ${module}`);
    results.skipped++;
    return true;
  }
  
  const result = runCommand(
    'npx jest --config tests/contract/jest.contract.config.js',
    path.join(ROOT, moduleDef.backendPath)
  );
  
  if (!result.success) {
    recordResult(
      `Backend Contract Tests (${module})`,
      false,
      'OpenAPI validation failed'
    );
    return false;
  }
  
  recordResult(`Backend Contract Tests (${module})`, true);
  return true;
}

/**
 * Step 5: Frontend contract tests (NIVEAU 1+2)
 */
function runFrontendContractTests() {
  const result = runCommand(
    'npm run test:contract',
    path.join(ROOT, 'frontend')
  );
  
  if (!result.success) {
    recordResult(
      'Frontend Contract Tests (NIVEAU 1+2)',
      false,
      'Contract tests failed'
    );
    return false;
  }
  
  recordResult('Frontend Contract Tests (NIVEAU 1+2)', true);
  return true;
}

/**
 * Step 6: E2E contract tests (NIVEAU 3) - Optional
 */
function runE2EContractTests() {
  if (!runFull) {
    warning('E2E tests skipped (use --full to run)');
    results.skipped++;
    return true;
  }
  
  const result = runCommand(
    'npm run e2e:headless -- --spec "cypress/e2e/contract/**/*.cy.js"',
    path.join(ROOT, 'frontend')
  );
  
  if (!result.success) {
    recordResult(
      'E2E Contract Tests (NIVEAU 3)',
      false,
      'E2E tests failed'
    );
    return false;
  }
  
  recordResult('E2E Contract Tests (NIVEAU 3)', true);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN EXECUTION
// ═══════════════════════════════════════════════════════════════════════════

async function main() {
  header('SPOFE CONTRACT TESTS — CI Pipeline');
  
  log('Configuration:', 'bold');
  log(`  Module: ${targetModule || 'ALL'}`);
  log(`  Full E2E: ${runFull}`);
  log(`  Verbose: ${verbose}`);
  
  const modulesToTest = targetModule 
    ? [targetModule] 
    : Object.keys(MODULES);
  
  let allPassed = true;
  
  // ─────────────────────────────────────────────────────────────
  // STEP 1: OpenAPI Specifications
  // ─────────────────────────────────────────────────────────────
  
  step(1, 'Verify OpenAPI Specifications');
  
  for (const module of modulesToTest) {
    if (!checkOpenAPISpec(module)) {
      allPassed = false;
    }
  }
  
  // ─────────────────────────────────────────────────────────────
  // STEP 2: Frontend Clients
  // ─────────────────────────────────────────────────────────────
  
  step(2, 'Verify Frontend API Clients');
  
  for (const module of modulesToTest) {
    if (!checkFrontendClient(module)) {
      allPassed = false;
    }
  }
  
  // ─────────────────────────────────────────────────────────────
  // STEP 3: TypeScript Compilation (NIVEAU 1)
  // ─────────────────────────────────────────────────────────────
  
  step(3, 'TypeScript Compilation (NIVEAU 1 — Static Contract)');
  
  if (!checkTypeScriptCompilation()) {
    allPassed = false;
    error('NIVEAU 1 FAILED: TypeScript compilation errors = CONTRACT BROKEN');
    // Don't continue if compilation fails
    printSummary();
    process.exit(1);
  }
  
  // ─────────────────────────────────────────────────────────────
  // STEP 4: Backend Contract Tests (NIVEAU 2)
  // ─────────────────────────────────────────────────────────────
  
  step(4, 'Backend Contract Tests (NIVEAU 2 — OpenAPI Validation)');
  
  for (const module of modulesToTest) {
    if (!runBackendContractTests(module)) {
      allPassed = false;
    }
  }
  
  // ─────────────────────────────────────────────────────────────
  // STEP 5: Frontend Contract Tests (NIVEAU 1+2)
  // ─────────────────────────────────────────────────────────────
  
  step(5, 'Frontend Contract Tests (NIVEAU 1+2 — Client Validation)');
  
  if (!runFrontendContractTests()) {
    allPassed = false;
  }
  
  // ─────────────────────────────────────────────────────────────
  // STEP 6: E2E Contract Tests (NIVEAU 3) - Optional
  // ─────────────────────────────────────────────────────────────
  
  step(6, 'E2E Contract Tests (NIVEAU 3 — Full Integration)');
  
  if (!runE2EContractTests()) {
    allPassed = false;
  }
  
  // ─────────────────────────────────────────────────────────────
  // SUMMARY
  // ─────────────────────────────────────────────────────────────
  
  printSummary();
  
  if (!allPassed) {
    error('\n🚫 CONTRACT TESTS FAILED — CI BLOCKED');
    error('   Fix contract violations before merge.');
    process.exit(1);
  }
  
  success('\n✅ ALL CONTRACT TESTS PASSED — CI APPROVED');
  process.exit(0);
}

function printSummary() {
  header('CONTRACT TEST SUMMARY');
  
  log(`  Passed:  ${results.passed}`, 'green');
  log(`  Failed:  ${results.failed}`, results.failed > 0 ? 'red' : 'reset');
  log(`  Skipped: ${results.skipped}`, 'yellow');
  
  if (results.failed > 0) {
    console.log('\nFailed tests:');
    results.details
      .filter(d => !d.passed)
      .forEach(d => error(`  - ${d.name}: ${d.message}`));
  }
  
  console.log('\n' + '═'.repeat(70));
}

// Run
main().catch(err => {
  error(`Unexpected error: ${err.message}`);
  process.exit(1);
});
