/**
 * Ensemble de règles critiques pour SILC Guardian v4
 * ARCH_030 à ARCH_042
 */

import { ArchitectureRule, RuleContext } from '../types/rule.interface.js';
import { ArchitectureViolation, Severity } from '../types/architecture.types.js';

/* ===== ARCH_030 — AuditTrail Mandatory ===== */
export const ARCH_030_AuditTrailMandatory: ArchitectureRule = {
  id: 'ARCH_030',
  name: 'AuditTrail obligatoire pour toute décision',
  description: 'Every business decision must be recorded in AuditTrail',
  severity: Severity.ERROR,
  targetFileTypes: ['process'],

  check(context: RuleContext): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    if (context.layer !== 'domain' || !context.fileName?.endsWith('.process.ts')) {
      return violations;
    }

    const hasDecision = /decision|APPROVED|REJECTED|ASSIGNED/i.test(context.fileContent);
    const hasAudit = /auditTrail\.log|audit\.record/i.test(context.fileContent);

    if (hasDecision && !hasAudit) {
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: Severity.ERROR,
        message: 'Décision détectée sans auditTrail.log',
        location: {
          filePath: context.filePath,
          line: 1,
          column: 1
        },
        autoFixable: false,
        category: 'contract'
      });
    }

    return violations;
  }
};

/* ===== ARCH_031 — Single Decision ===== */
export const ARCH_031_SingleDecision: ArchitectureRule = {
  id: 'ARCH_031',
  name: 'Un Processus = Une Décision',
  description: 'A process must produce exactly one decision',
  severity: Severity.ERROR,
  targetFileTypes: ['process'],

  check(context: RuleContext): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    // Cibler uniquement les fichiers .process.ts (pas les aggregates, events, invariants)
    if (context.layer !== 'domain' || !context.fileName?.endsWith('.process.ts')) return violations;

    const decisions = (context.fileContent.match(/APPROVED|REJECTED|ASSIGNED|TRANSFERRED|MODIFIED/gi) || []).length;

    if (decisions > 1) {
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: Severity.ERROR,
        message: `Plusieurs décisions détectées (${decisions})`,
        location: {
          filePath: context.filePath,
          line: 1,
          column: 1
        },
        autoFixable: false,
        category: 'structure'
      });
    }

    return violations;
  }
};

/* ===== ARCH_032 — Process Contract Required ===== */
export const ARCH_032_ProcessContractRequired: ArchitectureRule = {
  id: 'ARCH_032',
  name: 'Aucun Processus sans Contrat',
  description: 'Every process must reference an explicit SILC contract',
  severity: Severity.ERROR,
  targetFileTypes: ['process'],

  check(context: RuleContext): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    if (!context.fileName?.endsWith('.process.ts')) return violations;

    const hasContract = /@contract/i.test(context.fileContent);

    if (!hasContract) {
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: Severity.ERROR,
        message: 'Processus détecté sans @contract déclaré',
        location: {
          filePath: context.filePath,
          line: 1,
          column: 1
        },
        autoFixable: true,
        category: 'annotation'
      });
    }

    return violations;
  }
};

/* ===== ARCH_034 — No Direct Entity Mutation ===== */
export const ARCH_034_NoDirectEntityMutation: ArchitectureRule = {
  id: 'ARCH_034',
  name: 'Interdiction de mutation directe d\'entité',
  description: 'Process must not directly mutate entities',
  severity: Severity.ERROR,
  targetFileTypes: ['process'],

  check(context: RuleContext): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    // Cibler uniquement les fichiers .process.ts (pas les aggregates qui gèrent leur propre état)
    if (context.layer !== 'domain' || !context.fileName?.endsWith('.process.ts')) return violations;

    // Heuristique simple : recherche d'assignations directes
    if (/\w+\.\w+\s*=\s/m.test(context.fileContent)) {
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: Severity.ERROR,
        message: 'Mutation directe d\'entité détectée',
        location: {
          filePath: context.filePath,
          line: 1,
          column: 1
        },
        autoFixable: false,
        category: 'pattern'
      });
    }

    return violations;
  }
};

/* ===== ARCH_036 — No Process to Process ===== */
export const ARCH_036_NoProcessToProcess: ArchitectureRule = {
  id: 'ARCH_036',
  name: 'Interdiction Process → Process',
  description: 'Processes must not depend on other processes',
  severity: Severity.ERROR,
  targetFileTypes: ['process'],

  check(context: RuleContext): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    if (!context.fileName?.endsWith('.process.ts')) return violations;

    const imports = context.fileContent.match(/from\s+['"].*\.process['"]|from\s+['"].*\/processes\/['"]|new\s+\w*Process\(/g) || [];

    if (imports.length > 0) {
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: Severity.ERROR,
        message: 'Dépendance entre processus détectée',
        location: {
          filePath: context.filePath,
          line: 1,
          column: 1
        },
        autoFixable: false,
        category: 'process-coupling'
      });
    }

    return violations;
  }
};

/* ===== ARCH_038 — No Technical Events in Domain ===== */
export const ARCH_038_NoTechnicalEventsInDomain: ArchitectureRule = {
  id: 'ARCH_038',
  name: 'Interdiction d\'événements techniques dans le domaine',
  description: 'Domain must not emit technical events',
  severity: Severity.ERROR,
  targetFileTypes: ['unknown'],

  check(context: RuleContext): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    if (context.layer !== 'domain') return violations;

    const technicalPatterns = ['EventEmitter', 'emit(', 'publish(', 'Kafka', 'RabbitMQ'];
    const found = technicalPatterns.some(p => context.fileContent.includes(p));

    if (found) {
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: Severity.ERROR,
        message: 'Événement technique détecté dans le domaine',
        location: {
          filePath: context.filePath,
          line: 1,
          column: 1
        },
        autoFixable: false,
        category: 'layer'
      });
    }

    return violations;
  }
};

/* ===== ARCH_039 — Domain Fact Immutable ===== */
export const ARCH_039_DomainFactImmutable: ArchitectureRule = {
  id: 'ARCH_039',
  name: 'Immutabilité des DomainFacts',
  description: 'DomainFacts must be completely immutable',
  severity: Severity.ERROR,
  targetFileTypes: ['unknown'],

  check(context: RuleContext): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    if (!context.fileName?.includes('Fact')) return violations;

    // Heuristique : recherche de propriétés mutables
    if (/public\s+\w+\s*:/m.test(context.fileContent) && !context.fileContent.includes('readonly')) {
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: Severity.ERROR,
        message: 'Propriété mutable détectée dans un DomainFact',
        location: {
          filePath: context.filePath,
          line: 1,
          column: 1
        },
        autoFixable: false,
        category: 'structure'
      });
    }

    return violations;
  }
};

/* ===== ARCH_040 — Domain Fact Past Tense ===== */
export const ARCH_040_DomainFactPastTense: ArchitectureRule = {
  id: 'ARCH_040',
  name: 'DomainFact nommé au passé',
  description: 'DomainFacts must be named in past tense',
  severity: Severity.WARNING,
  targetFileTypes: ['unknown'],

  check(context: RuleContext): ArchitectureViolation[] {
    const violations: ArchitectureViolation[] = [];

    if (!context.fileName?.includes('Fact')) return violations;

    const className = context.fileName.replace(/\..*$/, '');
    const pastTenseEndings = ['ed', 'Created', 'Assigned', 'Transferred', 'Registered', 'Approved', 'Rejected'];

    if (!pastTenseEndings.some(ending => className.includes(ending))) {
      violations.push({
        ruleId: this.id,
        ruleName: this.name,
        severity: Severity.WARNING,
        message: `DomainFact "${className}" non nommé au passé`,
        location: {
          filePath: context.filePath,
          line: 1,
          column: 1
        },
        autoFixable: false,
        category: 'naming'
      });
    }

    return violations;
  }
};
