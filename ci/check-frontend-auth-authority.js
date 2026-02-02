#!/usr/bin/env node

/**
 * CI Check - Frontend Auth Authority (CRITICAL)
 * 
 * Ensures the frontend NEVER implements authority logic.
 * 
 * The frontend must NOT:
 * - Interpret roles
 * - Check permissions
 * - Make authorization decisions
 * 
 * Exit codes:
 * - 0: No authority logic detected
 * - 1: Authority logic found (BLOCKING)
 */

const fs = require('fs');
const path = require('path');

const FRONTEND_DIR = path.join(__dirname, '../frontend');

const FORBIDDEN_PATTERNS = [
  { pattern: /role\s*===/, description: 'Role comparison' },
  { pattern: /roles\.includes/, description: 'Role check' },
  { pattern: /hasPermission\s*\(/, description: 'Permission check' },
  { pattern: /isAuthorized\s*\(/, description: 'Authorization check' },
  { pattern: /can\s*\(/, description: 'Ability check' },
  { pattern: /\.permissions\s*\./, description: 'Permission access' },
  { pattern: /checkRole\s*\(/, description: 'Role verification' },
  { pattern: /checkPermission\s*\(/, description: 'Permission verification' },
  { pattern: /user\.isAdmin/, description: 'Admin check' },
  { pattern: /user\.isModerator/, description: 'Moderator check' },
  { pattern: /if\s*\(\s*user\.role/, description: 'Role-based condition' },
];

let violations = [];

function scanFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const relativePath = path.relative(FRONTEND_DIR, filePath);
  
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
      if (/\.(ts|tsx|js|jsx)$/.test(item)) {
        scanFile(fullPath);
      }
    }
  }
}

console.log('🔍 Scanning frontend for authority logic...\n');

if (!fs.existsSync(FRONTEND_DIR)) {
  console.error('❌ Frontend directory not found');
  process.exit(1);
}

scanDirectory(FRONTEND_DIR);

if (violations.length > 0) {
  console.error('❌ [AUTH VIOLATION] Frontend authority logic detected\n');
  console.error('   The frontend must NEVER make authorization decisions.\n');
  console.error('   Violations found:\n');
  
  violations.forEach(({ file, pattern, lines }) => {
    console.error(`   📄 ${file}`);
    console.error(`      Pattern: ${pattern}`);
    console.error(`      Lines: ${lines.join(', ')}\n`);
  });
  
  console.error('   SPOFE Rule: Frontend identifies, Guardian decides.\n');
  process.exit(1);
}

console.log('✅ No frontend authority logic detected');
console.log('   Frontend remains neutral and non-authoritative\n');

process.exit(0);
