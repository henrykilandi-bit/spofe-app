#!/usr/bin/env node

/**
 * TASK 3: INTEGRATION SCRIPT
 * Automatically integrates logging middleware into app.js
 * 
 * Usage:
 *   node integrate-task-3.js [--dry-run] [--verify] [--rollback]
 * 
 * Options:
 *   --dry-run   : Show changes without applying
 *   --verify    : Verify integration without changing files
 *   --rollback  : Restore original app.js from backup
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const CASCADE_DIR = path.join(__dirname, 'cascade');
const APP_FILE = path.join(CASCADE_DIR, 'src', 'app.js');
const APP_BACKUP = path.join(CASCADE_DIR, 'src', 'app.js.backup.task3');

// Parse arguments
const args = process.argv.slice(2);
const dryRun = args.includes('--dry-run');
const verify = args.includes('--verify');
const rollback = args.includes('--rollback');

console.log('🔧 TASK 3: INTEGRATION SCRIPT');
console.log('=' .repeat(80));

// Helper functions
function success(msg) {
  console.log(`✅ ${msg}`);
}

function info(msg) {
  console.log(`ℹ️  ${msg}`);
}

function error(msg) {
  console.log(`❌ ${msg}`);
}

function warning(msg) {
  console.log(`⚠️  ${msg}`);
}

// 1. Check if files exist
console.log('\n1️⃣  VÉRIFICATION DES FICHIERS...');

const requiredFiles = [
  path.join(CASCADE_DIR, 'src', 'services', 'winston-config-service.js'),
  path.join(CASCADE_DIR, 'src', 'middleware', 'logging.middleware.js'),
  path.join(CASCADE_DIR, 'src', 'routes', 'logging-stats.routes.js'),
  path.join(CASCADE_DIR, 'src', 'utils', 'logger.js'),
  APP_FILE
];

let allFilesExist = true;
requiredFiles.forEach(file => {
  if (fs.existsSync(file)) {
    success(`${path.relative(CASCADE_DIR, file)}`);
  } else {
    error(`${path.relative(CASCADE_DIR, file)} - NOT FOUND`);
    allFilesExist = false;
  }
});

if (!allFilesExist) {
  error('❌ Some required files not found. Cannot proceed.');
  process.exit(1);
}

// 2. Handle rollback
if (rollback) {
  console.log('\n2️⃣  ROLLBACK MODE...');
  
  if (fs.existsSync(APP_BACKUP)) {
    if (dryRun) {
      info('DRY RUN: Would restore app.js from backup');
    } else {
      fs.copyFileSync(APP_BACKUP, APP_FILE);
      success('app.js restored from backup');
    }
    process.exit(0);
  } else {
    error('No backup found. Cannot rollback.');
    process.exit(1);
  }
}

// 3. Read app.js
console.log('\n2️⃣  LECTURE DE APP.JS...');

let appContent = fs.readFileSync(APP_FILE, 'utf8');
success('app.js read successfully');

// 4. Check for already integrated code
console.log('\n3️⃣  VÉRIFICATION D\'INTÉGRATION EXISTANTE...');

const hasLoggingMiddlewareImport = appContent.includes(
  "from './middleware/logging.middleware.js'"
);
const hasLoggingStatsImport = appContent.includes(
  "from './routes/logging-stats.routes.js'"
);
const hasInitialize = appContent.includes('initializeLoggingMiddleware');
const hasRoutes = appContent.includes("app.use('/api/logs'");

if (hasLoggingMiddlewareImport && hasLoggingStatsImport && hasInitialize && hasRoutes) {
  success('✅ Task 3 already integrated');
  process.exit(0);
}

if (hasLoggingMiddlewareImport || hasLoggingStatsImport || hasInitialize || hasRoutes) {
  warning('⚠️  Partial integration detected');
  info('Imports:', hasLoggingMiddlewareImport, hasLoggingStatsImport);
  info('Code:', hasInitialize, hasRoutes);
}

// 5. Find insertion points
console.log('\n4️⃣  FINDING INSERTION POINTS...');

// Find express.json line
const expressJsonRegex = /app\.use\(express\.json\(\)/;
const expressJsonMatch = appContent.match(expressJsonRegex);

if (!expressJsonMatch) {
  error('Could not find express.json() call in app.js');
  process.exit(1);
}

success('Found express.json() call');

// Find error middleware line
const errorMiddlewareRegex = /\/\/ Error handling middleware|app\.use\(.*errorHandler|app\.use\(\(err,/;
const errorMiddlewareMatch = appContent.match(errorMiddlewareRegex);

if (!errorMiddlewareMatch) {
  warning('Could not find error middleware insertion point');
  warning('Will append routes before final export');
}

// Find routes section
const routesRegex = /app\.use\('\/api\/|app\.use\(router|\/\/ Routes/;
const routesMatch = appContent.match(routesRegex);

let routesInsertionIndex = appContent.length;
if (routesMatch) {
  const matchIndex = appContent.indexOf(routesMatch[0]);
  routesInsertionIndex = matchIndex;
  success('Found routes section');
}

// 6. Generate integration code
console.log('\n5️⃣  GÉNÉRATION CODE D\'INTÉGRATION...');

const imports = `import { initializeLoggingMiddleware } from './middleware/logging.middleware.js';
import loggingStatsRouter from './routes/logging-stats.routes.js';`;

const middlewareCode = `
// Initialize comprehensive logging middleware
initializeLoggingMiddleware(app);`;

const routesCode = `
// Logging statistics routes
app.use('/api/logs', loggingStatsRouter);`;

// 7. Plan modifications
console.log('\n6️⃣  PLANNING MODIFICATIONS...');

let modifiedContent = appContent;

// Add imports at top (after other imports)
if (!hasLoggingMiddlewareImport || !hasLoggingStatsImport) {
  const lastImportRegex = /import\s+.*\s+from\s+['"][^'"]+['"]\s*;(?=\n\n|$)/m;
  const lastImportMatch = modifiedContent.match(lastImportRegex);
  
  if (lastImportMatch) {
    const lastImportIndex = modifiedContent.indexOf(lastImportMatch[0]) + lastImportMatch[0].length;
    modifiedContent = modifiedContent.substring(0, lastImportIndex) + 
                     '\n' + imports + 
                     modifiedContent.substring(lastImportIndex);
    success('Imports will be added after existing imports');
  } else {
    error('Could not find imports section');
    process.exit(1);
  }
}

// Add middleware initialization after express.json()
if (!hasInitialize) {
  const expressJsonIndex = modifiedContent.indexOf(expressJsonMatch[0]) + expressJsonMatch[0].length;
  
  // Find the end of the line
  const lineEnd = modifiedContent.indexOf('\n', expressJsonIndex);
  modifiedContent = modifiedContent.substring(0, lineEnd + 1) + 
                   middlewareCode + '\n' +
                   modifiedContent.substring(lineEnd + 1);
  success('Middleware initialization will be added after express.json()');
}

// Add routes
if (!hasRoutes) {
  modifiedContent = modifiedContent.substring(0, routesInsertionIndex) +
                   routesCode + '\n' +
                   modifiedContent.substring(routesInsertionIndex);
  success('Logging routes will be added in routes section');
}

// 8. Show diff
if (dryRun || verify) {
  console.log('\n7️⃣  CHANGES PREVIEW...');
  console.log('\n--- DIFF (showing additions only) ---\n');
  
  if (!hasLoggingMiddlewareImport || !hasLoggingStatsImport) {
    console.log(imports);
  }
  if (!hasInitialize) {
    console.log(middlewareCode);
  }
  if (!hasRoutes) {
    console.log(routesCode);
  }
  
  if (dryRun) {
    info('\n✅ DRY RUN: No changes applied');
    process.exit(0);
  }
  
  if (verify) {
    success('\n✅ VERIFY: Changes look good, apply with: node integrate-task-3.js');
    process.exit(0);
  }
}

// 9. Apply changes
console.log('\n7️⃣  APPLICATION DES MODIFICATIONS...');

// Create backup
fs.copyFileSync(APP_FILE, APP_BACKUP);
success(`Backup created: app.js.backup.task3`);

// Write modified content
fs.writeFileSync(APP_FILE, modifiedContent);
success('app.js updated with Task 3 integration');

// 10. Verification
console.log('\n8️⃣  VÉRIFICATION...');

const verifyContent = fs.readFileSync(APP_FILE, 'utf8');
const verifyImports = verifyContent.includes('logging.middleware.js') && 
                      verifyContent.includes('logging-stats.routes.js');
const verifyMiddleware = verifyContent.includes('initializeLoggingMiddleware');
const verifyRoutes = verifyContent.includes("'/api/logs'");

if (verifyImports && verifyMiddleware && verifyRoutes) {
  success('All integration points verified');
  success('✅ Task 3 integration complete!');
} else {
  error('Verification failed');
  error('Some integration points are missing');
  info('Rolling back changes...');
  fs.copyFileSync(APP_BACKUP, APP_FILE);
  error('Rollback complete');
  process.exit(1);
}

// 11. Next steps
console.log('\n9️⃣  NEXT STEPS...');
console.log(`
1. Run tests:
   npm test -- tests/task-3-logs-centralization.test.js

2. Start development server:
   npm run dev

3. Test endpoints:
   curl http://localhost:3001/api/logs/health
   curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:3001/api/logs/stats

4. Watch logs:
   tail -f logs/combined/combined-*.log
   tail -f logs/security/security-*.log

5. If issues, rollback with:
   node integrate-task-3.js --rollback
`);

console.log('\n' + '='.repeat(80));
success('✅ TASK 3 INTEGRATION SCRIPT COMPLETE');
