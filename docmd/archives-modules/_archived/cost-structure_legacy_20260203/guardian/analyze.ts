/**
 * Guardian / AGA Analyzer — Cost-Structure Module
 * ================================================
 * 
 * Analyse statique de l'architecture du module Cost-Structure.
 * Vérifie les règles SILC et les invariants DDD.
 * 
 * Usage:
 *   npm run aga:analyze
 *   npm run aga:report
 * 
 * Exit codes:
 *   0 = Architecture conforme
 *   1 = Violations détectées
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const MODULE_ROOT = path.resolve(__dirname, '..');

// ═══════════════════════════════════════════════════════════════════════════════
// CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

interface Rule {
  id: string;
  name: string;
  severity: 'error' | 'warning';
  check: () => Violation[];
}

interface Violation {
  rule: string;
  file: string;
  line?: number;
  message: string;
  severity: 'error' | 'warning';
}

// ═══════════════════════════════════════════════════════════════════════════════
// RULES
// ═══════════════════════════════════════════════════════════════════════════════

const rules: Rule[] = [
  // ─────────────────────────────────────────────────────────────────────────────
  // RULE: ARCH-001 — Domain ne doit pas importer infrastructure
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'ARCH-001',
    name: 'Domain must not import infrastructure',
    severity: 'error',
    check: () => {
      const violations: Violation[] = [];
      const domainDir = path.join(MODULE_ROOT, 'domain');
      
      if (!fs.existsSync(domainDir)) return violations;
      
      const files = getAllTsFiles(domainDir);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, idx) => {
          if (line.includes("from '../infrastructure") || 
              line.includes("from '../../infrastructure") ||
              line.includes('from "../infrastructure') ||
              line.includes('from "../../infrastructure')) {
            violations.push({
              rule: 'ARCH-001',
              file: path.relative(MODULE_ROOT, file),
              line: idx + 1,
              message: 'Domain layer must not import from infrastructure',
              severity: 'error'
            });
          }
        });
      }
      
      return violations;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // RULE: ARCH-002 — Domain ne doit pas importer application
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'ARCH-002',
    name: 'Domain must not import application',
    severity: 'error',
    check: () => {
      const violations: Violation[] = [];
      const domainDir = path.join(MODULE_ROOT, 'domain');
      
      if (!fs.existsSync(domainDir)) return violations;
      
      const files = getAllTsFiles(domainDir);
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n');
        
        lines.forEach((line, idx) => {
          if (line.includes("from '../application") || 
              line.includes("from '../../application") ||
              line.includes('from "../application') ||
              line.includes('from "../../application')) {
            violations.push({
              rule: 'ARCH-002',
              file: path.relative(MODULE_ROOT, file),
              line: idx + 1,
              message: 'Domain layer must not import from application',
              severity: 'error'
            });
          }
        });
      }
      
      return violations;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // RULE: DDD-001 — Commands must have execute method
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'DDD-001',
    name: 'Command handlers must have execute method',
    severity: 'error',
    check: () => {
      const violations: Violation[] = [];
      const handlersDir = path.join(MODULE_ROOT, 'application', 'commands');
      
      if (!fs.existsSync(handlersDir)) return violations;
      
      const files = getAllTsFiles(handlersDir);
      for (const file of files) {
        if (!file.includes('.handler.ts')) continue;
        
        const content = fs.readFileSync(file, 'utf-8');
        
        if (!content.includes('async execute(') && !content.includes('execute(')) {
          violations.push({
            rule: 'DDD-001',
            file: path.relative(MODULE_ROOT, file),
            message: 'Command handler must have an execute() method',
            severity: 'error'
          });
        }
      }
      
      return violations;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // RULE: COUT-001 — marginAt70 invariant check
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'COUT-001',
    name: 'MarginAt70 must be validated before freeze',
    severity: 'error',
    check: () => {
      const violations: Violation[] = [];
      const domainDir = path.join(MODULE_ROOT, 'domain');
      
      if (!fs.existsSync(domainDir)) return violations;
      
      const files = getAllTsFiles(domainDir);
      let hasMarginValidation = false;
      
      for (const file of files) {
        const content = fs.readFileSync(file, 'utf-8');
        
        // Check for marginAt70 > 0 validation
        if (content.includes('marginAt70') && 
            (content.includes('> 0') || content.includes('>= 0') || content.includes('greaterThan'))) {
          hasMarginValidation = true;
        }
      }
      
      if (!hasMarginValidation) {
        violations.push({
          rule: 'COUT-001',
          file: 'domain/',
          message: 'COUT-001: marginAt70 > 0 validation must exist in domain',
          severity: 'warning'
        });
      }
      
      return violations;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // RULE: MULTI-TENANT-001 — TenantId in aggregates
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'MULTI-TENANT-001',
    name: 'Aggregates must include tenantId',
    severity: 'error',
    check: () => {
      const violations: Violation[] = [];
      const domainDir = path.join(MODULE_ROOT, 'domain');
      
      if (!fs.existsSync(domainDir)) return violations;
      
      const files = getAllTsFiles(domainDir);
      
      for (const file of files) {
        if (!file.includes('.aggregate.ts') && !file.includes('aggregate/')) continue;
        
        const content = fs.readFileSync(file, 'utf-8');
        
        // Skip if it's not an aggregate class
        if (!content.includes('class') || content.includes('.spec.ts')) continue;
        
        if (!content.includes('tenantId')) {
          violations.push({
            rule: 'MULTI-TENANT-001',
            file: path.relative(MODULE_ROOT, file),
            message: 'Aggregate must include tenantId for multi-tenant isolation',
            severity: 'error'
          });
        }
      }
      
      return violations;
    }
  },

  // ─────────────────────────────────────────────────────────────────────────────
  // RULE: CONTRACT-001 — Budget-ready exports must exist
  // ─────────────────────────────────────────────────────────────────────────────
  {
    id: 'CONTRACT-001',
    name: 'Budget-ready exports must be defined',
    severity: 'error',
    check: () => {
      const violations: Violation[] = [];
      
      // Check for budget-ready controller or service
      const apiDir = path.join(MODULE_ROOT, 'api', 'http', 'controllers');
      
      if (!fs.existsSync(apiDir)) {
        violations.push({
          rule: 'CONTRACT-001',
          file: 'api/http/controllers/',
          message: 'Budget-ready controller directory must exist',
          severity: 'warning'
        });
        return violations;
      }
      
      const files = fs.readdirSync(apiDir);
      const hasBudgetReady = files.some(f => 
        f.includes('budget-ready') || f.includes('budget_ready')
      );
      
      if (!hasBudgetReady) {
        violations.push({
          rule: 'CONTRACT-001',
          file: 'api/http/controllers/',
          message: 'Budget-ready controller must exist for COUT-BUD-01 contract',
          severity: 'warning'
        });
      }
      
      return violations;
    }
  }
];

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES
// ═══════════════════════════════════════════════════════════════════════════════

function getAllTsFiles(dir: string): string[] {
  const files: string[] = [];
  
  if (!fs.existsSync(dir)) return files;
  
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    
    if (entry.isDirectory()) {
      if (entry.name !== 'node_modules' && entry.name !== 'dist') {
        files.push(...getAllTsFiles(fullPath));
      }
    } else if (entry.name.endsWith('.ts') && !entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  
  return files;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN
// ═══════════════════════════════════════════════════════════════════════════════

function main() {
  const isReport = process.argv.includes('--report');
  
  console.log(`
╔═══════════════════════════════════════════════════════════════╗
║         Guardian / AGA — Cost-Structure Analysis              ║
╚═══════════════════════════════════════════════════════════════╝
`);

  const allViolations: Violation[] = [];
  
  for (const rule of rules) {
    console.log(`🔍 Checking ${rule.id}: ${rule.name}...`);
    const violations = rule.check();
    allViolations.push(...violations);
    
    if (violations.length === 0) {
      console.log(`   ✅ Pass\n`);
    } else {
      console.log(`   ❌ ${violations.length} violation(s)\n`);
      for (const v of violations) {
        console.log(`      → ${v.file}${v.line ? `:${v.line}` : ''}`);
        console.log(`        ${v.message}\n`);
      }
    }
  }

  // Summary
  const errors = allViolations.filter(v => v.severity === 'error');
  const warnings = allViolations.filter(v => v.severity === 'warning');
  
  console.log(`
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
SUMMARY
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
  Rules checked: ${rules.length}
  Errors:        ${errors.length}
  Warnings:      ${warnings.length}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`);

  if (isReport) {
    const report = {
      timestamp: new Date().toISOString(),
      module: 'cost-structure',
      rules: rules.length,
      violations: allViolations,
      summary: {
        errors: errors.length,
        warnings: warnings.length,
        passed: errors.length === 0
      }
    };
    console.log(JSON.stringify(report, null, 2));
  }

  if (errors.length > 0) {
    console.log('❌ Guardian: Architecture violations detected!');
    process.exit(1);
  }
  
  console.log('✅ Guardian: Architecture conforme');
  process.exit(0);
}

main();
