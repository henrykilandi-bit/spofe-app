#!/usr/bin/env node

/**
 * CI Check - Auth Not In Modules
 * 
 * Ensures auth logic stays in frontend/core/auth only.
 * No SPOFE-clean module should contain auth-related code.
 * 
 * Exit codes:
 * - 0: Auth properly isolated
 * - 1: Auth found in modules (BLOCKING)
 */

const fs = require('fs');
const path = require('path');

const MODULES_DIR = path.join(__dirname, '../frontend/modules');
const FORBIDDEN_KEYWORDS = ['auth', 'login', 'permission', 'role', 'token'];

let violations = [];

function scanDirectory(dir, basePath = '') {
  if (!fs.existsSync(dir)) {
    console.log('ℹ️  No modules directory found (this is OK for new projects)\n');
    process.exit(0);
  }

  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const relativePath = path.join(basePath, item);
    const stat = fs.statSync(fullPath);
    
    // Check filename for forbidden keywords
    const lowerItem = item.toLowerCase();
    for (const forbidden of FORBIDDEN_KEYWORDS) {
      if (lowerItem.includes(forbidden)) {
        violations.push({
          type: 'filename',
          path: relativePath,
          keyword: forbidden
        });
      }
    }
    
    // Recurse into directories
    if (stat.isDirectory() && item !== 'node_modules') {
      scanDirectory(fullPath, relativePath);
    }
    
    // Scan file content for auth imports
    if (stat.isFile() && /\.(ts|tsx|js|jsx)$/.test(item)) {
      const content = fs.readFileSync(fullPath, 'utf8');
      
      // Check for imports from core/auth
      if (content.includes("from '@/core/auth'") || 
          content.includes('from "../core/auth"') ||
          content.includes("from '../../core/auth'")) {
        violations.push({
          type: 'import',
          path: relativePath,
          keyword: 'core/auth import'
        });
      }
      
      // Check for direct token access
      if (content.includes('localStorage.getItem') && 
          (content.includes('token') || content.includes('auth'))) {
        violations.push({
          type: 'storage',
          path: relativePath,
          keyword: 'direct token access'
        });
      }
    }
  }
}

console.log('🔍 Checking auth isolation from modules...\n');

scanDirectory(MODULES_DIR);

if (violations.length > 0) {
  console.error('❌ [AUTH LOCATION] Auth-related logic found in modules\n');
  console.error('   Auth must live ONLY in frontend/core/auth\n');
  console.error('   Violations:\n');
  
  violations.forEach(({ type, path, keyword }) => {
    console.error(`   📄 ${path}`);
    console.error(`      Type: ${type}`);
    console.error(`      Issue: ${keyword}\n`);
  });
  
  console.error('   SPOFE Rule: Modules are business logic only.\n');
  console.error('   Auth is infrastructure and must stay isolated.\n');
  process.exit(1);
}

console.log('✅ No auth logic inside frontend modules');
console.log('   Auth properly isolated in core/auth\n');

process.exit(0);
