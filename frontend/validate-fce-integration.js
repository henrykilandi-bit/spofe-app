#!/usr/bin/env node

/**
 * FCE Integration Validation Script
 * 
 * Validates that:
 * 1. readModelClient.js uses INTERNAL_FETCH
 * 2. commandClient.js uses INTERNAL_FETCH
 * 3. fetch-guard.js is imported in main.jsx
 * 4. bootstrapSPOFE is called in main.jsx
 */

import fs from 'fs';
import path from 'path';

const checks = [];

function check(name, condition, details = '') {
  const status = condition ? '✓' : '✗';
  checks.push({ name, condition, status, details });
  console.log(`${status} ${name}${details ? ` - ${details}` : ''}`);
}

// Check 1: readModelClient.js uses INTERNAL_FETCH
const readModelPath = './core/spofe-contract/readModelClient.js';
const readModelCode = fs.readFileSync(readModelPath, 'utf8');
check(
  'readModelClient.js imports INTERNAL_FETCH',
  readModelCode.includes("import { INTERNAL_FETCH } from '../internal-fetch.js'"),
  readModelCode.includes("import { INTERNAL_FETCH }") ? 'found' : 'missing'
);

check(
  'readModelClient.js uses INTERNAL_FETCH for HTTP calls',
  readModelCode.includes('const response = await INTERNAL_FETCH(url, fetchOptions)'),
  readModelCode.includes('const response = await INTERNAL_FETCH') ? 'found' : 'missing'
);

// Check 2: commandClient.js uses INTERNAL_FETCH
const commandPath = './core/spofe-contract/commandClient.js';
const commandCode = fs.readFileSync(commandPath, 'utf8');
check(
  'commandClient.js imports INTERNAL_FETCH',
  commandCode.includes("import { INTERNAL_FETCH } from '../internal-fetch.js'"),
  commandCode.includes("import { INTERNAL_FETCH }") ? 'found' : 'missing'
);

check(
  'commandClient.js uses INTERNAL_FETCH for HTTP calls',
  commandCode.includes('const response = await INTERNAL_FETCH(url, fetchOptions)'),
  commandCode.includes('const response = await INTERNAL_FETCH') ? 'found' : 'missing'
);

// Check 3: main.jsx loads fetch-guard first
const mainPath = './src/main.jsx';
const mainCode = fs.readFileSync(mainPath, 'utf8');
const fetchGuardImportIdx = mainCode.indexOf("import '../core/fetch-guard.js'");
const firstImportIdx = mainCode.search(/^\s*import\s+/m);

check(
  'fetch-guard is imported in main.jsx',
  mainCode.includes("import '../core/fetch-guard.js'"),
  fetchGuardImportIdx >= 0 ? 'found' : 'missing'
);

check(
  'fetch-guard import is FIRST in main.jsx',
  fetchGuardImportIdx >= 0 && fetchGuardImportIdx < firstImportIdx + 50,
  fetchGuardImportIdx >= 0 ? 'correct position' : 'wrong position'
);

// Check 4: bootstrapSPOFE is called
check(
  'bootstrapSPOFE is imported in main.jsx',
  mainCode.includes("import { bootstrapSPOFE } from '../core/bootstrap.js'"),
  mainCode.includes('bootstrapSPOFE') ? 'found' : 'missing'
);

check(
  'bootstrapSPOFE is called before render',
  mainCode.includes('await bootstrapSPOFE()'),
  mainCode.includes('await bootstrapSPOFE()') ? 'found' : 'missing'
);

// Check 5: No direct fetch() calls remain
const hasDirect = readModelCode.includes('await fetch(') || commandCode.includes('await fetch(');
check(
  'No direct fetch() calls in client files',
  !hasDirect,
  hasDirect ? 'VIOLATION: found direct fetch() calls' : 'clean'
);

// Summary
console.log('\n' + '='.repeat(50));
const passed = checks.filter(c => c.condition).length;
const total = checks.length;
const allPassed = passed === total;

console.log(`Results: ${passed}/${total} checks passed`);

if (allPassed) {
  console.log('✓ Phase 2 FCE Integration SUCCESS - All checks passed!');
  process.exit(0);
} else {
  console.log('✗ Phase 2 FCE Integration FAILED - Some checks did not pass');
  process.exit(1);
}
