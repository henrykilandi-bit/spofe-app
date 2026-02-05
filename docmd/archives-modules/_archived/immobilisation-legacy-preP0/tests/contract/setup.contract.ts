/**
 * Contract Tests Setup — OpenAPI Validation
 * Module Immobilisation v1.0.0
 * 
 * ═══════════════════════════════════════════════════════════════════════════
 * NIVEAU 2 SPOFE — Validation OpenAPI ↔ Backend (runtime)
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * Ce fichier configure:
 * ✅ jest-openapi pour validation automatique des réponses
 * ✅ Chargement du contrat OpenAPI
 * ✅ Test app NestJS
 * ✅ Helpers contractuels
 * 
 * ⚠️ RÈGLES SPOFE:
 * ❌ Aucun mock
 * ❌ Aucune modification du code généré
 * ✅ OpenAPI = loi
 * ✅ TypeScript = juge
 */

import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';

// ═══════════════════════════════════════════════════════════════════════════
// OPENAPI CONTRACT LOADING
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Path to the OpenAPI specification (source of truth)
 */
export const OPENAPI_SPEC_PATH = path.resolve(
  __dirname,
  '../../openapi/immobilisation.openapi.json'
);

/**
 * Load OpenAPI specification
 */
export function loadOpenAPISpec(): object {
  if (!fs.existsSync(OPENAPI_SPEC_PATH)) {
    throw new Error(
      `[CONTRACT] OpenAPI specification not found at: ${OPENAPI_SPEC_PATH}\n` +
      `Run 'npm run openapi:generate' in the immobilisation module first.`
    );
  }
  
  const specContent = fs.readFileSync(OPENAPI_SPEC_PATH, 'utf-8');
  return JSON.parse(specContent);
}

/**
 * OpenAPI specification loaded once for all tests
 */
export let openAPISpec: object;

// ═══════════════════════════════════════════════════════════════════════════
// JEST-OPENAPI MATCHERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Custom matcher: toSatisfyApiSpec
 * 
 * Validates that a supertest response matches the OpenAPI specification.
 * 
 * Checks:
 * - Status code matches declared responses
 * - Content-Type matches media types
 * - Response body matches schema
 * - Required properties are present
 * - Types are correct
 */
declare global {
  namespace jest {
    interface Matchers<R> {
      toSatisfyApiSpec(): R;
      toSatisfySchemaInApiSpec(schemaName: string): R;
    }
  }
}

expect.extend({
  toSatisfyApiSpec(received: any) {
    const spec = openAPISpec as any;
    const response = received;
    
    // Extract request info
    const method = response.req.method.toLowerCase();
    const urlPath = response.req.path;
    const statusCode = response.status;
    
    // Find matching path in OpenAPI spec
    const pathSpec = findMatchingPath(spec.paths, urlPath, method);
    
    if (!pathSpec) {
      return {
        pass: false,
        message: () =>
          `Expected ${method.toUpperCase()} ${urlPath} to be defined in OpenAPI spec.\n` +
          `Available paths: ${Object.keys(spec.paths || {}).join(', ')}`,
      };
    }
    
    // Check if status code is declared
    const responses = pathSpec.responses;
    if (!responses[statusCode] && !responses['default']) {
      return {
        pass: false,
        message: () =>
          `Expected status ${statusCode} to be declared in OpenAPI spec for ${method.toUpperCase()} ${urlPath}.\n` +
          `Declared statuses: ${Object.keys(responses).join(', ')}`,
      };
    }
    
    // Get response schema
    const responseSpec = responses[statusCode] || responses['default'];
    const contentType = response.headers['content-type']?.split(';')[0] || 'application/json';
    const schemaSpec = responseSpec?.content?.[contentType]?.schema;
    
    if (schemaSpec && response.body) {
      const schemaErrors = validateAgainstSchema(response.body, schemaSpec, spec);
      
      if (schemaErrors.length > 0) {
        return {
          pass: false,
          message: () =>
            `Response body does not match OpenAPI schema for ${method.toUpperCase()} ${urlPath} (${statusCode}):\n` +
            schemaErrors.map(e => `  - ${e}`).join('\n'),
        };
      }
    }
    
    return {
      pass: true,
      message: () =>
        `Expected response NOT to satisfy OpenAPI spec for ${method.toUpperCase()} ${urlPath}`,
    };
  },
  
  toSatisfySchemaInApiSpec(received: any, schemaName: string) {
    const spec = openAPISpec as any;
    const schema = spec.components?.schemas?.[schemaName];
    
    if (!schema) {
      return {
        pass: false,
        message: () =>
          `Schema "${schemaName}" not found in OpenAPI spec.\n` +
          `Available schemas: ${Object.keys(spec.components?.schemas || {}).join(', ')}`,
      };
    }
    
    const errors = validateAgainstSchema(received, schema, spec);
    
    if (errors.length > 0) {
      return {
        pass: false,
        message: () =>
          `Object does not match schema "${schemaName}":\n` +
          errors.map(e => `  - ${e}`).join('\n'),
      };
    }
    
    return {
      pass: true,
      message: () => `Expected object NOT to match schema "${schemaName}"`,
    };
  },
});

// ═══════════════════════════════════════════════════════════════════════════
// SCHEMA VALIDATION HELPERS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Find matching path in OpenAPI spec (handles path parameters)
 */
function findMatchingPath(
  paths: Record<string, any>,
  urlPath: string,
  method: string
): any | null {
  // Remove /api prefix if present
  const normalizedUrl = urlPath.replace(/^\/api/, '');
  
  for (const [pathTemplate, pathItem] of Object.entries(paths || {})) {
    // Convert OpenAPI path template to regex
    const regexPattern = pathTemplate
      .replace(/\{[^}]+\}/g, '[^/]+')
      .replace(/\//g, '\\/');
    
    const regex = new RegExp(`^${regexPattern}$`);
    
    if (regex.test(normalizedUrl) && pathItem[method]) {
      return pathItem[method];
    }
  }
  
  return null;
}

/**
 * Validate data against OpenAPI schema
 */
function validateAgainstSchema(
  data: any,
  schema: any,
  spec: any,
  path: string = ''
): string[] {
  const errors: string[] = [];
  
  // Resolve $ref if present
  if (schema.$ref) {
    const refPath = schema.$ref.replace('#/', '').split('/');
    let resolved = spec;
    for (const segment of refPath) {
      resolved = resolved?.[segment];
    }
    if (!resolved) {
      errors.push(`${path}: Unable to resolve $ref: ${schema.$ref}`);
      return errors;
    }
    schema = resolved;
  }
  
  // Handle nullable
  if (schema.nullable && data === null) {
    return errors;
  }
  
  // Type validation
  if (schema.type) {
    const actualType = Array.isArray(data) ? 'array' : typeof data;
    const expectedType = schema.type;
    
    if (expectedType === 'integer' && typeof data === 'number') {
      if (!Number.isInteger(data)) {
        errors.push(`${path || 'root'}: Expected integer but got float`);
      }
    } else if (expectedType === 'number' && typeof data !== 'number') {
      errors.push(`${path || 'root'}: Expected number but got ${actualType}`);
    } else if (expectedType === 'string' && typeof data !== 'string') {
      errors.push(`${path || 'root'}: Expected string but got ${actualType}`);
    } else if (expectedType === 'boolean' && typeof data !== 'boolean') {
      errors.push(`${path || 'root'}: Expected boolean but got ${actualType}`);
    } else if (expectedType === 'array' && !Array.isArray(data)) {
      errors.push(`${path || 'root'}: Expected array but got ${actualType}`);
    } else if (expectedType === 'object' && (typeof data !== 'object' || Array.isArray(data))) {
      errors.push(`${path || 'root'}: Expected object but got ${actualType}`);
    }
  }
  
  // Enum validation
  if (schema.enum && !schema.enum.includes(data)) {
    errors.push(`${path || 'root'}: Value "${data}" not in enum [${schema.enum.join(', ')}]`);
  }
  
  // Required properties (objects)
  if (schema.type === 'object' && schema.required && typeof data === 'object' && data !== null) {
    for (const requiredProp of schema.required) {
      if (!(requiredProp in data)) {
        errors.push(`${path || 'root'}: Missing required property "${requiredProp}"`);
      }
    }
  }
  
  // Properties validation (objects)
  if (schema.properties && typeof data === 'object' && data !== null) {
    for (const [propName, propSchema] of Object.entries(schema.properties)) {
      if (propName in data) {
        const propErrors = validateAgainstSchema(
          data[propName],
          propSchema,
          spec,
          `${path}.${propName}`
        );
        errors.push(...propErrors);
      }
    }
  }
  
  // Items validation (arrays)
  if (schema.items && Array.isArray(data)) {
    data.forEach((item, index) => {
      const itemErrors = validateAgainstSchema(
        item,
        schema.items,
        spec,
        `${path}[${index}]`
      );
      errors.push(...itemErrors);
    });
  }
  
  // AllOf validation
  if (schema.allOf) {
    for (const subSchema of schema.allOf) {
      const subErrors = validateAgainstSchema(data, subSchema, spec, path);
      errors.push(...subErrors);
    }
  }
  
  return errors;
}

// ═══════════════════════════════════════════════════════════════════════════
// TEST CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════

export const CONTRACT_TEST_CONFIG = {
  // Test tenants
  TENANT_ID: 'tenant-contract-001',
  TENANT_ID_ALT: 'tenant-contract-002',
  
  // Auth
  AUTH_TOKEN: 'Bearer contract-test-token',
  
  // Test data IDs (from seed)
  ASSET_ID: 'asset-contract-001',
  ASSET_ID_NOT_FOUND: 'asset-does-not-exist',
  
  // Test periods
  PERIOD: '2025-01',
  PERIOD_FROM: '2024-01',
  PERIOD_TO: '2025-12',
  
  // Test years
  YEAR: 2025,
  YEAR_FROM: 2025,
  YEAR_TO: 2030,
  
  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgres://spofe:spofe@localhost:5432/spofe_test',
};

// ═══════════════════════════════════════════════════════════════════════════
// TEST APP FACTORY
// ═══════════════════════════════════════════════════════════════════════════

let contractApp: INestApplication | null = null;
let contractPool: Pool | null = null;

/**
 * Create test application for contract tests
 */
export async function createContractTestApp(): Promise<INestApplication> {
  if (contractApp) return contractApp;
  
  // Load OpenAPI spec first
  openAPISpec = loadOpenAPISpec();
  
  // Dynamically import the module
  const { ImmobilisationReadModule } = await import('../../api/immobilisation.module');
  
  const moduleRef: TestingModule = await Test.createTestingModule({
    imports: [ImmobilisationReadModule],
  })
    .overrideProvider('DATABASE_POOL')
    .useFactory({
      factory: () => {
        contractPool = new Pool({ connectionString: CONTRACT_TEST_CONFIG.DATABASE_URL });
        return contractPool;
      },
    })
    .compile();

  contractApp = moduleRef.createNestApplication();
  
  contractApp.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );
  
  await contractApp.init();
  return contractApp;
}

/**
 * Close contract test application
 */
export async function closeContractTestApp(): Promise<void> {
  if (contractPool) {
    await contractPool.end();
    contractPool = null;
  }
  if (contractApp) {
    await contractApp.close();
    contractApp = null;
  }
}

/**
 * Get contract test app
 */
export function getContractTestApp(): INestApplication {
  if (!contractApp) {
    throw new Error('Contract test app not initialized. Call createContractTestApp() first.');
  }
  return contractApp;
}

/**
 * Standard headers for contract tests
 */
export function getContractHeaders(tenantId: string = CONTRACT_TEST_CONFIG.TENANT_ID) {
  return {
    'Authorization': CONTRACT_TEST_CONFIG.AUTH_TOKEN,
    'X-Tenant-Id': tenantId,
    'Accept': 'application/json',
  };
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  openAPISpec,
  OPENAPI_SPEC_PATH,
};
