#!/usr/bin/env node

/**
 * CI Check - Backend Auth Guardian Bypass
 * 
 * Ensures the backend NEVER bypasses Guardian with auth logic.
 * 
 * The backend must NOT:
 * - Authorize actions in auth middleware
 * - Block commands before Guardian
 * - Implement implicit role-based access
 * 
 * Exit codes:
 * - 0: No Guardian bypass detected
 * - 1: Guardian bypass found (BLOCKING)
 */

const fs = require('fs');
const path = require('path');

const BACKEND_DIR = path.join(__dirname, '../cascade');

const FORBIDDEN_PATTERNS = [
  { pattern: /checkPermission\s*\(/, description: 'Permission check before Guardian' },
  { pattern: /authorize\s*\(/, description: 'Authorization before Guardian' },
  { pattern: /\.isAdmin\b/, description: 'Admin check before Guardian' },
  { pattern: /hasRole\s*\(/, description: 'Role check before Guardian' },
  { pattern: /user\.role\s*===/, description: 'Role comparison before Guardian' },
  { pattern: /if\s*\(\s*!.*\.isAdmin\s*\)/, description: 'Admin gate before Guardian' },
  { pattern: /throw.*Forbidden.*role/, description: 'Role-based rejection' },
  { pattern: /throw.*Unauthorized.*permission/, description: 'Permission-based rejection' },
];

let violations = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(BACKEND_DIR, filePath);
  
  // Skip test files
  if (relativePath.includes('.test.') || relativePath.includes('.spec.')) {
    return;
  }
  
  for (const { pattern, description } of FORBIDDEN_PATTERNS) {
    if (pattern.test(content)) {
      const lines = content.split('\n');
      const lineNumbers = [];
      
      lines.forEach((line, index) => {
        if (pattern.test(line)) {
          lineNumbers.push(index + 1);
        }
      });
      
      violations.push({
        file: relativePath,
        pattern: description,
        lines: lineNumbers
      });
    }
  }
}

function scanDirectory(dir) {
  const items = fs.readdirSync(dir);
  
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      // Skip node_modules, dist, build
      if (['node_modules', 'dist', 'build', '.git'].includes(item)) {
        continue;
      }
      scanDirectory(fullPath);
    } else if (stat.isFile()) {
      // Only scan TypeScript/JavaScript files
      if (/\.(ts|js)$/.test(item)) {
        scanFile(fullPath);
      }
    }
  }
}

console.log('🔍 Scanning backend for Guardian bypass...\n');

if (!fs.existsSync(BACKEND_DIR)) {
  console.error('❌ Backend directory not found');
  process.exit(1);
}

scanDirectory(BACKEND_DIR);

if (violations.length > 0) {
  console.error('❌ [BACKEND AUTH] Guardian bypass detected\n');
  console.error('   The backend must NEVER make authorization decisions outside Guardian.\n');
  console.error('   Violations found:\n');
  
  violations.forEach(({ file, pattern, lines }) => {
    console.error(`   📄 ${file}`);
    console.error(`      Pattern: ${pattern}`);
    console.error(`      Lines: ${lines.join(', ')}\n`);
  });
  
  console.error('   SPOFE Rule: Auth identifies, Guardian decides.\n');
  console.error('   All business decisions must go through Guardian.\n');
  process.exit(1);
}

console.log('✅ Backend auth does not bypass Guardian');
console.log('   All authorization flows through Guardian\n');

process.exit(0);
