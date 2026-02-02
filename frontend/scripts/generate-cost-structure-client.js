/**
 * Cost-Structure API Client Generator
 * 
 * Generates the frontend API client from OpenAPI specification.
 * This script can be run manually or as part of CI.
 * 
 * Usage:
 *   node scripts/generate-cost-structure-client.js
 *   npm run api:generate:cost-structure
 * 
 * Requirements:
 *   - OpenAPI spec at: ../cascade/modules/cost-structure/openapi/cost-structure.openapi.json
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const OPENAPI_SOURCE = path.resolve(ROOT, '../cascade/modules/cost-structure/openapi/cost-structure.openapi.json');
const OUTPUT_DIR = path.resolve(ROOT, 'src/api/cost-structure');
const GENERATED_MARKER = '⚠️ AUTO-GENERATED FROM OPENAPI — DO NOT EDIT MANUALLY';

console.log('🔧 Cost-Structure API Client Generator\n');

// Check if OpenAPI spec exists
if (!fs.existsSync(OPENAPI_SOURCE)) {
  console.error(`❌ OpenAPI specification not found: ${OPENAPI_SOURCE}`);
  console.error('   Run "npm run openapi:generate" in the cost-structure module first.');
  process.exit(1);
}

// Read OpenAPI spec
const openapi = JSON.parse(fs.readFileSync(OPENAPI_SOURCE, 'utf-8'));

console.log(`📄 Source: ${OPENAPI_SOURCE}`);
console.log(`📁 Output: ${OUTPUT_DIR}`);
console.log(`📊 OpenAPI Version: ${openapi.info.version}`);
console.log(`   Paths: ${Object.keys(openapi.paths || {}).length}`);
console.log(`   Schemas: ${Object.keys(openapi.components?.schemas || {}).length}`);

// Verify generated files exist
const requiredFiles = ['index.js', 'types.d.ts', 'hooks.js'];
const missingFiles = requiredFiles.filter(f => !fs.existsSync(path.join(OUTPUT_DIR, f)));

if (missingFiles.length > 0) {
  console.error(`\n❌ Missing generated files: ${missingFiles.join(', ')}`);
  console.error('   Please regenerate the client manually.');
  process.exit(1);
}

// Verify files are marked as auto-generated
for (const file of requiredFiles) {
  const content = fs.readFileSync(path.join(OUTPUT_DIR, file), 'utf-8');
  if (!content.includes(GENERATED_MARKER)) {
    console.warn(`\n⚠️  Warning: ${file} is missing the auto-generated marker`);
  }
}

// Create a version file for tracking
const versionInfo = {
  version: openapi.info.version,
  generatedAt: new Date().toISOString(),
  source: 'cascade/modules/cost-structure/openapi/cost-structure.openapi.json',
  paths: Object.keys(openapi.paths || {}).length,
  schemas: Object.keys(openapi.components?.schemas || {}).length,
};

fs.writeFileSync(
  path.join(OUTPUT_DIR, 'version.json'),
  JSON.stringify(versionInfo, null, 2)
);

console.log('\n✅ Cost-Structure API client verified!');
console.log(`   Version: ${versionInfo.version}`);
console.log(`   Generated: ${versionInfo.generatedAt}`);
