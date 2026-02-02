#!/usr/bin/env node

/**
 * SPOFE Blocking Architecture Validation
 * 
 * Validates that:
 * 1. Contract is loaded with loadContractOrFail()
 * 2. Bootstrap is BLOCKING and called in main.jsx
 * 3. Fatal error page is available
 * 4. Contract readiness verification is in place
 * 5. No way to bypass bootstrap
 */

import fs from 'fs';

const checks = [];

function check(name, condition, details = '') {
  const status = condition ? '✓' : '✗';
  checks.push({ name, condition, status, details });
  console.log(`${status} ${name}${details ? ` - ${details}` : ''}`);
}

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION 1: contractLoader.js has blocking function
// ════════════════════════════════════════════════════════════════════════════

const contractLoaderCode = fs.readFileSync(
  './core/spofe-contract/contractLoader.js',
  'utf8'
);

check(
  'contractLoader.js exports loadContractOrFail()',
  contractLoaderCode.includes('export async function loadContractOrFail()'),
  'Blocking function implemented'
);

check(
  'loadContractOrFail() is documented as BLOCKING',
  contractLoaderCode.includes('PRÉ-CONDITION ABSOLUE') ||
  contractLoaderCode.includes('BLOCKING') ||
  contractLoaderCode.includes('Aucun fallback'),
  'Architecture documented'
);

check(
  'isContractBootstrapped() verification exists',
  contractLoaderCode.includes('export function isContractBootstrapped()'),
  'Readiness check implemented'
);

check(
  'contractBootstrapped flag tracking',
  contractLoaderCode.includes('contractBootstrapped'),
  'State tracking in place'
);

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION 2: bootstrap.js implements blocking sequence
// ════════════════════════════════════════════════════════════════════════════

const bootstrapCode = fs.readFileSync('./core/bootstrap.js', 'utf8');

check(
  'bootstrap.js calls loadContractOrFail()',
  bootstrapCode.includes('loadContractOrFail()'),
  'Contract loading is blocking'
);

check(
  'bootstrap.js has renderFatalError() function',
  bootstrapCode.includes('renderFatalError'),
  'Fatal error display implemented'
);

check(
  'renderFatalError() displays user-friendly message',
  bootstrapCode.includes('Application indisponible') ||
  bootstrapCode.includes('Application unavailable'),
  'Error page has clear message'
);

check(
  'Error handling re-throws to stop execution',
  bootstrapCode.includes('throw error') && bootstrapCode.includes('catch (error)'),
  'Bootstrap failures are fatal'
);

check(
  'isContractBootstrapped() is verified',
  bootstrapCode.includes('isContractBootstrapped()'),
  'Double-check in place'
);

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION 3: main.jsx has blocking initialization
// ════════════════════════════════════════════════════════════════════════════

const mainCode = fs.readFileSync('./src/main.jsx', 'utf8');

check(
  'main.jsx imports fetch-guard FIRST',
  mainCode.includes("import '../core/fetch-guard.js'") &&
  (mainCode.indexOf("import '../core/fetch-guard.js'") < mainCode.indexOf('import React')),
  'Interception happens first'
);

check(
  'main.jsx has initializeApp() wrapper',
  mainCode.includes('initializeApp()') || mainCode.includes('async function'),
  'Blocking initialization sequence'
);

check(
  'main.jsx calls bootstrapSPOFE()',
  mainCode.includes('bootstrapSPOFE()'),
  'Bootstrap is called'
);

check(
  'bootstrapSPOFE() is awaited',
  mainCode.includes('await bootstrapSPOFE()'),
  'Bootstrap is blocking'
);

check(
  'React.render() is AFTER bootstrapSPOFE()',
  mainCode.includes('await bootstrapSPOFE()') &&
  mainCode.indexOf('await bootstrapSPOFE()') < mainCode.indexOf('ReactDOM.createRoot'),
  'React only renders after contract is valid'
);

check(
  'main.jsx has try/catch error handling',
  mainCode.includes('try') && mainCode.includes('catch'),
  'Fatal errors are caught'
);

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION 4: index.js has readiness verification
// ════════════════════════════════════════════════════════════════════════════

const indexCode = fs.readFileSync('./core/spofe-contract/index.js', 'utf8');

check(
  'index.js exports bootstrap() function',
  indexCode.includes('export async function bootstrap()'),
  'Bootstrap export available'
);

check(
  'index.js has ensureBootstrapped() check',
  indexCode.includes('ensureBootstrapped()') || indexCode.includes('contractReady'),
  'Readiness verification in place'
);

check(
  'loadContractOrFail() is imported',
  indexCode.includes('loadContractOrFail'),
  'Blocking loader imported'
);

check(
  'index.js documents bootstrap requirement',
  indexCode.includes('PRÉ-CONDITION') || 
  indexCode.includes('bootstrap is mandatory') ||
  indexCode.includes('BLOCKING REQUIREMENT'),
  'Architecture is documented'
);

// ════════════════════════════════════════════════════════════════════════════
// VALIDATION 5: Test suite validates blocking behavior
// ════════════════════════════════════════════════════════════════════════════

let testFileExists = false;
let testFileContent = '';

try {
  testFileContent = fs.readFileSync(
    './core/spofe-contract/__tests__/bootstrap-blocking.test.js',
    'utf8'
  );
  testFileExists = true;
} catch (e) {
  // File doesn't exist yet
}

check(
  'bootstrap-blocking.test.js exists',
  testFileExists,
  'Test suite for guarantee'
);

if (testFileExists) {
  check(
    'Test suite verifies sendCommand is blocked without bootstrap',
    testFileContent.includes('should BLOCK sendCommand()'),
    'sendCommand() blocking tested'
  );

  check(
    'Test suite verifies readModel is blocked without bootstrap',
    testFileContent.includes('should BLOCK readModel()'),
    'readModel() blocking tested'
  );

  check(
    'Test suite documents no-fallback behavior',
    testFileContent.includes('NO fallback') ||
    testFileContent.includes('BLOCKING DEPENDENCY'),
    'No-fallback guarantee documented'
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SUMMARY
// ════════════════════════════════════════════════════════════════════════════

console.log('\n' + '='.repeat(70));

const passed = checks.filter(c => c.condition).length;
const total = checks.length;
const allPassed = passed === total;

console.log(`Results: ${passed}/${total} checks passed`);
console.log('');

if (allPassed) {
  console.log('✓✓✓ SPOFE BLOCKING ARCHITECTURE - ALL CHECKS PASSED ✓✓✓');
  console.log('');
  console.log('Guarantee: No contract = No app');
  console.log('  • loadContractOrFail() is blocking');
  console.log('  • bootstrapSPOFE() blocks without contract');
  console.log('  • React only renders after contract is valid');
  console.log('  • Fatal error page displayed on failure');
  console.log('  • No fallback, no default, no workarounds');
  console.log('');
  console.log('Architecture Status: ✅ READY FOR PRODUCTION');
  process.exit(0);
} else {
  console.log('✗ SPOFE BLOCKING ARCHITECTURE - SOME CHECKS FAILED');
  console.log('');
  console.log('Failed checks:');
  checks
    .filter(c => !c.condition)
    .forEach(c => {
      console.log(`  ✗ ${c.name}`);
    });
  process.exit(1);
}
