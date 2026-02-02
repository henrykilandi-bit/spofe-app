/**
 * ARCH_001 — Import Architecture
 * Interdit @/errors/* au profit de @/domain/errors/*
 */

import { ArchitectureRule, RuleContext } from '../types/rule.interface.js';
import { ArchitectureViolation, Severity } from '../types/architecture.types.js';

export const ARCH_001_NoInvalidImports: ArchitectureRule = {
  id: 'ARCH_001',
  name: 'No Invalid Import Paths',
  description: 'Enforce correct import paths for domain modules',
  severity: Severity.ERROR,
  targetFileTypes: ['unknown'],

  check(context: RuleContext): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    const content = context.fileContent;

    // ❌ Import direct vers /errors
    if (content.includes("from '@/errors")) {
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: Severity.ERROR,
        message: 'Import interdit depuis "@/errors". Utilisez "@/domain/errors".',
        location: {
          filePath: context.filePath,
          line: 1,
          column: 1
        },
        autoFixable: true,
        category: 'import'
      });
    }

    // ❌ Import relatif vers errors
    if (content.includes("from '../errors.js")) {
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: Severity.ERROR,
        message: 'Import relatif vers errors interdit. Utilisez "@/domain/errors".',
        location: {
          filePath: context.filePath,
          line: 1,
          column: 1
        },
        autoFixable: true,
        category: 'import'
      });
    }

    return violations;
  }
};
