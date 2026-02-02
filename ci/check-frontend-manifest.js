#!/usr/bin/env node

/**
 * Frontend Module Manifest Compliance Check
 * 
 * Vérifie que chaque module déclare explicitement :
 * - contractVersion (version du SPOFE Frontend Module Contract)
 * - readModels (read-models SPOFE consommés)
 * - commands (Commands SPOFE émises)
 * 
 * Violation = CI FAIL immédiat
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = path.join(__dirname, '../frontend/modules');

const REQUIRED_KEYS = [
  'contractVersion',
  'readModels',
  'commands'
];

console.log('🔍 Checking frontend module manifests...\n');

let failed = false;
let checkedCount = 0;

// Check if modules directory exists
if (!fs.existsSync(MODULES_DIR)) {
  console.log('⚠️  Frontend modules directory does not exist yet');
  process.exit(0);
}

for (const moduleName of fs.readdirSync(MODULES_DIR)) {
  const modulePath = path.join(MODULES_DIR, moduleName);
  
  // Skip if not a directory
  if (!fs.statSync(modulePath).isDirectory()) {
    continue;
  }

  const manifestPath = path.join(modulePath, 'module.manifest.md');
  
  // Manifest must exist (checked by structure check, but we verify here too)
  if (!fs.existsSync(manifestPath)) {
    console.error(`❌ [MANIFEST] ${moduleName}: module.manifest.md not found`);
    failed = true;
    continue;
  }

  checkedCount++;
  const content = fs.readFileSync(manifestPath, 'utf8');
  let manifestOk = true;

  console.log(`📋 Checking manifest: ${moduleName}`);

  for (const key of REQUIRED_KEYS) {
    const pattern = `${key}:`;
    
    if (!content.includes(pattern)) {
      console.error(`   ❌ MISSING DECLARATION: ${key}`);
      failed = true;
      manifestOk = false;
    } else {
      console.log(`   ✅ Declared: ${key}`);
    }
  }

  if (manifestOk) {
    console.log(`   ✅ Manifest ${moduleName} is COMPLIANT\n`);
  } else {
    console.log(`   ❌ Manifest ${moduleName} is NON-COMPLIANT\n`);
  }
}

if (checkedCount === 0) {
  console.log('⚠️  No frontend modules found to check');
  process.exit(0);
}

if (failed) {
  console.error('\n❌ MANIFEST CHECK FAILED');
  console.error('   Each module MUST declare:');
  console.error('   - contractVersion: (e.g., "1.0.0")');
  console.error('   - readModels: (list of SPOFE read-models consumed)');
  console.error('   - commands: (list of SPOFE Commands emitted)\n');
  console.error('   See: contracts/frontend-modules/SPOFE-Frontend-Module-Contract.v1.md\n');
  process.exit(1);
}

console.log(`✅ All ${checkedCount} module manifest(s) are compliant`);
console.log('✅ MANIFEST CHECK PASSED\n');
