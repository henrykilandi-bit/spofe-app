#!/usr/bin/env node

/**
 * CI Check - FCE Behavior Freeze
 * 
 * Vérifie que le comportement du FCE n'a pas changé
 * 
 * Exit codes:
 * - 0: Comportement conforme
 * - 1: Comportement modifié (BLOCKING)
 */

const fs = require('fs');
const path = require('path');

const FCE_README = path.join(
  __dirname,
  '../frontend/core/spofe-contract/README.md'
);

const ERROR_MAPPER = path.join(
  __dirname,
  '../frontend/core/spofe-contract/errorMapper.ts'
);

console.log('🔍 Checking FCE behavior freeze...\n');

// Vérifier que le README existe
if (!fs.existsSync(FCE_README)) {
  console.error('❌ [FCE] README not found');
  console.error(`   Expected at: ${FCE_README}\n`);
  process.exit(1);
}

const readme = fs.readFileSync(FCE_README, 'utf-8');

// Vérifier la version
const versionMatch = readme.match(/Version.*?:\s*(\d+\.\d+\.\d+)/i);
if (!versionMatch) {
  console.error('❌ [FCE] No version found in README\n');
  process.exit(1);
}

const version = versionMatch[1];
console.log(`✅ FCE version: ${version}`);

// Vérifier le statut gelé
if (!readme.includes('GELÉ') && !readme.includes('FROZEN')) {
  console.warn('⚠️  [FCE] README is not marked as frozen');
  console.warn('   This check enforces frozen contracts only\n');
}

// Vérifier les mappings d'erreur obligatoires
const requiredMappings = [
  { code: '401', type: 'AUTH_ERROR', description: 'Authentication error' },
  { code: '403', type: 'GUARDIAN_ERROR', description: 'Guardian decision' },
  { code: '404', type: 'GUARDIAN_ERROR', description: 'Not found (business)' },
  { code: '409', type: 'GUARDIAN_ERROR', description: 'Invariant violation' },
  { code: '500', type: 'SYSTEM_ERROR', description: 'System error' }
];

let mappingErrors = [];

for (const { code, type, description } of requiredMappings) {
  const pattern = new RegExp(`${code}.*?${type}`, 'i');
  if (!readme.match(pattern)) {
    mappingErrors.push(`Missing or incorrect mapping: ${code} → ${type}`);
  }
}

if (mappingErrors.length > 0) {
  console.error('❌ [FCE] Error mapping violations:\n');
  mappingErrors.forEach(err => console.error(`   - ${err}`));
  console.error('\n   FCE error mapping is FROZEN and must not change.\n');
  process.exit(1);
}

console.log('✅ Error mappings verified');

// Vérifier l'errorMapper.ts si présent
if (fs.existsSync(ERROR_MAPPER)) {
  const mapper = fs.readFileSync(ERROR_MAPPER, 'utf-8');
  
  // Vérifier que le mapping 401 existe
  if (!mapper.includes('401') || !mapper.includes('AUTH_ERROR')) {
    console.error('❌ [FCE] errorMapper.ts missing 401 → AUTH_ERROR\n');
    process.exit(1);
  }
  
  // Vérifier que le mapping 403/404/409 existe
  if (!mapper.includes('403') || !mapper.includes('GUARDIAN_ERROR')) {
    console.error('❌ [FCE] errorMapper.ts missing 403 → GUARDIAN_ERROR\n');
    process.exit(1);
  }
  
  console.log('✅ errorMapper.ts verified');
}

// Vérifier les interdictions
const forbiddenPatterns = [
  { pattern: /if\s*\(\s*user\.role/i, description: 'Role-based logic' },
  { pattern: /hasPermission\s*\(/i, description: 'Permission check' },
  { pattern: /isAuthorized\s*\(/i, description: 'Authorization logic' }
];

let violations = [];

for (const { pattern, description } of forbiddenPatterns) {
  if (pattern.test(readme)) {
    violations.push(`Forbidden pattern in README: ${description}`);
  }
}

if (violations.length > 0) {
  console.error('❌ [FCE] Contract violations:\n');
  violations.forEach(v => console.error(`   - ${v}`));
  console.error('\n   FCE must not contain authority logic.\n');
  process.exit(1);
}

console.log('✅ No forbidden patterns detected');
console.log('\n✅ FCE behavior freeze validated\n');

process.exit(0);
