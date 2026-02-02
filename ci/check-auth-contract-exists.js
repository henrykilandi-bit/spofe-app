#!/usr/bin/env node

/**
 * CI Check - SPOFE Auth Contract Existence
 * 
 * Ensures the SPOFE Auth Contract exists and is versioned.
 * 
 * Exit codes:
 * - 0: Contract exists
 * - 1: Contract missing or invalid
 */

const fs = require('fs');
const path = require('path');

const CONTRACT_PATH = path.join(
  __dirname,
  '../architecture/contracts/infrastructure/SPOFE-Auth-Contract.v1.md'
);

console.log('🔍 Checking SPOFE Auth Contract existence...\n');

if (!fs.existsSync(CONTRACT_PATH)) {
  console.error('❌ [AUTH CONTRACT] SPOFE Auth Contract is missing');
  console.error(`   Expected at: ${CONTRACT_PATH}`);
  console.error('\n   The Auth Contract is mandatory for SPOFE architecture.');
  console.error('   It defines the separation between identity and authority.\n');
  process.exit(1);
}

// Verify it's not empty
const content = fs.readFileSync(CONTRACT_PATH, 'utf-8');
if (content.trim().length === 0) {
  console.error('❌ [AUTH CONTRACT] SPOFE Auth Contract is empty');
  process.exit(1);
}

// Verify version marker exists
if (!content.includes('Version') && !content.includes('v1')) {
  console.error('⚠️  [AUTH CONTRACT] Warning: No version marker found');
  console.error('   Contract should be versioned (e.g., v1.0.0)\n');
}

console.log('✅ SPOFE Auth Contract detected');
console.log(`   Location: ${CONTRACT_PATH}`);
console.log(`   Size: ${content.length} bytes\n`);

process.exit(0);
