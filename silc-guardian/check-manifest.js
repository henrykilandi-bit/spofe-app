#!/usr/bin/env node
/**
 * Manifest & Integrity Check
 * Vérifie que tous les fichiers requis sont présents et valides
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

const MANIFEST = {
  core: [
    'src/core/Violation.ts',
    'src/core/Guardian.ts',
    'src/core/ContractRegistry.ts',
    'src/core/NatureDetector.ts',
  ],
  lexicon: [
    'src/lexicon/allowed-contracts.ts',
    'src/lexicon/forbidden-words.ts',
  ],
  rules: [
    'src/rules/structure/StructureRule.ts',
    'src/rules/entities/EntityNamingRule.ts',
    'src/rules/relations/RelationNamingRule.ts',
    'src/rules/processes/ProcessRule.ts',
    'src/rules/dtos/DtoRule.ts',
    'src/rules/services/ServiceRule.ts',
    'src/rules/repositories/RepositoryRule.ts',
    'src/rules/ast/AstAnalyzer.ts',
    'src/rules/ast/AstRule.ts',
  ],
  compliance: [
    'src/compliance/ComplianceSignature.ts',
    'src/compliance/LegacyAuditMode.ts',
  ],
  reporters: [
    'src/reporters/ConsoleReporter.ts',
    'src/reporters/JsonReporter.ts',
  ],
  cli: [
    'src/cli/index.ts',
  ],
  config: [
    'package.json',
    'tsconfig.json',
    '.eslintrc.json',
    '.gitignore',
  ],
  husky: [
    '.husky/pre-commit',
  ],
  ci: [
    '.github/workflows/silc-guardian.yml',
  ],
  docs: [
    'README.md',
    'QUICKSTART.md',
    'ARCHITECTURE.md',
    'INTEGRATION.md',
    'QA_CHECKLIST.md',
    'SCENARIOS.ts',
    'IMPLEMENTATION_REPORT.md',
  ],
  root: [
    'src/index.ts',
    'pm2.config.js',
  ],
};

function checkFiles() {
  const baseDir = process.cwd();
  const allFiles = Object.values(MANIFEST).flat();
  const missing: string[] = [];
  const present: string[] = [];

  for (const file of allFiles) {
    const fullPath = join(baseDir, file);
    if (existsSync(fullPath)) {
      present.push(file);
    } else {
      missing.push(file);
    }
  }

  return { present, missing };
}

function validateStructure() {
  const { present, missing } = checkFiles();
  
  console.log('🛡️  SILC Guardian — Manifest Check\n');
  
  const totalExpected = Object.values(MANIFEST).flat().length;
  const percentComplete = (present.length / totalExpected) * 100;
  
  console.log(`📊 Status: ${present.length}/${totalExpected} fichiers (${percentComplete.toFixed(1)}%)\n`);
  
  if (missing.length > 0) {
    console.log('❌ Fichiers manquants:');
    missing.forEach(f => console.log(`   ${f}`));
    console.log();
  }
  
  const categories = Object.entries(MANIFEST);
  for (const [category, files] of categories) {
    const categoryPresent = files.filter(f => present.includes(f)).length;
    const categoryTotal = files.length;
    const categoryPercent = (categoryPresent / categoryTotal) * 100;
    
    const status = categoryPresent === categoryTotal ? '✅' : '⚠️ ';
    console.log(`${status} ${category}: ${categoryPresent}/${categoryTotal}`);
  }
  
  console.log();
  
  if (missing.length === 0) {
    console.log('✅ Tous les fichiers présents — Structure valide\n');
    return true;
  } else {
    console.log(`❌ ${missing.length} fichiers manquants\n`);
    return false;
  }
}

validateStructure();
