/**
 * OpenAPI Generator from NestJS Controllers — Immobilisation Module
 * Version: 1.0.0
 * 
 * Ce script génère automatiquement l'OpenAPI depuis les controllers NestJS
 * en utilisant @nestjs/swagger.
 * 
 * ⚠️ RÈGLES CONTRACTUELLES SPOFE:
 * ✅ DTOs = source unique de vérité
 * ✅ Controllers = définition des routes
 * ✅ OpenAPI = artefact généré
 * 
 * Usage:
 *   npx tsx scripts/generate-openapi-from-nestjs.ts
 *   npm run openapi:from-nestjs
 */

import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const MODULE_ROOT = resolve(__dirname, '..');
const OPENAPI_DIR = resolve(MODULE_ROOT, 'openapi');
const OPENAPI_PATH = resolve(OPENAPI_DIR, 'immobilisation.openapi.json');

console.log('');
console.log('╔════════════════════════════════════════════════════════════════╗');
console.log('║   🚀 OpenAPI from NestJS — Immobilisation Module v1.0.0        ║');
console.log('╚════════════════════════════════════════════════════════════════╝');
console.log('');
console.log('📋 This script should be run from the NestJS application context.');
console.log('');
console.log('💡 Usage in main.ts:');
console.log('');
console.log(`
import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { writeFileSync } from 'fs';
import { ImmobilisationReadModule } from './cascade/modules/immobilisation/api';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Swagger configuration for Immobilisation
  const immobilisationConfig = new DocumentBuilder()
    .setTitle('SPOFE — Immobilisation API')
    .setDescription(\`
## Contractual API — Immobilisation Module v1.0.0

### Overview
This API exposes the Immobilisation (Fixed Assets) module for asset management,
depreciation tracking, maintenance, and renewals.
It follows the **CQRS Read-Only** architecture pattern.

### Contracts
- **IMM-CS-DEP-01**: Cost-Structure - Depreciation summary per period
- **IMM-CS-DEP-02**: Cost-Structure - Depreciation export with allocations
- **IMM-CS-ALL-01**: Cost-Structure - Effective allocations
- **IMM-CS-MNT-01**: Cost-Structure - Maintenance summary per asset
- **IMM-CS-MNT-02**: Cost-Structure - Maintenance by period
- **IMM-BUD-REN-01**: Budget - Renewal projections
- **IMM-BUD-REN-02**: Budget - Renewals by year
- **IMM-BUD-MNT-01**: Budget - Maintenance costs (OPEX)
- **IMM-BUD-DEP-01**: Budget - Depreciation summary

### Multi-Tenant
All endpoints require the \\\`X-Tenant-Id\\\` header for tenant isolation.

### Architecture
- ✅ GET endpoints only (read-only)
- ✅ 1 endpoint = 1 read-model SQL
- ✅ Zero business logic in controllers
- ✅ Zero Guardian validation on read
\`)
    .setVersion('1.0.0')
    .addBearerAuth()
    .addApiKey(
      { type: 'apiKey', name: 'X-Tenant-Id', in: 'header' },
      'tenant'
    )
    .addTag('Immobilisation — Assets', 'Asset listing, details, and net book values')
    .addTag('Immobilisation — Depreciation', 'Depreciation history and summaries')
    .addTag('Immobilisation — Cost-Structure Contract', 'Endpoints for Cost-Structure module consumption (IMM-CS-*)')
    .addTag('Immobilisation — Budget Contract', 'Endpoints for Budget module consumption (IMM-BUD-*)')
    .addTag('Immobilisation — Maintenance', 'Maintenance history and costs')
    .addTag('Immobilisation — Renewals', 'Renewal projections for CAPEX planning')
    .addTag('Immobilisation — Disposals', 'Disposal and scrap history')
    .addTag('Immobilisation — KPI', 'Dashboard KPIs')
    .build();

  const immobilisationDocument = SwaggerModule.createDocument(app, immobilisationConfig, {
    include: [ImmobilisationReadModule],
  });
  
  // Setup Swagger UI
  SwaggerModule.setup('docs/immobilisation', app, immobilisationDocument);
  
  // Export to file
  writeFileSync(
    'cascade/modules/immobilisation/openapi/immobilisation.openapi.json',
    JSON.stringify(immobilisationDocument, null, 2)
  );
  
  console.log('✅ OpenAPI exported to cascade/modules/immobilisation/openapi/immobilisation.openapi.json');
  
  await app.listen(3000);
}

bootstrap();
`);
console.log('');
console.log('📁 Or run this standalone to validate the existing spec:');
console.log('   npx tsx scripts/generate-openapi.ts');
console.log('');

// Check if we're being run as a module check
if (process.argv.includes('--check')) {
  console.log('🔍 Checking module structure...');
  
  const requiredFiles = [
    'api/dto/response.dto.ts',
    'api/dto/query.dto.ts',
    'api/controllers/immobilisation-read.controller.ts',
    'api/controllers/immobilisation-cost-structure.controller.ts',
    'api/controllers/immobilisation-budget.controller.ts',
    'api/immobilisation.module.ts',
  ];
  
  let allPresent = true;
  for (const file of requiredFiles) {
    const filePath = resolve(MODULE_ROOT, file);
    const exists = existsSync(filePath);
    console.log(`  ${exists ? '✅' : '❌'} ${file}`);
    if (!exists) allPresent = false;
  }
  
  if (allPresent) {
    console.log('');
    console.log('✅ All required files present');
    console.log('✅ Module is ready for OpenAPI generation');
  } else {
    console.log('');
    console.log('❌ Some required files are missing');
    process.exit(1);
  }
}
