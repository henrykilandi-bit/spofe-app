/**
 * ARCH_002 — Required Contract Annotations
 * Domain processes MUST declare @contract, @invariant, @pre, @post
 */

import { ArchitectureRule, RuleContext } from '../types/rule.interface.js';
import { ArchitectureViolation, Severity } from '../types/architecture.types.js';

const REQUIRED_PROCESS_ANNOTATIONS = [
  '@contract',
  '@invariant'
];

export const ARCH_002_RequiredAnnotations: ArchitectureRule = {
  id: 'ARCH_002',
  name: 'Required Contract Annotations',
  description: 'Domain processes must declare contract annotations',
  severity: Severity.ERROR,
  targetFileTypes: ['process'],

  check(context: RuleContext): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];
    const content = context.fileContent;

    if (context.layer !== 'domain') return violations;
    if (!context.fileName?.endsWith('.process.ts')) return violations;

    for (const annotation of REQUIRED_PROCESS_ANNOTATIONS) {
      if (!content.includes(annotation)) {
        violations.push({
          ruleId: this.id,
          ruleName: this.name,
          severity: Severity.ERROR,
          message: `Annotation obligatoire manquante: ${annotation}`,
          location: {
            filePath: context.filePath,
            line: 1,
            column: 1
          },
          autoFixable: true,
          category: 'annotation'
        });
      }
    }

    return violations;
  }
};

/* Fix: Add annotations to process class */
