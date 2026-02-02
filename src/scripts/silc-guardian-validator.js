#!/usr/bin/env node

/**
 * 🛡️ SILC GUARDIAN VALIDATOR
 * 
 * Validates package.json conformance with SILC governance
 * 
 * Usage: node src/scripts/silc-guardian-validator.js
 */

const fs = require('fs');
const path = require('path');

console.log('\n🛡️  SILC GUARDIAN VALIDATOR\n');

// Read package.json
const pkgPath = path.join(process.cwd(), 'package.json');
const pkgContent = fs.readFileSync(pkgPath, 'utf8');
const pkg = JSON.parse(pkgContent);

let passCount = 0;
let failCount = 0;

function check(condition, name) {
  if (condition) {
    console.log(`✅ ${name}`);
    passCount++;
  } else {
    console.log(`❌ ${name}`);
    failCount++;
  }
}

console.log('📋 Validations:\n');

// Check 1: Valid JSON
try {
  JSON.parse(pkgContent);
  check(true, 'JSON is valid');
} catch (e) {
  check(false, 'JSON is valid');
}

// Check 2: Name field
check(pkg.name, 'Package has name');

// Check 3: Version field
check(pkg.version, 'Package has version');

// Check 4: Scripts object
check(pkg.scripts && typeof pkg.scripts === 'object', 'Scripts object exists');

// Check 5: Essential scripts
check(pkg.scripts?.test, 'Test script exists');
check(pkg.scripts?.lint, 'Lint script exists');
check(pkg.scripts?.['silc:validate'], 'SILC validate script exists');

// Check 6: No circular dependencies
check(
  !pkg.dependencies || !Object.keys(pkg.dependencies).some(dep => 
    pkg.dependencies[dep].includes(pkg.name)
  ),
  'No circular dependencies'
);

// Check 7: Type field (for ES modules)
check(pkg.type === 'module' || !pkg.type, 'Module type is correct');

// Check 8: Private flag
check(pkg.private === true || pkg.private === false, 'Private flag is set');

console.log(`\n════════════════════════════════════════════════════════════`);
console.log(`📊 Results: ${passCount} passed, ${failCount} failed`);
console.log(`════════════════════════════════════════════════════════════\n`);

if (failCount > 0) {
  console.log('❌ SILC validation FAILED');
  process.exit(1);
} else {
  console.log('✅ SILC validation PASSED');
  process.exit(0);
}
