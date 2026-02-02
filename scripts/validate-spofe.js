#!/usr/bin/env node

/**
 * SPOFE Validation Script
 * 
 * Vérifie que le frontend respecte les règles SPOFE:
 *   ✅ Zéro Axios
 *   ✅ Zéro services/
 *   ✅ Zéro fetch() directs
 *   ✅ Zéro localStorage métier
 *   ✅ Tous les appels → spofeClient
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const FRONTEND_SRC = path.join(__dirname, 'frontend', 'src');
const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const RESET = '\x1b[0m';

let violations = 0;
let warnings = 0;

console.log(`\n${YELLOW}═══════════════════════════════════════════════════════${RESET}`);
console.log(`${YELLOW}   SPOFE Frontend Validation${RESET}`);
console.log(`${YELLOW}═══════════════════════════════════════════════════════${RESET}\n`);

/**
 * Test 1: Aucun import Axios
 */
console.log(`${YELLOW}[1/6] Checking Axios imports...${RESET}`);
try {
  const axiosImports = execSync(
    `find ${FRONTEND_SRC} \\( -name "*.jsx" -o -name "*.js" \\) -exec grep -l "import.*axios" {} \\;`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  ).trim().split('\n').filter(Boolean);

  if (axiosImports.length > 0) {
    console.log(`${RED}✗ Found ${axiosImports.length} files with Axios imports:${RESET}`);
    axiosImports.forEach(f => console.log(`  ${RED}-${RESET} ${f}`));
    violations += axiosImports.length;
  } else {
    console.log(`${GREEN}✓ No Axios imports found${RESET}`);
  }
} catch (e) {
  console.log(`${GREEN}✓ No Axios imports found${RESET}`);
}

/**
 * Test 2: Aucun import services/
 */
console.log(`${YELLOW}[2/6] Checking services/ imports...${RESET}`);
try {
  const servicesImports = execSync(
    `find ${FRONTEND_SRC} \\( -name "*.jsx" -o -name "*.js" \\) -exec grep -l "from.*services\\|from '@/services" {} \\;`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  ).trim().split('\n').filter(Boolean);

  if (servicesImports.length > 0) {
    console.log(`${RED}✗ Found ${servicesImports.length} files importing from services/:${RESET}`);
    servicesImports.forEach(f => console.log(`  ${RED}-${RESET} ${f}`));
    violations += servicesImports.length;
  } else {
    console.log(`${GREEN}✓ No services/ imports found${RESET}`);
  }
} catch (e) {
  console.log(`${GREEN}✓ No services/ imports found${RESET}`);
}

/**
 * Test 3: Aucun fetch() direct
 */
console.log(`${YELLOW}[3/6] Checking direct fetch() calls...${RESET}`);
try {
  const fetchCalls = execSync(
    `find ${FRONTEND_SRC} \\( -name "*.jsx" -o -name "*.js" \\) ! -path "*internal-fetch*" -exec grep -l "fetch(" {} \\;`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  ).trim().split('\n').filter(Boolean);

  if (fetchCalls.length > 0) {
    console.log(`${RED}✗ Found ${fetchCalls.length} files with direct fetch() calls:${RESET}`);
    fetchCalls.forEach(f => console.log(`  ${RED}-${RESET} ${f}`));
    violations += fetchCalls.length;
  } else {
    console.log(`${GREEN}✓ No direct fetch() calls found${RESET}`);
  }
} catch (e) {
  console.log(`${GREEN}✓ No direct fetch() calls found${RESET}`);
}

/**
 * Test 4: localStorage métier
 */
console.log(`${YELLOW}[4/6] Checking localStorage usage...${RESET}`);
try {
  const localStorageFiles = execSync(
    `find ${FRONTEND_SRC} \\( -name "*.jsx" -o -name "*.js" \\) ! -path "*useAuth*" ! -path "*useTheme*" -exec grep -l "localStorage" {} \\;`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  ).trim().split('\n').filter(Boolean);

  if (localStorageFiles.length > 0) {
    console.log(`${YELLOW}⚠ Found ${localStorageFiles.length} files using localStorage (verify if business data):${RESET}`);
    localStorageFiles.forEach(f => console.log(`  ${YELLOW}-${RESET} ${f}`));
    warnings += localStorageFiles.length;
  } else {
    console.log(`${GREEN}✓ No suspicious localStorage usage found${RESET}`);
  }
} catch (e) {
  console.log(`${GREEN}✓ No suspicious localStorage usage found${RESET}`);
}

/**
 * Test 5: Vérifier spofeClient importé dans pages
 */
console.log(`${YELLOW}[5/6] Checking spofeClient imports...${RESET}`);
try {
  const spofeImports = execSync(
    `find ${FRONTEND_SRC}/pages \\( -name "*.jsx" -o -name "*.js" \\) -exec grep -l "spofeClient\\|from '@/api" {} \\;`,
    { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'pipe'] }
  ).trim().split('\n').filter(Boolean);

  if (spofeImports.length > 0) {
    console.log(`${GREEN}✓ Found ${spofeImports.length} pages using spofeClient${RESET}`);
  } else {
    console.log(`${YELLOW}⚠ No pages found using spofeClient (migration may not be complete)${RESET}`);
    warnings += 1;
  }
} catch (e) {
  console.log(`${YELLOW}⚠ Could not check spofeClient imports${RESET}`);
  warnings += 1;
}

/**
 * Test 6: Vérifier services/ supprimé
 */
console.log(`${YELLOW}[6/6] Checking if services/ folder exists...${RESET}`);
const servicesPath = path.join(FRONTEND_SRC, 'services');
if (fs.existsSync(servicesPath)) {
  const files = fs.readdirSync(servicesPath);
  console.log(`${YELLOW}⚠ services/ folder still exists with ${files.length} files:${RESET}`);
  files.forEach(f => console.log(`  ${YELLOW}-${RESET} ${f}`));
  warnings += 1;
} else {
  console.log(`${GREEN}✓ services/ folder successfully removed${RESET}`);
}

/**
 * Summary
 */
console.log(`\n${YELLOW}═══════════════════════════════════════════════════════${RESET}`);
console.log(`${YELLOW}   Summary${RESET}`);
console.log(`${YELLOW}═══════════════════════════════════════════════════════${RESET}`);

if (violations === 0 && warnings === 0) {
  console.log(`\n${GREEN}✓ SPOFE compliance: PASSED${RESET}`);
  console.log(`${GREEN}✓ Frontend is fully aligned with SPOFE architecture${RESET}\n`);
  process.exit(0);
} else {
  if (violations > 0) {
    console.log(`\n${RED}✗ Violations found: ${violations}${RESET}`);
  }
  if (warnings > 0) {
    console.log(`${YELLOW}⚠ Warnings: ${warnings}${RESET}`);
  }
  console.log(`\n${YELLOW}Action required before production deployment${RESET}\n`);
  process.exit(violations > 0 ? 1 : 0);
}
