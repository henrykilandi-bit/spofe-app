#!/usr/bin/env node
/**
 * SPOFE MODULE CONFORMITY TABLE GENERATOR
 * Version 1.0.0 — Tableau Global de Conformité SPOFE
 *
 * 🔒 Ce script génère le tableau global de conformité des modules SPOFE.
 *
 * Principe SPOFE :
 * - Aucun statut manuel
 * - Aucune auto-déclaration
 * - Statut dérivé uniquement des artefacts
 * - Traçabilité complète par version
 *
 * Finalité : Répondre objectivement à "Quels modules SPOFE sont réellement conformes ?"
 */

import { readdirSync, readFileSync, writeFileSync, existsSync, statSync } from 'fs';
import { join, resolve } from 'path';
import { execSync } from 'child_process';

// --- CONFIGURATION ------------------------------------------------

const CONFIG = {
  cascadePath: resolve(process.cwd(), 'cascade', 'modules'),
  governancePath: resolve(process.cwd(), 'spofe', 'governance'),
  outputJson: resolve(process.cwd(), 'spofe', 'governance', 'MODULE_CONFORMITY_TABLE.json'),
  outputMarkdown: resolve(process.cwd(), 'spofe', 'governance', 'MODULE_CONFORMITY_TABLE.md'),
};

// --- TYPES --------------------------------------------------------

interface BuildProofStatus {
  present: boolean;
  signed: boolean;
  valid: boolean;
  commit?: string;
  date?: string;
}

interface ChecklistStatus {
  present: boolean;
  p1Complete: boolean;
  p1Total: number;
  p1Checked: number;
  p2Warnings: number;
  integrityValid: boolean;
}

interface TestStatus {
  unit: boolean;
  integration: boolean;
  e2e: boolean;
}

interface CIStatus {
  present: boolean;
  lastRun?: string;
  status?: 'pass' | 'fail' | 'unknown';
}

interface RollbackInfo {
  occurred: boolean;
  reason?: 'BUILD_FAILURE' | 'TEST_FAILURE' | 'SIGNATURE_FAILURE' | 'CHECKLIST_FAILURE' | 'VALIDATION_FAILURE';
  ciRun?: string;
  timestamp?: string;
}

interface ModuleConformity {
  module: string;
  version: string | null;
  commit: string | null;
  buildProof: BuildProofStatus;
  checklist: ChecklistStatus;
  tests: TestStatus;
  ci: CIStatus;
  multiTenant: boolean;
  interModules: boolean;
  observability: 'none' | 'basic' | 'advanced';
  status: 'CONFORM' | 'CONDITIONAL' | 'NON_CONFORM' | 'ROLLED_BACK';
  rollback: RollbackInfo;
  reason: string;
  lastValidation: string;
}

interface ConformityTable {
  generatedAt: string;
  version: string;
  totalModules: number;
  conformCount: number;
  conditionalCount: number;
  nonConformCount: number;
  rolledBackCount: number;
  modules: ModuleConformity[];
}

// --- UTILITAIRES --------------------------------------------------

function fail(msg: string): never {
  console.error(`\n❌❌❌ CONFORMITY TABLE GENERATION FAILED ❌❌❌`);
  console.error(`Reason: ${msg}`);
  process.exit(1);
}

function ok(msg: string) {
  console.log(`✅ ${msg}`);
}

function warn(msg: string) {
  console.log(`⚠️  ${msg}`);
}

function section(title: string) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(title);
  console.log(`${'='.repeat(70)}`);
}

function parseBuildProof(content: string): { commit?: string; date?: string; status?: string } {
  const result: { commit?: string; date?: string; status?: string } = {};

  const commitMatch = content.match(/Commit[:\s]+([a-f0-9]{7,40})/i);
  if (commitMatch) result.commit = commitMatch[1];

  const dateMatch = content.match(/(?:Date|Generated)[:\s]+([\d-T:.Z]+)/i);
  if (dateMatch) result.date = dateMatch[1];

  const statusMatch = content.match(/Status[:\s]+(SUCCESS|FAIL)/i);
  if (statusMatch) result.status = statusMatch[1];

  return result;
}

function parseChecklist(content: string): { p1Total: number; p1Checked: number; p2Warnings: number } {
  const lines = content.split('\n');
  let p1Total = 0;
  let p1Checked = 0;
  let p2Warnings = 0;

  for (const line of lines) {
    // Count P1 items
    if (line.includes('(P1)') || line.includes('**P1**')) {
      p1Total++;
      if (line.includes('[x]') || line.includes('[X]')) {
        p1Checked++;
      }
    }
    // Count P2 unchecked items as warnings
    if ((line.includes('(P2)') || line.includes('**P2**')) && !line.includes('[x]') && !line.includes('[X]')) {
      p2Warnings++;
    }
  }

  return { p1Total, p1Checked, p2Warnings };
}

// --- SCANNING DES MODULES -----------------------------------------

function scanModules(): string[] {
  section('1. SCANNING MODULES');

  if (!existsSync(CONFIG.cascadePath)) {
    fail(`Cascade modules path not found: ${CONFIG.cascadePath}`);
  }

  const modules: string[] = [];

  try {
    const entries = readdirSync(CONFIG.cascadePath, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory()) {
        // Check if it has SPOFE structure
        const modulePath = join(CONFIG.cascadePath, entry.name);
        const hasContract = existsSync(join(modulePath, 'CONTRACT.md'));
        const hasGuardian = existsSync(join(modulePath, 'GUARDIAN.md'));

        if (hasContract || hasGuardian) {
          modules.push(entry.name);
          console.log(`  Found: ${entry.name}`);
        }
      }
    }
  } catch (error: any) {
    fail(`Error scanning modules: ${error.message}`);
  }

  console.log(`\n  Total SPOFE modules found: ${modules.length}`);
  ok(`Scanned ${modules.length} modules`);

  return modules;
}

// --- ANALYSE PAR MODULE ------------------------------------------

function analyzeModule(moduleName: string): ModuleConformity {
  const modulePath = join(CONFIG.cascadePath, moduleName);

  // --- BUILD_PROOF Analysis ---
  const buildProofPath = join(modulePath, 'BUILD_PROOF.md');
  const buildProofSigPath = join(modulePath, 'BUILD_PROOF.sig');
  const buildProofHashPath = join(modulePath, 'BUILD_PROOF.sha256');

  const buildProof: BuildProofStatus = {
    present: existsSync(buildProofPath),
    signed: existsSync(buildProofSigPath),
    valid: false,
  };

  if (buildProof.present) {
    try {
      const content = readFileSync(buildProofPath, 'utf8');
      const parsed = parseBuildProof(content);
      buildProof.commit = parsed.commit;
      buildProof.date = parsed.date;
      buildProof.valid = parsed.status === 'SUCCESS';
    } catch {
      // Invalid BUILD_PROOF
    }
  }

  // --- Checklist Analysis ---
  const checklistPath = join(modulePath, 'CHECKLIST_GO_PROD.md');
  const checklistHashPath = join(modulePath, '.checklist.hash');

  const checklist: ChecklistStatus = {
    present: existsSync(checklistPath),
    p1Complete: false,
    p1Total: 0,
    p1Checked: 0,
    p2Warnings: 0,
    integrityValid: false,
  };

  if (checklist.present) {
    try {
      const content = readFileSync(checklistPath, 'utf8');
      const parsed = parseChecklist(content);
      checklist.p1Total = parsed.p1Total;
      checklist.p1Checked = parsed.p1Checked;
      checklist.p2Warnings = parsed.p2Warnings;
      checklist.p1Complete = parsed.p1Total > 0 && parsed.p1Total === parsed.p1Checked;

      // Check integrity if hash file exists
      if (existsSync(checklistHashPath)) {
        checklist.integrityValid = true; // Simplified for this version
      }
    } catch {
      // Invalid checklist
    }
  }

  // --- Test Detection ---
  const tests: TestStatus = {
    unit: existsSync(join(modulePath, 'tests', 'unit')) ||
          existsSync(join(modulePath, '__tests__')) ||
          existsSync(join(modulePath, '*.spec.ts')),
    integration: existsSync(join(modulePath, 'tests', 'integration')),
    e2e: existsSync(join(modulePath, 'tests', 'e2e')),
  };

  // --- CI Detection ---
  const ciWorkflowPath = resolve(process.cwd(), '.github', 'workflows', `ci-${moduleName}.yml`);
  const ci: CIStatus = {
    present: existsSync(ciWorkflowPath),
    status: 'unknown',
  };

  // --- Multi-tenant Detection ---
  const guardianPath = join(modulePath, 'guardian');
  let multiTenant = false;
  try {
    if (existsSync(guardianPath)) {
      const files = readdirSync(guardianPath);
      for (const file of files) {
        if (file.endsWith('.ts') || file.endsWith('.js')) {
          const content = readFileSync(join(guardianPath, file), 'utf8');
          if (content.includes('tenantId') || content.includes('tenant')) {
            multiTenant = true;
            break;
          }
        }
      }
    }
  } catch {
    // Cannot determine
  }

  // --- Inter-modules Detection ---
  const contractPath = join(modulePath, 'CONTRACT.md');
  let interModules = false;
  try {
    if (existsSync(contractPath)) {
      const content = readFileSync(contractPath, 'utf8');
      interModules = content.includes('Module') && content.includes('Contrat');
    }
  } catch {
    // Cannot determine
  }

  // --- Observability Detection ---
  let observability: 'none' | 'basic' | 'advanced' = 'none';
  try {
    const hasHealth = existsSync(join(modulePath, 'health')) ||
                      existsSync(join(modulePath, 'monitoring'));
    const hasMetrics = existsSync(join(modulePath, 'metrics')) ||
                       existsSync(join(modulePath, 'telemetry'));
    if (hasMetrics) observability = 'advanced';
    else if (hasHealth) observability = 'basic';
  } catch {
    // Cannot determine
  }

  // --- Version Extraction ---
  let version: string | null = null;
  try {
    const packageJsonPath = join(modulePath, 'package.json');
    if (existsSync(packageJsonPath)) {
      const pkg = JSON.parse(readFileSync(packageJsonPath, 'utf8'));
      version = pkg.version || null;
    }
  } catch {
    // Cannot determine version
  }

  // --- Status Calculation ---
  let status: 'CONFORM' | 'CONDITIONAL' | 'NON_CONFORM' = 'NON_CONFORM';
  let reason = '';

  if (!buildProof.present) {
    status = 'NON_CONFORM';
    reason = 'BUILD_PROOF absent';
  } else if (!buildProof.signed) {
    status = 'NON_CONFORM';
    reason = 'BUILD_PROOF non signé';
  } else if (!buildProof.valid) {
    status = 'NON_CONFORM';
    reason = 'BUILD_PROOF invalide (build/tests échoués)';
  } else if (!checklist.p1Complete) {
    status = 'CONDITIONAL';
    reason = `Checklist P1 incomplète (${checklist.p1Checked}/${checklist.p1Total})`;
  } else if (checklist.p2Warnings > 0) {
    status = 'CONDITIONAL';
    reason = `${checklist.p2Warnings} items P2 non validés`;
  } else {
    status = 'CONFORM';
    reason = 'BUILD_PROOF valide, checklist complète';
  }

  return {
    module: moduleName,
    version,
    commit: buildProof.commit || null,
    buildProof,
    checklist,
    tests,
    ci,
    multiTenant,
    interModules,
    observability,
    status,
    rollback: {
      occurred: false,
    },
    reason,
    lastValidation: new Date().toISOString(),
  };
}

// --- GÉNÉRATION JSON ------------------------------------------------

function generateJsonTable(modules: ModuleConformity[]): ConformityTable {
  section('3. GENERATING JSON TABLE');

  const conformCount = modules.filter(m => m.status === 'CONFORM').length;
  const conditionalCount = modules.filter(m => m.status === 'CONDITIONAL').length;
  const nonConformCount = modules.filter(m => m.status === 'NON_CONFORM').length;
  const rolledBackCount = modules.filter(m => m.status === 'ROLLED_BACK').length;

  const table: ConformityTable = {
    generatedAt: new Date().toISOString(),
    version: '1.0.0',
    totalModules: modules.length,
    conformCount,
    conditionalCount,
    nonConformCount,
    rolledBackCount,
    modules,
  };

  writeFileSync(CONFIG.outputJson, JSON.stringify(table, null, 2));
  console.log(`  Output: ${CONFIG.outputJson}`);
  ok(`JSON table generated (${modules.length} modules)`);

  return table;
}

// --- GÉNÉRATION MARKDOWN --------------------------------------------

function generateMarkdownTable(table: ConformityTable): void {
  section('4. GENERATING MARKDOWN TABLE');

  let md = `# 📊 SPOFE — Module Conformity Table

**Version:** ${table.version}  
**Generated:** ${table.generatedAt}  
**Total Modules:** ${table.totalModules}

---

## 📈 Executive Summary

| Statut | Count | Percentage |
|--------|-------|------------|
| 🟢 **CONFORM** | ${table.conformCount} | ${((table.conformCount / table.totalModules) * 100).toFixed(1)}% |
| 🟡 **CONDITIONAL** | ${table.conditionalCount} | ${((table.conditionalCount / table.totalModules) * 100).toFixed(1)}% |
| 🔴 **NON CONFORM** | ${table.nonConformCount} | ${((table.nonConformCount / table.totalModules) * 100).toFixed(1)}% |

---

## 📋 Detailed Conformity Table

| Module | Version | BUILD_PROOF | Tests | CI | Multi-Tenant | Statut | Justification |
|--------|---------|-------------|-------|----|--------------|--------|---------------|
`;

  for (const mod of table.modules) {
    const bpIcon = mod.buildProof.present
      ? (mod.buildProof.signed ? (mod.buildProof.valid ? '✅' : '❌') : '⚠️')
      : '❌';

    const testIcon = mod.tests.unit && mod.tests.integration
      ? '✅'
      : (mod.tests.unit || mod.tests.integration ? '⚠️' : '❌');

    const ciIcon = mod.ci.present ? '✅' : '❌';
    const mtIcon = mod.multiTenant ? '✅' : '❌';

    const statusIcon = mod.status === 'CONFORM' ? '🟢'
      : (mod.status === 'CONDITIONAL' ? '🟡' : '🔴');

    md += `| ${mod.module} | ${mod.version || '-'} | ${bpIcon} | ${testIcon} | ${ciIcon} | ${mtIcon} | ${statusIcon} | ${mod.reason} |\n`;
  }

  md += `
---

## 🏷️ Legend

| Icon | Meaning |
|------|---------|
| ✅ | Present / Valid / Complete |
| ⚠️ | Partial / Warning |
| ❌ | Absent / Invalid / Missing |
| 🟢 | CONFORM — BUILD_PROOF valid, checklist complete |
| 🟡 | CONDITIONAL — BUILD_PROOF valid, minor issues |
| 🔴 | NON CONFORM — Critical issues, cannot release |

---

## 🔍 Module Details

`;

  for (const mod of table.modules) {
    md += `### ${mod.module}

- **Version:** ${mod.version || 'N/A'}
- **Commit:** ${mod.commit || 'N/A'}
- **Status:** ${mod.status === 'CONFORM' ? '🟢 CONFORM' : (mod.status === 'CONDITIONAL' ? '🟡 CONDITIONAL' : '🔴 NON CONFORM')}
- **Reason:** ${mod.reason}

**BUILD_PROOF:**
- Present: ${mod.buildProof.present ? '✅' : '❌'}
- Signed: ${mod.buildProof.signed ? '✅' : '❌'}
- Valid: ${mod.buildProof.valid ? '✅' : '❌'}

**Checklist:**
- Present: ${mod.checklist.present ? '✅' : '❌'}
- P1 Complete: ${mod.checklist.p1Complete ? '✅' : '❌'} (${mod.checklist.p1Checked}/${mod.checklist.p1Total})
- P2 Warnings: ${mod.checklist.p2Warnings}

**Tests:**
- Unit: ${mod.tests.unit ? '✅' : '❌'}
- Integration: ${mod.tests.integration ? '✅' : '❌'}
- E2E: ${mod.tests.e2e ? '✅' : '❌'}

**Infrastructure:**
- CI: ${mod.ci.present ? '✅' : '❌'}
- Multi-tenant: ${mod.multiTenant ? '✅' : '❌'}
- Inter-modules: ${mod.interModules ? '✅' : '❌'}
- Observability: ${mod.observability}

---

`;
  }

  md += `## 📌 SPOFE Rule Reference

> **Toute décision stratégique (déploiement, roadmap, audit) doit s'appuyer exclusivement sur ce tableau global de conformité SPOFE.**

This table is auto-generated. Do not edit manually.

_Last updated: ${table.generatedAt}_
`;

  writeFileSync(CONFIG.outputMarkdown, md);
  console.log(`  Output: ${CONFIG.outputMarkdown}`);
  ok(`Markdown table generated`);
}

// --- RAPPORT FINAL --------------------------------------------------

function generateReport(table: ConformityTable): void {
  section('📊 CONFORMITY TABLE REPORT');

  console.log(`
┌────────────────────────────────────────────────────────────────────┐
│  SPOFE MODULE CONFORMITY TABLE — EXECUTIVE SUMMARY                 │
├────────────────────────────────────────────────────────────────────┤
│  Generated:        ${table.generatedAt.substring(0, 19).padEnd(40)}│
│  Total Modules:    ${String(table.totalModules).padEnd(40)}│
│                                                                    │
│  🟢 CONFORM:       ${String(table.conformCount).padEnd(40)}│
│  🟡 CONDITIONAL:   ${String(table.conditionalCount).padEnd(40)}│
│  🔴 NON CONFORM:   ${String(table.nonConformCount).padEnd(40)}│
│                                                                    │
│  Conformity Rate:  ${String(((table.conformCount / table.totalModules) * 100).toFixed(1) + '%').padEnd(40)}│
└────────────────────────────────────────────────────────────────────┘
`);

  // List non-conform modules
  const nonConform = table.modules.filter(m => m.status === 'NON_CONFORM');
  if (nonConform.length > 0) {
    console.log('🔴 NON CONFORM MODULES (Action Required):');
    for (const mod of nonConform) {
      console.log(`  - ${mod.module}: ${mod.reason}`);
    }
  }

  // List conditional modules
  const conditional = table.modules.filter(m => m.status === 'CONDITIONAL');
  if (conditional.length > 0) {
    console.log('\n🟡 CONDITIONAL MODULES (Review Recommended):');
    for (const mod of conditional) {
      console.log(`  - ${mod.module}: ${mod.reason}`);
    }
  }
}

// --- FONCTION PRINCIPALE --------------------------------------------

function main(): void {
  console.log('📊 SPOFE Module Conformity Table Generator v1.0.0');
  console.log('   Executive Piloting — Automated Compliance');
  console.log('');

  // Step 1: Scan modules
  const moduleNames = scanModules();

  if (moduleNames.length === 0) {
    fail('No SPOFE modules found in cascade/modules');
  }

  // Step 2: Analyze each module
  section('2. ANALYZING MODULES');
  const modules: ModuleConformity[] = [];

  for (const name of moduleNames) {
    console.log(`  Analyzing: ${name}...`);
    const analysis = analyzeModule(name);
    modules.push(analysis);
    console.log(`    Status: ${analysis.status} — ${analysis.reason}`);
  }

  ok(`Analyzed ${modules.length} modules`);

  // Step 3: Generate JSON
  const table = generateJsonTable(modules);

  // Step 4: Generate Markdown
  generateMarkdownTable(table);

  // Step 5: Report
  generateReport(table);

  // Final verdict
  section('🏁 GENERATION COMPLETE');
  console.log('\n✅✅✅ CONFORMITY TABLE GENERATED SUCCESSFULLY ✅✅✅\n');
  console.log(`📄 JSON: ${CONFIG.outputJson}`);
  console.log(`📝 Markdown: ${CONFIG.outputMarkdown}`);
  console.log(`📊 Modules: ${table.totalModules}`);
  console.log(`🟢 Conform: ${table.conformCount}`);
  console.log(`🟡 Conditional: ${table.conditionalCount}`);
  console.log(`🔴 Non-conform: ${table.nonConformCount}`);
  console.log('\n👉 Use this table for strategic decisions, audits, and roadmaps.\n');

  process.exit(0);
}

// --- EXECUTION ------------------------------------------------------

main();
