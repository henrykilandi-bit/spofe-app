#!/usr/bin/env node

/**
 * Frontend Module Structure Compliance Check
 * 
 * Vérifie que chaque module frontend respecte exactement
 * l'arborescence définie dans le SPOFE Frontend Module Contract.
 * 
 * Violation = CI FAIL immédiat (0 tolérance)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULES_DIR = path.join(__dirname, '../frontend/modules');

const REQUIRED_STRUCTURE = [
  'module.manifest.md',
  'index.ts',
  'api/module.api.ts',
  'ui/ModuleView.tsx',
  'ui/module.ui.ts',
  'routes/module.routes.ts',
  'hooks/useModuleUI.ts',
  'tests/module.contract.spec.ts'
];

console.log('🔍 Checking frontend module structure...\n');

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

  checkedCount++;
  let moduleOk = true;

  console.log(`📦 Checking module: ${moduleName}`);

  for (const file of REQUIRED_STRUCTURE) {
    const fullPath = path.join(modulePath, file);
    
    if (!fs.existsSync(fullPath)) {
      console.error(`   ❌ MISSING: ${file}`);
      failed = true;
      moduleOk = false;
    } else {
      console.log(`   ✅ ${file}`);
    }
  }

  if (moduleOk) {
    console.log(`   ✅ Module ${moduleName} is COMPLIANT\n`);
  } else {
    console.log(`   ❌ Module ${moduleName} is NON-COMPLIANT\n`);
  }
}

if (checkedCount === 0) {
  console.log('⚠️  No frontend modules found to check');
  process.exit(0);
}

if (failed) {
  console.error('\n❌ STRUCTURE CHECK FAILED');
  console.error('   Modules must follow the exact structure defined in');
  console.error('   SPOFE Frontend Module Contract v1.0.0\n');
  process.exit(1);
}

console.log(`✅ All ${checkedCount} module(s) have correct structure`);
console.log('✅ STRUCTURE CHECK PASSED\n');
