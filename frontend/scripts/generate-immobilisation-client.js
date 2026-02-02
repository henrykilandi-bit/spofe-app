/**
 * Immobilisation API Client Generator
 * 
 * Generates the frontend API client from OpenAPI specification.
 * This script creates type-safe services from the Immobilisation OpenAPI contract.
 * 
 * Usage:
 *   node scripts/generate-immobilisation-client.js
 *   npm run api:generate:immobilisation
 * 
 * ⚠️ RÈGLES SPOFE:
 * ✅ Génère les types TypeScript depuis OpenAPI
 * ✅ Client fetch-based, zero axios
 * ❌ Modification manuelle interdite
 * ✅ OpenAPI = source de vérité unique
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

const OPENAPI_SOURCE = path.resolve(ROOT, '../cascade/modules/immobilisation/openapi/immobilisation.openapi.json');
const OUTPUT_DIR = path.resolve(ROOT, 'src/api/immobilisation');
const GENERATED_MARKER = '⚠️ AUTO-GENERATED FROM OPENAPI — DO NOT EDIT MANUALLY';

console.log('🔧 Immobilisation API Client Generator\n');

// Check if OpenAPI spec exists
if (!fs.existsSync(OPENAPI_SOURCE)) {
  console.error(`❌ OpenAPI specification not found: ${OPENAPI_SOURCE}`);
  console.error('   Run "npm run openapi:generate" in the immobilisation module first.');
  process.exit(1);
}

// Read OpenAPI spec
const openapi = JSON.parse(fs.readFileSync(OPENAPI_SOURCE, 'utf-8'));

console.log(`📄 Source: ${OPENAPI_SOURCE}`);
console.log(`📁 Output: ${OUTPUT_DIR}`);
console.log(`📊 OpenAPI Version: ${openapi.info.version}`);
console.log(`   Paths: ${Object.keys(openapi.paths || {}).length}`);
console.log(`   Schemas: ${Object.keys(openapi.components?.schemas || {}).length}`);

// Create output directory if it doesn't exist
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// ═══════════════════════════════════════════════════════════════════════════
// TYPE GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function generateTypes(schemas) {
  const lines = [
    '/**',
    ` * ${GENERATED_MARKER}`,
    ' * ',
    ' * Immobilisation API Types',
    ' * Generated from: cascade/modules/immobilisation/openapi/immobilisation.openapi.json',
    ` * Version: ${openapi.info.version}`,
    ` * Generated: ${new Date().toISOString()}`,
    ' */',
    '',
  ];
  
  for (const [name, schema] of Object.entries(schemas)) {
    lines.push(generateTypeInterface(name, schema, schemas));
    lines.push('');
  }
  
  return lines.join('\n');
}

function generateTypeInterface(name, schema, allSchemas) {
  const lines = [];
  
  // JSDoc comment
  if (schema.description) {
    lines.push('/**');
    lines.push(` * ${schema.description}`);
    lines.push(' */');
  }
  
  // Handle allOf (composition)
  if (schema.allOf) {
    const properties = {};
    const required = [];
    
    for (const part of schema.allOf) {
      if (part.$ref) {
        const refName = part.$ref.split('/').pop();
        lines.push(`export interface ${name} extends ${refName} {}`);
        return lines.join('\n');
      }
      if (part.properties) {
        Object.assign(properties, part.properties);
      }
      if (part.required) {
        required.push(...part.required);
      }
    }
    
    lines.push(`export interface ${name} {`);
    for (const [propName, propSchema] of Object.entries(properties)) {
      const optional = !required.includes(propName) ? '?' : '';
      lines.push(`  ${propName}${optional}: ${schemaToType(propSchema, allSchemas)};`);
    }
    lines.push('}');
    return lines.join('\n');
  }
  
  // Handle enum
  if (schema.enum) {
    lines.push(`export type ${name} = ${schema.enum.map(v => `'${v}'`).join(' | ')};`);
    return lines.join('\n');
  }
  
  // Handle object
  if (schema.type === 'object' || schema.properties) {
    lines.push(`export interface ${name} {`);
    
    const required = schema.required || [];
    for (const [propName, propSchema] of Object.entries(schema.properties || {})) {
      const optional = !required.includes(propName) ? '?' : '';
      const propType = schemaToType(propSchema, allSchemas);
      
      if (propSchema.description) {
        lines.push(`  /** ${propSchema.description} */`);
      }
      lines.push(`  ${propName}${optional}: ${propType};`);
    }
    
    lines.push('}');
    return lines.join('\n');
  }
  
  // Handle array type alias
  if (schema.type === 'array') {
    lines.push(`export type ${name} = ${schemaToType(schema, allSchemas)};`);
    return lines.join('\n');
  }
  
  // Handle simple type alias
  lines.push(`export type ${name} = ${schemaToType(schema, allSchemas)};`);
  return lines.join('\n');
}

function schemaToType(schema, allSchemas) {
  if (!schema) return 'unknown';
  
  // Handle $ref
  if (schema.$ref) {
    return schema.$ref.split('/').pop();
  }
  
  // Handle nullable
  const nullable = schema.nullable ? ' | null' : '';
  
  // Handle enum
  if (schema.enum) {
    return schema.enum.map(v => typeof v === 'string' ? `'${v}'` : v).join(' | ') + nullable;
  }
  
  // Handle array
  if (schema.type === 'array') {
    const itemType = schemaToType(schema.items, allSchemas);
    return `${itemType}[]${nullable}`;
  }
  
  // Handle object with properties
  if (schema.type === 'object' && schema.properties) {
    const props = Object.entries(schema.properties)
      .map(([k, v]) => `${k}: ${schemaToType(v, allSchemas)}`)
      .join('; ');
    return `{ ${props} }${nullable}`;
  }
  
  // Handle basic types
  switch (schema.type) {
    case 'string':
      return 'string' + nullable;
    case 'number':
    case 'integer':
      return 'number' + nullable;
    case 'boolean':
      return 'boolean' + nullable;
    case 'object':
      return 'Record<string, unknown>' + nullable;
    default:
      return 'unknown' + nullable;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SERVICE GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function generateServices(paths) {
  const lines = [
    '/**',
    ` * ${GENERATED_MARKER}`,
    ' * ',
    ' * Immobilisation API Services',
    ' * Generated from: cascade/modules/immobilisation/openapi/immobilisation.openapi.json',
    ` * Version: ${openapi.info.version}`,
    ` * Generated: ${new Date().toISOString()}`,
    ' */',
    '',
    "import * as Types from './types';",
    '',
    '// Base configuration',
    "const API_BASE = import.meta.env.VITE_API_URL || '/api';",
    '',
    '/**',
    ' * HTTP client with contract enforcement',
    ' */',
    'async function contractFetch<T>(path: string, options: RequestInit = {}): Promise<T> {',
    "  const url = `${API_BASE}${path}`;",
    '  ',
    '  const response = await fetch(url, {',
    '    ...options,',
    '    headers: {',
    "      'Content-Type': 'application/json',",
    "      'Accept': 'application/json',",
    '      ...options.headers,',
    '    },',
    '  });',
    '  ',
    '  if (!response.ok) {',
    '    const error = await response.json().catch(() => ({ message: response.statusText }));',
    '    throw new ContractError(response.status, error.message || response.statusText, path);',
    '  }',
    '  ',
    '  return response.json();',
    '}',
    '',
    '/**',
    ' * Contract Error — Thrown when API call fails',
    ' */',
    'export class ContractError extends Error {',
    '  constructor(',
    '    public readonly status: number,',
    '    message: string,',
    '    public readonly endpoint: string,',
    '  ) {',
    '    super(`[CONTRACT ERROR] ${status} ${message} (${endpoint})`);',
    "    this.name = 'ContractError';",
    '  }',
    '}',
    '',
  ];
  
  // Group operations by tag
  const operations = extractOperations(paths);
  
  // Generate ImmobilisationService
  lines.push('/**');
  lines.push(' * Immobilisation Service — Contract-Enforced API Client');
  lines.push(' * ');
  lines.push(' * ⚠️ RÈGLES SPOFE:');
  lines.push(' * ✅ Types générés depuis OpenAPI');
  lines.push(' * ✅ Aucun mock autorisé');
  lines.push(' * ❌ Modification manuelle interdite');
  lines.push(' */');
  lines.push('export const ImmobilisationService = {');
  
  for (const op of operations) {
    lines.push(generateServiceMethod(op));
  }
  
  lines.push('};');
  lines.push('');
  lines.push('export default ImmobilisationService;');
  
  return lines.join('\n');
}

function extractOperations(paths) {
  const ops = [];
  
  for (const [pathTemplate, pathItem] of Object.entries(paths)) {
    for (const [method, operation] of Object.entries(pathItem)) {
      if (['get', 'post', 'put', 'delete', 'patch'].includes(method)) {
        ops.push({
          method,
          path: pathTemplate,
          operationId: operation.operationId,
          summary: operation.summary,
          description: operation.description,
          parameters: operation.parameters || [],
          responses: operation.responses,
          tags: operation.tags || [],
        });
      }
    }
  }
  
  return ops;
}

function generateServiceMethod(op) {
  const lines = [];
  const methodName = operationIdToMethodName(op.operationId);
  
  // Extract parameters
  const pathParams = op.parameters.filter(p => p.in === 'path');
  const queryParams = op.parameters.filter(p => p.in === 'query');
  const headerParams = op.parameters.filter(p => p.in === 'header' && p.name !== 'X-Tenant-Id');
  
  // Build function signature
  const params = [];
  
  // Path parameters
  for (const p of pathParams) {
    params.push(`${p.name}: string`);
  }
  
  // Query parameters as options object
  if (queryParams.length > 0) {
    const queryType = queryParams
      .map(p => {
        const optional = !p.required ? '?' : '';
        const type = p.schema?.type === 'integer' ? 'number' : p.schema?.type || 'string';
        return `${p.name}${optional}: ${type}`;
      })
      .join('; ');
    params.push(`params?: { ${queryType} }`);
  }
  
  // Headers (tenantId always required)
  params.push('headers: { tenantId: string; token: string }');
  
  // Determine response type
  const successResponse = op.responses['200'] || op.responses['201'];
  const responseSchema = successResponse?.content?.['application/json']?.schema;
  let responseType = 'void';
  
  if (responseSchema) {
    if (responseSchema.$ref) {
      responseType = `Types.${responseSchema.$ref.split('/').pop()}`;
    } else {
      responseType = 'unknown';
    }
  }
  
  // Generate JSDoc
  lines.push('');
  lines.push('  /**');
  lines.push(`   * ${op.summary || op.operationId}`);
  if (op.description) {
    lines.push(`   * ${op.description.split('\n')[0]}`);
  }
  lines.push('   */');
  
  // Generate method
  lines.push(`  async ${methodName}(${params.join(', ')}): Promise<${responseType}> {`);
  
  // Build URL with path parameters
  let urlExpr = `'${op.path}'`;
  for (const p of pathParams) {
    urlExpr = urlExpr.replace(`{${p.name}}`, `\${${p.name}}`);
  }
  
  // Add query parameters
  if (queryParams.length > 0) {
    lines.push('    const searchParams = new URLSearchParams();');
    lines.push('    if (params) {');
    for (const p of queryParams) {
      lines.push(`      if (params.${p.name} !== undefined) searchParams.set('${p.name}', String(params.${p.name}));`);
    }
    lines.push('    }');
    lines.push(`    const queryString = searchParams.toString();`);
    lines.push(`    const url = \`${urlExpr}\${queryString ? '?' + queryString : ''}\`;`);
  } else {
    lines.push(`    const url = \`${urlExpr}\`;`);
  }
  
  // Fetch call
  lines.push(`    return contractFetch<${responseType}>(url, {`);
  lines.push(`      method: '${op.method.toUpperCase()}',`);
  lines.push('      headers: {');
  lines.push("        'Authorization': `Bearer ${headers.token}`,");
  lines.push("        'X-Tenant-Id': headers.tenantId,");
  lines.push('      },');
  lines.push('    });');
  lines.push('  },');
  
  return lines.join('\n');
}

function operationIdToMethodName(operationId) {
  if (!operationId) return 'unknownMethod';
  
  // Remove module prefix (e.g., "Immobilisation_listAssets" -> "listAssets")
  const withoutPrefix = operationId.replace(/^[A-Z][a-z]+_/, '');
  
  // Convert to camelCase
  return withoutPrefix.charAt(0).toLowerCase() + withoutPrefix.slice(1);
}

// ═══════════════════════════════════════════════════════════════════════════
// HOOKS GENERATION
// ═══════════════════════════════════════════════════════════════════════════

function generateHooks(paths) {
  const operations = extractOperations(paths);
  
  const lines = [
    '/**',
    ` * ${GENERATED_MARKER}`,
    ' * ',
    ' * Immobilisation API React Hooks',
    ' * Generated from: cascade/modules/immobilisation/openapi/immobilisation.openapi.json',
    ` * Version: ${openapi.info.version}`,
    ` * Generated: ${new Date().toISOString()}`,
    ' */',
    '',
    "import { useQuery, useMutation } from '@tanstack/react-query';",
    "import { ImmobilisationService } from './index';",
    "import type * as Types from './types';",
    '',
    '// Re-export types for convenience',
    "export type { Types };",
    '',
  ];
  
  // Generate hooks for GET operations
  for (const op of operations.filter(o => o.method === 'get')) {
    lines.push(generateQueryHook(op));
  }
  
  return lines.join('\n');
}

function generateQueryHook(op) {
  const methodName = operationIdToMethodName(op.operationId);
  const hookName = `use${methodName.charAt(0).toUpperCase() + methodName.slice(1)}`;
  
  const pathParams = op.parameters.filter(p => p.in === 'path');
  const queryParams = op.parameters.filter(p => p.in === 'query');
  
  const lines = [];
  
  lines.push('/**');
  lines.push(` * ${op.summary || op.operationId}`);
  lines.push(' */');
  
  // Build params
  const hookParams = ['tenantId: string', 'token: string'];
  for (const p of pathParams) {
    hookParams.push(`${p.name}: string`);
  }
  if (queryParams.length > 0) {
    hookParams.push(`params?: Parameters<typeof ImmobilisationService.${methodName}>[${pathParams.length}]`);
  }
  
  lines.push(`export function ${hookName}(${hookParams.join(', ')}) {`);
  lines.push('  return useQuery({');
  
  // Build query key
  const keyParts = [`'immobilisation'`, `'${methodName}'`];
  for (const p of pathParams) {
    keyParts.push(p.name);
  }
  if (queryParams.length > 0) {
    keyParts.push('params');
  }
  
  lines.push(`    queryKey: [${keyParts.join(', ')}],`);
  
  // Build query function
  const callArgs = [];
  for (const p of pathParams) {
    callArgs.push(p.name);
  }
  if (queryParams.length > 0) {
    callArgs.push('params');
  }
  callArgs.push('{ tenantId, token }');
  
  lines.push(`    queryFn: () => ImmobilisationService.${methodName}(${callArgs.join(', ')}),`);
  lines.push('  });');
  lines.push('}');
  lines.push('');
  
  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN GENERATION
// ═══════════════════════════════════════════════════════════════════════════

try {
  // Generate types
  const typesContent = generateTypes(openapi.components?.schemas || {});
  fs.writeFileSync(path.join(OUTPUT_DIR, 'types.d.ts'), typesContent);
  console.log('  ✓ types.d.ts');
  
  // Generate services
  const servicesContent = generateServices(openapi.paths || {});
  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.ts'), servicesContent);
  console.log('  ✓ index.ts');
  
  // Generate hooks
  const hooksContent = generateHooks(openapi.paths || {});
  fs.writeFileSync(path.join(OUTPUT_DIR, 'hooks.ts'), hooksContent);
  console.log('  ✓ hooks.ts');
  
  // Create version file
  const versionInfo = {
    version: openapi.info.version,
    generatedAt: new Date().toISOString(),
    source: 'cascade/modules/immobilisation/openapi/immobilisation.openapi.json',
    paths: Object.keys(openapi.paths || {}).length,
    schemas: Object.keys(openapi.components?.schemas || {}).length,
  };
  fs.writeFileSync(path.join(OUTPUT_DIR, 'version.json'), JSON.stringify(versionInfo, null, 2));
  console.log('  ✓ version.json');
  
  console.log('\n✅ Immobilisation API client generated successfully!');
  console.log(`   Version: ${versionInfo.version}`);
  console.log(`   Paths: ${versionInfo.paths}`);
  console.log(`   Schemas: ${versionInfo.schemas}`);
} catch (error) {
  console.error('\n❌ Generation failed:', error.message);
  process.exit(1);
}
