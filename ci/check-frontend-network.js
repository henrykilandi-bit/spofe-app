#!/usr/bin/env node

/**
 * Frontend Network Access Control Check
 * 
 * Détecte et bloque les contournements du Frontend Contract Enforcer :
 * - fetch()
 * - axios
 * - XMLHttpRequest
 * 
 * ZÉRO TOLÉRANCE : toute violation = CI FAIL immédiat
 * 
 * Tous les appels réseau DOIVENT passer par le FCE
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = path.join(__dirname, '../frontend/modules');

const FORBIDDEN_PATTERNS = [
  {
    name: 'fetch()',
    pattern: /\bfetch\s*\(/,
    description: 'Direct HTTP calls are forbidden. Use Frontend Contract Enforcer.'
  },
  {
    name: 'axios',
    pattern: /\baxios\./,
    description: 'Axios library is forbidden. Use Frontend Contract Enforcer.'
  },
  {
    name: 'XMLHttpRequest',
    pattern: /new\s+XMLHttpRequest/,
    description: 'XMLHttpRequest is forbidden. Use Frontend Contract Enforcer.'
  },
  {
    name: 'window.fetch',
    pattern: /window\s*\.\s*fetch/,
    description: 'Direct HTTP calls are forbidden. Use Frontend Contract Enforcer.'
  }
];

const TS_EXTENSIONS = ['.ts', '.tsx', '.js', '.jsx'];

console.log('🔍 Checking for unauthorized network access...\n');
console.log('   Scanning for direct API calls that bypass the');
console.log('   Frontend Contract Enforcer (FCE)...\n');

let failed = false;
let filesScanned = 0;

function scanDirectory(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);

    // Skip node_modules and dist/build outputs
    if (entry.name === 'node_modules' || 
        entry.name === 'dist' || 
        entry.name === 'build' ||
        entry.name === '.next') {
      continue;
    }

    if (entry.isDirectory()) {
      scanDirectory(fullPath);
    } else if (TS_EXTENSIONS.includes(path.extname(entry.name))) {
      filesScanned++;
      const content = fs.readFileSync(fullPath, 'utf8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const lineNumber = i + 1;

        for (const forbidden of FORBIDDEN_PATTERNS) {
          if (forbidden.pattern.test(line)) {
            console.error(`\n❌ [NETWORK VIOLATION] ${forbidden.name}`);
            console.error(`   File: ${path.relative(MODULES_DIR, fullPath)}`);
            console.error(`   Line: ${lineNumber}`);
            console.error(`   Code: ${line.trim()}`);
            console.error(`   Reason: ${forbidden.description}`);
            failed = true;
          }
        }
      }
    }
  }
}

// Check if modules directory exists
if (!fs.existsSync(MODULES_DIR)) {
  console.log('⚠️  Frontend modules directory does not exist yet');
  process.exit(0);
}

scanDirectory(MODULES_DIR);

if (filesScanned === 0) {
  console.log('⚠️  No TypeScript/JavaScript files found to scan');
  process.exit(0);
}

if (failed) {
  console.error('\n' + '='.repeat(70));
  console.error('❌ NETWORK ACCESS CONTROL CHECK FAILED');
  console.error('='.repeat(70));
  console.error('\n   Modules MUST NOT make direct HTTP calls.');
  console.error('\n   All network communication MUST go through:');
  console.error('   📍 Frontend Contract Enforcer (FCE)');
  console.error('\n   Example (CORRECT):\n');
  console.error('     import { sendCommand } from "@/core/spofe-contract";');
  console.error('     await sendCommand("CreateAggregate", { ... });');
  console.error('\n   Example (FORBIDDEN - BLOCKED):\n');
  console.error('     ❌ fetch("/api/...");');
  console.error('     ❌ axios.get("/api/...");');
  console.error('     ❌ new XMLHttpRequest();');
  console.error('\n   See: contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md');
  console.error('   Section: 5.1 API (api/) & 6. Interdictions absolues\n');
  process.exit(1);
}

console.log(`✅ Scanned ${filesScanned} file(s)`);
console.log('✅ No unauthorized network access detected');
console.log('✅ NETWORK ACCESS CONTROL CHECK PASSED\n');
