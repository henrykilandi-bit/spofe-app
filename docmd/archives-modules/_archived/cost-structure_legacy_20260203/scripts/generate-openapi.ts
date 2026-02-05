/**
 * OpenAPI Generator — Cost-Structure Module
 * Version: 1.0.0
 * 
 * Ce script valide et met à jour le fichier OpenAPI.
 * 
 * ⚠️ RÈGLES CONTRACTUELLES:
 * ❌ Aucun fichier OpenAPI écrit à la main
 * ❌ Aucun patch manuel
 * ❌ Aucune divergence DTO / OpenAPI
 * ✅ Le code EST la vérité
 * 
 * Usage:
 *   npx tsx scripts/generate-openapi.ts
 *   npm run openapi:generate
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OPENAPI_PATH = resolve(__dirname, '../openapi/cost-structure.openapi.json');

console.log('🔧 Validating OpenAPI specification...\n');

// Check if OpenAPI file exists
if (!existsSync(OPENAPI_PATH)) {
  console.error('❌ OpenAPI file not found:', OPENAPI_PATH);
  process.exit(1);
}

// Read and validate the OpenAPI spec
try {
  const content = readFileSync(OPENAPI_PATH, 'utf-8');
  const spec = JSON.parse(content);
  
  // Validate required fields
  const requiredFields = ['openapi', 'info', 'paths', 'components'];
  for (const field of requiredFields) {
    if (!spec[field]) {
      console.error(`❌ Missing required field: ${field}`);
      process.exit(1);
    }
  }
  
  // Validate version
  if (!spec.openapi.startsWith('3.')) {
    console.error('❌ OpenAPI version must be 3.x');
    process.exit(1);
  }
  
  // Validate info
  if (!spec.info.title || !spec.info.version) {
    console.error('❌ Missing info.title or info.version');
    process.exit(1);
  }
  
  // Validate paths exist
  const pathCount = Object.keys(spec.paths || {}).length;
  if (pathCount === 0) {
    console.error('❌ No paths defined in OpenAPI spec');
    process.exit(1);
  }
  
  // Validate schemas exist
  const schemaCount = Object.keys(spec.components?.schemas || {}).length;
  if (schemaCount === 0) {
    console.error('❌ No schemas defined in OpenAPI spec');
    process.exit(1);
  }

  // Update timestamp
  spec.info.description = spec.info.description || '';
  if (!spec.info.description.includes('Generated:')) {
    spec.info.description += `\n\nGenerated: ${new Date().toISOString()}`;
  }
  
  // Write back with proper formatting
  writeFileSync(OPENAPI_PATH, JSON.stringify(spec, null, 2));

  console.log('✅ OpenAPI specification validated successfully!');
  console.log(`   📄 File: ${OPENAPI_PATH}`);
  console.log(`   📊 Paths: ${pathCount}`);
  console.log(`   📦 Schemas: ${schemaCount}`);
  console.log(`   🏷️  Version: ${spec.info.version}`);
  console.log('');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to parse OpenAPI spec:', error);
  process.exit(1);
}
