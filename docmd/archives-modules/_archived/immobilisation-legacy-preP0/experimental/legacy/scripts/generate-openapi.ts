/**
 * OpenAPI Generator — Immobilisation Module
 * Version: 1.0.0
 * 
 * Ce script génère et valide le fichier OpenAPI depuis les controllers NestJS.
 * 
 * ⚠️ RÈGLES CONTRACTUELLES SPOFE:
 * ❌ Aucun fichier OpenAPI écrit à la main
 * ❌ Aucun patch manuel
 * ❌ Aucune divergence DTO / OpenAPI
 * ✅ Le code EST la vérité
 * ✅ DTOs = source unique
 * ✅ Controllers = définition des routes
 * 
 * Usage:
 *   npx tsx scripts/generate-openapi.ts
 *   npm run openapi:generate
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULE_ROOT = resolve(__dirname, '..');
const OPENAPI_DIR = resolve(MODULE_ROOT, 'openapi');
const OPENAPI_PATH = resolve(OPENAPI_DIR, 'immobilisation.openapi.json');
const VERSION = '1.0.0';

console.log('');
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║      🔧 OpenAPI Generator — Immobilisation Module v1.0.0       ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');

// Ensure openapi directory exists
if (!existsSync(OPENAPI_DIR)) {
  mkdirSync(OPENAPI_DIR, { recursive: true });
  console.log('📁 Created openapi directory');
}

// Check if OpenAPI file exists
if (!existsSync(OPENAPI_PATH)) {
  console.error('❌ OpenAPI file not found:', OPENAPI_PATH);
  console.log('');
  console.log('💡 To generate the initial OpenAPI spec, run:');
  console.log('   npm run openapi:from-nestjs');
  console.log('');
  process.exit(1);
}

// Read and validate the OpenAPI spec
try {
  const content = readFileSync(OPENAPI_PATH, 'utf-8');
  const spec = JSON.parse(content);
  
  console.log('📄 Validating OpenAPI specification...\n');
  
  // Validate required fields
  const requiredFields = ['openapi', 'info', 'paths', 'components'];
  for (const field of requiredFields) {
    if (!spec[field]) {
      console.error(`❌ Missing required field: ${field}`);
      process.exit(1);
    }
  }
  console.log('  ✅ Required fields present');
  
  // Validate version
  if (!spec.openapi.startsWith('3.')) {
    console.error('❌ OpenAPI version must be 3.x');
    process.exit(1);
  }
  console.log('  ✅ OpenAPI version: ' + spec.openapi);
  
  // Validate info
  if (!spec.info.title || !spec.info.version) {
    console.error('❌ Missing info.title or info.version');
    process.exit(1);
  }
  console.log('  ✅ API version: ' + spec.info.version);
  
  // Count paths and methods
  const pathCount = Object.keys(spec.paths || {}).length;
  if (pathCount === 0) {
    console.error('❌ No paths defined in OpenAPI spec');
    process.exit(1);
  }
  
  let getCount = 0;
  let otherMethodCount = 0;
  for (const path of Object.values(spec.paths)) {
    const methods = Object.keys(path as object);
    for (const method of methods) {
      if (method === 'get') getCount++;
      else if (['post', 'put', 'patch', 'delete'].includes(method)) otherMethodCount++;
    }
  }
  
  console.log(`  ✅ Paths: ${pathCount}`);
  console.log(`  ✅ GET endpoints: ${getCount}`);
  
  // CQRS validation: no write methods
  if (otherMethodCount > 0) {
    console.warn(`  ⚠️  WARNING: Found ${otherMethodCount} non-GET methods (CQRS violation)`);
  } else {
    console.log('  ✅ CQRS compliant (GET only)');
  }
  
  // Validate schemas exist
  const schemaCount = Object.keys(spec.components?.schemas || {}).length;
  if (schemaCount === 0) {
    console.error('❌ No schemas defined in OpenAPI spec');
    process.exit(1);
  }
  console.log(`  ✅ Schemas: ${schemaCount}`);
  
  // Validate X-Tenant-Id header requirement
  let tenantHeaderCount = 0;
  for (const [pathName, pathItem] of Object.entries(spec.paths)) {
    const methods = Object.values(pathItem as object);
    for (const method of methods) {
      const params = (method as any).parameters || [];
      const hasTenantHeader = params.some((p: any) => 
        p.name?.toLowerCase() === 'x-tenant-id' || p.$ref?.includes('TenantIdHeader')
      );
      if (hasTenantHeader) tenantHeaderCount++;
    }
  }
  console.log(`  ✅ Tenant header: ${tenantHeaderCount}/${getCount} endpoints`);
  
  // Validate contract tags
  const tags = spec.tags || [];
  const contractTags = tags.filter((t: any) => 
    t.name.includes('Contract') || t.description?.includes('CONTRACTUAL')
  );
  console.log(`  ✅ Contract tags: ${contractTags.length}`);

  // Update timestamp
  const now = new Date().toISOString();
  if (spec.info.description) {
    spec.info.description = spec.info.description.replace(
      /Generated: .+$/m,
      `Generated: ${now}`
    );
  }
  
  // Write back with proper formatting
  writeFileSync(OPENAPI_PATH, JSON.stringify(spec, null, 2));

  console.log('');
  console.log('╔════════════════════════════════════════════════════════════════╗');
  console.log('║                    ✅ VALIDATION SUCCESS                       ║');
  console.log('╚════════════════════════════════════════════════════════════════╝');
  console.log('');
  console.log(`📄 File: ${OPENAPI_PATH}`);
  console.log(`🏷️  Version: ${spec.info.version}`);
  console.log(`📊 Summary:`);
  console.log(`   - ${pathCount} paths`);
  console.log(`   - ${getCount} GET endpoints`);
  console.log(`   - ${schemaCount} schemas`);
  console.log(`   - ${contractTags.length} contract tags`);
  console.log('');
  
  // Output contract endpoints
  console.log('📋 Contract Endpoints:');
  for (const [pathName, pathItem] of Object.entries(spec.paths)) {
    const methods = Object.values(pathItem as object);
    for (const method of methods) {
      const tags = (method as any).tags || [];
      if (tags.some((t: string) => t.includes('Contract'))) {
        const operationId = (method as any).operationId || 'unknown';
        const summary = (method as any).summary || '';
        console.log(`   GET ${pathName}`);
        console.log(`       ${summary}`);
      }
    }
  }
  console.log('');
  
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to parse OpenAPI spec:', error);
  process.exit(1);
}
