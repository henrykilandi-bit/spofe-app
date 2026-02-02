#!/usr/bin/env node

/**
 * CI Frontend Validation Script
 * 
 * Validates that all frontend modules conform to SPOFE Frontend Module Contract
 * 
 * Usage: node scripts/ci-frontend-validation.js
 * 
 * Exit codes:
 * - 0: All checks passed
 * - 1: Validation failed
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '../modules');
const TEMPLATE_ORIGIN = 'frontend-module-spofe-clean-v1.0.0';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'blue');
}

/**
 * Check if module has correct template origin
 */
function checkTemplateOrigin(modulePath) {
  const originFile = path.join(modulePath, '.template-origin');
  
  if (!fs.existsSync(originFile)) {
    logError(`Missing .template-origin file in ${modulePath}`);
    return false;
  }
  
  const origin = fs.readFileSync(originFile, 'utf-8').trim();
  
  if (origin !== TEMPLATE_ORIGIN) {
    logError(`Invalid template origin: ${origin} (expected: ${TEMPLATE_ORIGIN})`);
    return false;
  }
  
  return true;
}

/**
 * Check if module has required files
 */
function checkRequiredFiles(modulePath) {
  const requiredFiles = [
    'module.manifest.md',
    'index.ts',
    'api/module.api.ts',
    'ui/ModuleView.tsx',
    'ui/module.ui.ts',
    'routes/module.routes.ts',
    'hooks/useModuleUI.ts',
    'tests/module.contract.spec.ts',
  ];
  
  let allPresent = true;
  
  for (const file of requiredFiles) {
    const filePath = path.join(modulePath, file);
    if (!fs.existsSync(filePath)) {
      logError(`Missing required file: ${file}`);
      allPresent = false;
    }
  }
  
  return allPresent;
}

/**
 * Check for forbidden files
 */
function checkForbiddenFiles(modulePath) {
  const forbiddenPatterns = [
    'services/',
    'store/',
    'queries/',
    'utils/',
    'helpers/',
    'constants/',
    '.env.local',
    'config.override.js',
  ];
  
  let violations = [];
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const relativePath = path.relative(modulePath, itemPath);
      
      // Check against forbidden patterns
      for (const pattern of forbiddenPatterns) {
        if (relativePath.includes(pattern)) {
          violations.push(relativePath);
        }
      }
      
      // Recurse into directories
      if (fs.statSync(itemPath).isDirectory()) {
        scanDirectory(itemPath);
      }
    }
  }
  
  scanDirectory(modulePath);
  
  if (violations.length > 0) {
    logError(`Forbidden files/directories found:`);
    violations.forEach(v => logError(`  - ${v}`));
    return false;
  }
  
  return true;
}

/**
 * Check for direct network calls (fetch, axios)
 */
function checkNetworkAccess(modulePath) {
  const forbiddenPatterns = [
    /\bfetch\s*\(/,
    /\baxios\./,
    /\bXMLHttpRequest\b/,
    /new\s+XMLHttpRequest/,
  ];
  
  let violations = [];
  
  function scanFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf-8');
    const relativePath = path.relative(modulePath, filePath);
    
    for (const pattern of forbiddenPatterns) {
      if (pattern.test(content)) {
        violations.push({
          file: relativePath,
          pattern: pattern.toString(),
        });
      }
    }
  }
  
  function scanDirectory(dir) {
    const items = fs.readdirSync(dir);
    
    for (const item of items) {
      const itemPath = path.join(dir, item);
      const stat = fs.statSync(itemPath);
      
      if (stat.isDirectory() && item !== 'node_modules') {
        scanDirectory(itemPath);
      } else if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
        scanFile(itemPath);
      }
    }
  }
  
  scanDirectory(modulePath);
  
  if (violations.length > 0) {
    logError(`Direct network calls detected:`);
    violations.forEach(v => logError(`  - ${v.file}: ${v.pattern}`));
    return false;
  }
  
  return true;
}

/**
 * Validate module.manifest.md
 */
function validateManifest(modulePath) {
  const manifestPath = path.join(modulePath, 'module.manifest.md');
  
  if (!fs.existsSync(manifestPath)) {
    logError('module.manifest.md not found');
    return false;
  }
  
  const content = fs.readFileSync(manifestPath, 'utf-8');
  
  // Check for required fields
  const requiredFields = [
    'module:',
    'description:',
    'frontendModuleContract:',
    'frontendBackendContract:',
    'readModels:',
    'commands:',
    'owner:',
    'status:',
  ];
  
  let allPresent = true;
  
  for (const field of requiredFields) {
    if (!content.includes(field)) {
      logError(`Missing required field in manifest: ${field}`);
      allPresent = false;
    }
  }
  
  // Check contract versions
  if (!content.includes('frontendModuleContract: 1.0.0')) {
    logError('Invalid frontendModuleContract version (must be 1.0.0)');
    allPresent = false;
  }
  
  if (!content.includes('frontendBackendContract: 1.0.0')) {
    logError('Invalid frontendBackendContract version (must be 1.0.0)');
    allPresent = false;
  }
  
  return allPresent;
}

/**
 * Validate a single module
 */
function validateModule(modulePath, moduleName) {
  logInfo(`\n📦 Validating module: ${moduleName}`);
  
  const checks = [
    { name: 'Template origin', fn: () => checkTemplateOrigin(modulePath) },
    { name: 'Required files', fn: () => checkRequiredFiles(modulePath) },
    { name: 'Forbidden files', fn: () => checkForbiddenFiles(modulePath) },
    { name: 'Network access control', fn: () => checkNetworkAccess(modulePath) },
    { name: 'Manifest validation', fn: () => validateManifest(modulePath) },
  ];
  
  let allPassed = true;
  
  for (const check of checks) {
    const passed = check.fn();
    if (passed) {
      logSuccess(`${check.name} PASSED`);
    } else {
      logError(`${check.name} FAILED`);
      allPassed = false;
    }
  }
  
  return allPassed;
}

/**
 * Main validation function
 */
function main() {
  log('\n🔍 SPOFE Frontend Module Validation\n', 'blue');
  
  if (!fs.existsSync(MODULES_DIR)) {
    logWarning('No modules directory found. Creating...');
    fs.mkdirSync(MODULES_DIR, { recursive: true });
    logSuccess('All checks passed (no modules to validate)');
    process.exit(0);
  }
  
  const modules = fs.readdirSync(MODULES_DIR).filter(item => {
    const itemPath = path.join(MODULES_DIR, item);
    return fs.statSync(itemPath).isDirectory();
  });
  
  if (modules.length === 0) {
    logInfo('No modules found to validate');
    logSuccess('All checks passed');
    process.exit(0);
  }
  
  logInfo(`Found ${modules.length} module(s) to validate\n`);
  
  let allModulesPassed = true;
  
  for (const moduleName of modules) {
    const modulePath = path.join(MODULES_DIR, moduleName);
    const passed = validateModule(modulePath, moduleName);
    
    if (!passed) {
      allModulesPassed = false;
    }
  }
  
  log('\n' + '='.repeat(60), 'blue');
  
  if (allModulesPassed) {
    logSuccess('\n🎉 All modules passed validation!\n');
    process.exit(0);
  } else {
    logError('\n❌ Some modules failed validation\n');
    process.exit(1);
  }
}

// Run validation
main();
