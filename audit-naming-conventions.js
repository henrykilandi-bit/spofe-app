#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

const projectRoot = path.resolve(__dirname);

// Conventions SPOFE v2.2
const conventions = {
  // Database forbidden terms
  dbForbiddenTerms: {
    'utilisateurs': 'users',
    'compagnie': 'company',
    'ecritures': 'entries',
    'groupes': 'groups',
    'compagnies': 'companies',
    'utilisateur': 'user',
    'entree': 'entry'
  },
  // File patterns
  filePatterns: {
    controller: /{entity}\.controller\.js$/,
    model: /{entity}\.model\.js$/,
    service: /{entity}\.service\.js$/,
    component: /^[A-Z][a-zA-Z]*\.jsx$/,
    hook: /^use[A-Z][a-zA-Z]*\.js$/,
    utils: /^[a-z][a-zA-Z]*\.js$/
  }
};

const report = {
  summary: {
    totalFiles: 0,
    conformeFiles: 0,
    nonConformeFiles: 0,
    conformityScore: '0%'
  },
  backend: {
    models: [],
    controllers: [],
    services: []
  },
  frontend: {
    components: [],
    hooks: [],
    utils: []
  },
  database: {
    tables: [],
    columns: [],
    errors: []
  },
  details: {
    backendFiles: [],
    frontendFiles: [],
    databaseSchema: []
  }
};

// Helper: Check if string is camelCase
function isCamelCase(str) {
  return /^[a-z][a-zA-Z0-9]*$/.test(str);
}

// Helper: Check if string is PascalCase
function isPascalCase(str) {
  return /^[A-Z][a-zA-Z0-9]*$/.test(str);
}

// Helper: Check if string is snake_case
function isSnakeCase(str) {
  return /^[a-z0-9_]+$/.test(str) && !str.includes('__');
}

// Helper: Check if string is UPPER_SNAKE_CASE
function isUpperSnakeCase(str) {
  return /^[A-Z0-9_]+$/.test(str) && !str.includes('__');
}

// Scanner: Backend Models
async function scanBackendModels() {
  const modelsDir = path.join(projectRoot, 'cascade/src/models');
  if (!fs.existsSync(modelsDir)) return;

  const files = fs.readdirSync(modelsDir);
  const violations = [];
  const valid = [];

  for (const file of files) {
    if (!file.endsWith('.js')) continue;

    const filePath = path.join(modelsDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check file naming pattern
    const entityMatch = file.match(/^(.+)\.model\.js$/);
    if (!entityMatch) {
      violations.push({
        file,
        type: 'FILENAME_PATTERN',
        issue: `Does not match pattern {entity}.model.js`,
        expected: `${file.replace(/\.js$/, '')}.model.js`
      });
      continue;
    }

    const entity = entityMatch[1];

    // Check exports
    const exportMatches = content.match(/module\.exports\s*=\s*([a-zA-Z_][a-zA-Z0-9_]*)/);
    if (exportMatches) {
      const exportName = exportMatches[1];
      if (!isPascalCase(exportName)) {
        violations.push({
          file,
          type: 'EXPORT_CASE',
          issue: `Export "${exportName}" is not PascalCase`,
          expected: `${exportName.charAt(0).toUpperCase() + exportName.slice(1)}`
        });
        continue;
      }
    }

    // Check forbidden terms in file name
    for (const [forbidden, actual] of Object.entries(conventions.dbForbiddenTerms)) {
      if (entity.toLowerCase().includes(forbidden) || entity.toLowerCase().includes(actual)) {
        violations.push({
          file,
          type: 'FORBIDDEN_TERM',
          issue: `Uses forbidden term "${forbidden}" or "${actual}"`,
          expected: 'Use OHADA compliant naming'
        });
      }
    }

    valid.push(file);
  }

  report.backend.models = violations;
  report.details.backendFiles.push({
    category: 'Models',
    valid: valid.length,
    violations: violations.length,
    files: { valid, violations: violations.map(v => v.file) }
  });

  return violations.length === 0;
}

// Scanner: Backend Controllers
async function scanBackendControllers() {
  const controllersDir = path.join(projectRoot, 'cascade/src/controllers');
  if (!fs.existsSync(controllersDir)) return;

  const files = fs.readdirSync(controllersDir);
  const violations = [];
  const valid = [];

  for (const file of files) {
    if (!file.endsWith('.js')) continue;

    const filePath = path.join(controllersDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check file naming pattern
    const entityMatch = file.match(/^(.+)\.controller\.js$/);
    if (!entityMatch) {
      violations.push({
        file,
        type: 'FILENAME_PATTERN',
        issue: `Does not match pattern {entity}.controller.js`,
        expected: `${file.replace(/\.js$/, '')}.controller.js`
      });
      continue;
    }

    // Check function names (should be camelCase)
    const funcMatches = content.matchAll(/(?:async\s+)?(?:const\s+)?([a-zA-Z_][a-zA-Z0-9_]*)\s*=\s*(?:async\s*)?\(/g);
    for (const match of funcMatches) {
      const funcName = match[1];
      if (funcName === 'module' || funcName === 'exports') continue;
      if (!isCamelCase(funcName) && !isPascalCase(funcName)) {
        violations.push({
          file,
          type: 'FUNCTION_CASE',
          issue: `Function "${funcName}" is not camelCase`,
          expected: `${funcName.charAt(0).toLowerCase() + funcName.slice(1)}`
        });
      }
    }

    valid.push(file);
  }

  report.backend.controllers = violations;
  report.details.backendFiles.push({
    category: 'Controllers',
    valid: valid.length,
    violations: violations.length,
    files: { valid, violations: violations.map(v => v.file) }
  });

  return violations.length === 0;
}

// Scanner: Backend Services
async function scanBackendServices() {
  const servicesDir = path.join(projectRoot, 'cascade/src/services');
  if (!fs.existsSync(servicesDir)) return;

  const files = fs.readdirSync(servicesDir);
  const violations = [];
  const valid = [];

  for (const file of files) {
    if (!file.endsWith('.js')) continue;

    const filePath = path.join(servicesDir, file);
    const content = fs.readFileSync(filePath, 'utf8');

    // Check file naming pattern
    const entityMatch = file.match(/^(.+)\.service\.js$/);
    if (!entityMatch) {
      violations.push({
        file,
        type: 'FILENAME_PATTERN',
        issue: `Does not match pattern {entity}.service.js`,
        expected: `${file.replace(/\.js$/, '')}.service.js`
      });
      continue;
    }

    valid.push(file);
  }

  report.backend.services = violations;
  report.details.backendFiles.push({
    category: 'Services',
    valid: valid.length,
    violations: violations.length,
    files: { valid, violations: violations.map(v => v.file) }
  });

  return violations.length === 0;
}

// Scanner: Frontend Components
async function scanFrontendComponents() {
  const componentsDir = path.join(projectRoot, 'frontend/src/components');
  if (!fs.existsSync(componentsDir)) return;

  const violations = [];
  const valid = [];

  function scanDir(dir) {
    const files = fs.readdirSync(dir);

    for (const file of files) {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      if (stat.isDirectory()) {
        scanDir(filePath);
      } else if (file.endsWith('.jsx')) {
        // Check naming: PascalCase
        const baseName = path.basename(file, '.jsx');
        if (!isPascalCase(baseName)) {
          violations.push({
            file: path.relative(componentsDir, filePath),
            type: 'COMPONENT_CASE',
            issue: `Component "${baseName}" is not PascalCase`,
            expected: `${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`
          });
        } else {
          valid.push(path.relative(componentsDir, filePath));
        }
      }
    }
  }

  scanDir(componentsDir);

  report.frontend.components = violations;
  report.details.frontendFiles.push({
    category: 'Components',
    valid: valid.length,
    violations: violations.length,
    files: { valid, violations: violations.map(v => v.file) }
  });

  return violations.length === 0;
}

// Scanner: Frontend Hooks
async function scanFrontendHooks() {
  const hooksDir = path.join(projectRoot, 'frontend/src/hooks');
  if (!fs.existsSync(hooksDir)) return;

  const files = fs.readdirSync(hooksDir);
  const violations = [];
  const valid = [];

  for (const file of files) {
    if (!file.endsWith('.js')) continue;

    const baseName = path.basename(file, '.js');

    // Check naming: use{Name}
    if (!baseName.match(/^use[A-Z][a-zA-Z0-9]*$/)) {
      violations.push({
        file,
        type: 'HOOK_PATTERN',
        issue: `Hook "${baseName}" does not match "use{Name}" pattern`,
        expected: `use${baseName.charAt(0).toUpperCase() + baseName.slice(1)}`
      });
    } else {
      valid.push(file);
    }
  }

  report.frontend.hooks = violations;
  report.details.frontendFiles.push({
    category: 'Hooks',
    valid: valid.length,
    violations: violations.length,
    files: { valid, violations: violations.map(v => v.file) }
  });

  return violations.length === 0;
}

// Scanner: Frontend Utils
async function scanFrontendUtils() {
  const utilsDir = path.join(projectRoot, 'frontend/src/utils');
  if (!fs.existsSync(utilsDir)) return;

  const files = fs.readdirSync(utilsDir);
  const violations = [];
  const valid = [];

  for (const file of files) {
    if (!file.endsWith('.js')) continue;

    const baseName = path.basename(file, '.js');

    // Check naming: camelCase
    if (!isCamelCase(baseName)) {
      violations.push({
        file,
        type: 'UTILS_CASE',
        issue: `Utility "${baseName}" is not camelCase`,
        expected: `${baseName.charAt(0).toLowerCase() + baseName.slice(1)}`
      });
    } else {
      valid.push(file);
    }
  }

  report.frontend.utils = violations;
  report.details.frontendFiles.push({
    category: 'Utils',
    valid: valid.length,
    violations: violations.length,
    files: { valid, violations: violations.map(v => v.file) }
  });

  return violations.length === 0;
}

// Scanner: Database
async function scanDatabase() {
  try {
    const connection = await mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '',
      database: 'spofe'
    });

    // Get all tables
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = 'spofe'
    `);

    const tableViolations = [];
    const columnViolations = [];
    const schemaDetails = [];

    for (const tableObj of tables) {
      const tableName = tableObj.TABLE_NAME;

      // Check table naming: snake_case, plural
      if (!isSnakeCase(tableName)) {
        tableViolations.push({
          name: tableName,
          type: 'TABLE_CASE',
          issue: `Table "${tableName}" is not snake_case`,
          expected: 'Use snake_case with plurals'
        });
      }

      // Check for forbidden terms
      for (const forbidden of Object.keys(conventions.dbForbiddenTerms)) {
        if (tableName.includes(forbidden)) {
          tableViolations.push({
            name: tableName,
            type: 'FORBIDDEN_TERM',
            issue: `Table contains forbidden term "${forbidden}"`,
            expected: 'Use OHADA compliant naming'
          });
        }
      }

      // Get columns
      const [columns] = await connection.execute(`
        SELECT COLUMN_NAME, DATA_TYPE, IS_NULLABLE, COLUMN_KEY 
        FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_SCHEMA = 'spofe' AND TABLE_NAME = ?
      `, [tableName]);

      const columnDetails = [];
      for (const col of columns) {
        const colName = col.COLUMN_NAME;

        // Check column naming: snake_case
        if (!isSnakeCase(colName)) {
          columnViolations.push({
            table: tableName,
            column: colName,
            type: 'COLUMN_CASE',
            issue: `Column "${colName}" is not snake_case`,
            expected: 'Use snake_case'
          });
        }

        // Check timestamps
        if (colName === 'createdAt' || colName === 'updatedAt' || colName === 'deletedAt') {
          columnViolations.push({
            table: tableName,
            column: colName,
            type: 'TIMESTAMP_CASE',
            issue: `Timestamp "${colName}" uses camelCase instead of snake_case`,
            expected: colName === 'createdAt' ? 'created_at' : colName === 'updatedAt' ? 'updated_at' : 'deleted_at'
          });
        }

        columnDetails.push({
          name: colName,
          type: col.DATA_TYPE,
          nullable: col.IS_NULLABLE,
          key: col.COLUMN_KEY
        });
      }

      schemaDetails.push({
        table: tableName,
        columns: columnDetails
      });
    }

    report.database.tables = tableViolations;
    report.database.columns = columnViolations;
    report.details.databaseSchema = schemaDetails;

    await connection.end();
    return tableViolations.length === 0 && columnViolations.length === 0;
  } catch (error) {
    report.database.errors.push({
      type: 'DATABASE_CONNECTION',
      message: error.message,
      hint: 'Make sure MySQL is running and database "spofe" exists'
    });
    return false;
  }
}

// Main execution
async function runAudit() {
  console.log('🔍 SPOFE v2.2 - AUDIT DE CONVENTIONS COMPLET\n');
  console.log('Scanning backend models...');
  await scanBackendModels();

  console.log('Scanning backend controllers...');
  await scanBackendControllers();

  console.log('Scanning backend services...');
  await scanBackendServices();

  console.log('Scanning frontend components...');
  await scanFrontendComponents();

  console.log('Scanning frontend hooks...');
  await scanFrontendHooks();

  console.log('Scanning frontend utils...');
  await scanFrontendUtils();

  console.log('Scanning database schema...');
  await scanDatabase();

  // Calculate summary
  const allViolations =
    report.backend.models.length +
    report.backend.controllers.length +
    report.backend.services.length +
    report.frontend.components.length +
    report.frontend.hooks.length +
    report.frontend.utils.length +
    report.database.tables.length +
    report.database.columns.length;

  const allDetails = report.details.backendFiles.concat(report.details.frontendFiles);
  const totalValid = allDetails.reduce((sum, cat) => sum + cat.valid, 0);
  const totalScanned = allDetails.reduce((sum, cat) => sum + cat.valid + cat.violations, 0);

  report.summary.totalFiles = totalScanned;
  report.summary.conformeFiles = totalValid;
  report.summary.nonConformeFiles = allViolations;
  report.summary.conformityScore = totalScanned > 0 ? `${Math.round((totalValid / totalScanned) * 100)}%` : '0%';

  // Output report
  const reportPath = path.join(projectRoot, 'AUDIT_NAMING_CONVENTIONS_REPORT.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

  console.log('\n✅ AUDIT COMPLETE\n');
  console.log('Summary:');
  console.log(`  Total Files Scanned: ${report.summary.totalFiles}`);
  console.log(`  Conforme Files: ${report.summary.conformeFiles}`);
  console.log(`  Non-Conforme Files: ${report.summary.nonConformeFiles}`);
  console.log(`  Conformity Score: ${report.summary.conformityScore}`);
  console.log(`\nReport saved to: ${reportPath}`);

  // Print violations summary
  if (allViolations > 0) {
    console.log('\n⚠️  VIOLATIONS FOUND:\n');

    if (report.backend.models.length > 0) {
      console.log(`Backend Models: ${report.backend.models.length} violations`);
      report.backend.models.slice(0, 3).forEach(v => console.log(`  - ${v.file}: ${v.issue}`));
    }

    if (report.backend.controllers.length > 0) {
      console.log(`Backend Controllers: ${report.backend.controllers.length} violations`);
      report.backend.controllers.slice(0, 3).forEach(v => console.log(`  - ${v.file}: ${v.issue}`));
    }

    if (report.backend.services.length > 0) {
      console.log(`Backend Services: ${report.backend.services.length} violations`);
      report.backend.services.slice(0, 3).forEach(v => console.log(`  - ${v.file}: ${v.issue}`));
    }

    if (report.frontend.components.length > 0) {
      console.log(`Frontend Components: ${report.frontend.components.length} violations`);
      report.frontend.components.slice(0, 3).forEach(v => console.log(`  - ${v.file}: ${v.issue}`));
    }

    if (report.frontend.hooks.length > 0) {
      console.log(`Frontend Hooks: ${report.frontend.hooks.length} violations`);
      report.frontend.hooks.slice(0, 3).forEach(v => console.log(`  - ${v.file}: ${v.issue}`));
    }

    if (report.frontend.utils.length > 0) {
      console.log(`Frontend Utils: ${report.frontend.utils.length} violations`);
      report.frontend.utils.slice(0, 3).forEach(v => console.log(`  - ${v.file}: ${v.issue}`));
    }

    if (report.database.tables.length > 0) {
      console.log(`Database Tables: ${report.database.tables.length} violations`);
      report.database.tables.slice(0, 3).forEach(v => console.log(`  - ${v.name}: ${v.issue}`));
    }

    if (report.database.columns.length > 0) {
      console.log(`Database Columns: ${report.database.columns.length} violations`);
      report.database.columns.slice(0, 3).forEach(v => console.log(`  - ${v.table}.${v.column}: ${v.issue}`));
    }

    if (report.database.errors.length > 0) {
      console.log(`Database Errors: ${report.database.errors.length}`);
      report.database.errors.forEach(e => console.log(`  - ${e.type}: ${e.message}`));
    }
  } else {
    console.log('\n✅ ALL CONVENTIONS COMPLIANT!');
  }
}

runAudit().catch(console.error);
