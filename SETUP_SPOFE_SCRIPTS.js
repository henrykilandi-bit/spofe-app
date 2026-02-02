#!/usr/bin/env node

/**
 * SPOFE npm Scripts Setup
 * 
 * Add these scripts to package.json to run validation and build commands
 */

const fs = require('fs');
const path = require('path');

const packageJsonPath = path.join(__dirname, 'package.json');

// Scripts to add
const newScripts = {
  'validate:spofe': 'node scripts/validate-spofe.js',
  'validate:spofe:watch': 'chokidar "src/**/*.{js,jsx}" -c "npm run validate:spofe"',
  'build:spofe': 'npm run build',
  'test:spofe': 'npm run test -- --testNamePattern="spofe|contract|fcе"',
  'lint:spofe': 'eslint src/ --rule "no-restricted-imports: [error, { patterns: [\"**/services/**\"] }]"',
  'precommit:spofe': 'npm run lint:spofe && npm run validate:spofe',
};

/**
 * This is a REFERENCE file showing what to add to package.json
 * 
 * Copy these scripts into your frontend/package.json scripts section:
 */

console.log(`
╔════════════════════════════════════════════════════════════════════════════╗
║                    SPOFE npm Scripts Setup Reference                       ║
╚════════════════════════════════════════════════════════════════════════════╝

✅ Add these scripts to frontend/package.json:

"scripts": {
  ...existing scripts...
  
  "validate:spofe": "node scripts/validate-spofe.js",
  "validate:spofe:watch": "chokidar \\"src/**/*.{js,jsx}\\" -c \\"npm run validate:spofe\\"",
  "build:spofe": "npm run build",
  "test:spofe": "npm run test -- --testNamePattern=\\"spofe|contract|fce\\"",
  "lint:spofe": "eslint src/ --rule \\"no-restricted-imports: [error, { patterns: [\\"**/services/**\\"] }]\\"",
  "precommit:spofe": "npm run lint:spofe && npm run validate:spofe"
}

════════════════════════════════════════════════════════════════════════════════

📋 SCRIPTS REFERENCE:

1. validate:spofe
   - Runs 6 SPOFE compliance checks
   - Verifies: No Axios, no services/, no fetch(), no business localStorage
   - Usage: npm run validate:spofe
   - Exit codes: 0 = PASSED ✅ | 1 = VIOLATIONS ❌

2. validate:spofe:watch
   - Runs validation automatically when files change
   - Requires: npm install --save-dev chokidar
   - Usage: npm run validate:spofe:watch
   - Good for: Development (continuous feedback)

3. build:spofe
   - Alias for npm run build
   - Ensures SPOFE-compliant build
   - Usage: npm run build:spofe
   - Validates BEFORE building in CI/CD

4. test:spofe
   - Runs tests matching SPOFE patterns
   - Filter tests by: "spofe", "contract", "fce"
   - Usage: npm run test:spofe
   - Good for: Verifying SPOFE-specific test cases

5. lint:spofe
   - Custom ESLint rule for services imports
   - Blocks: import from '@/services/**'
   - Usage: npm run lint:spofe
   - Prevents migration regressions

6. precommit:spofe
   - Runs lint + validation before commit
   - Requires: husky (git hooks)
   - Setup: husky install && npx husky add .husky/pre-commit "npm run precommit:spofe"
   - Usage: Automatic on git commit (if husky enabled)

════════════════════════════════════════════════════════════════════════════════

🔧 SETUP INSTRUCTIONS:

1. Copy the scripts section above into frontend/package.json

2. (Optional) Install chokidar for watch mode:
   cd frontend
   npm install --save-dev chokidar

3. (Optional) Setup husky for pre-commit hooks:
   npx husky install
   npx husky add .husky/pre-commit "npm run precommit:spofe"

4. Test:
   npm run validate:spofe
   # Should show: ✓ SPOFE compliance: PASSED

════════════════════════════════════════════════════════════════════════════════

📊 CI/CD INTEGRATION:

Add to .github/workflows/build.yml:

jobs:
  spofe-validation:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: npm run validate:spofe
      - run: npm run lint:spofe
      - run: npm run build
      - run: npm run test

════════════════════════════════════════════════════════════════════════════════

💡 USAGE EXAMPLES:

# Validate current state
npm run validate:spofe

# Watch for violations during development
npm run validate:spofe:watch

# Run tests specific to SPOFE
npm run test:spofe

# Lint for services imports
npm run lint:spofe

# Full validation + build
npm run build:spofe

# Pre-commit checks (if husky enabled)
# Automatic on: git commit

════════════════════════════════════════════════════════════════════════════════

✨ Benefits:

✅ Catch SPOFE violations immediately
✅ Prevent regressions during development
✅ Enforce governance at commit time
✅ CI/CD validation before merge
✅ Team accountability
✅ Clear compliance status

════════════════════════════════════════════════════════════════════════════════
`);

// Try to read package.json for information
try {
  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));
  
  const existingScripts = packageJson.scripts || {};
  const hasSpofeScripts = Object.keys(existingScripts).some(key => key.includes('spofe'));
  
  if (!hasSpofeScripts) {
    console.log(`\n🔍 Current status of frontend/package.json:\n`);
    console.log(`   Scripts section: ${Object.keys(existingScripts).length} scripts defined`);
    console.log(`   SPOFE scripts: Not yet added ❌\n`);
    
    console.log(`\n✨ Next steps:\n`);
    console.log(`   1. Open frontend/package.json`);
    console.log(`   2. Find the "scripts" section`);
    console.log(`   3. Add the SPOFE scripts from the reference above\n`);
  } else {
    console.log(`\n✅ SPOFE scripts already configured!\n`);
    const spofeScripts = Object.keys(existingScripts)
      .filter(key => key.includes('spofe'));
    console.log(`   Configured scripts: ${spofeScripts.join(', ')}\n`);
  }
} catch (error) {
  console.log(`\n⚠️  Could not read package.json: ${error.message}\n`);
  console.log(`   Manual setup required. See instructions above.\n`);
}

console.log(`════════════════════════════════════════════════════════════════════════════════\n`);
console.log(`📚 Documentation: See PHASE_4_QUICK_START.md for developer guide\n`);
