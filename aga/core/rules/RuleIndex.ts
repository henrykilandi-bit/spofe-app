/**
 * Index officiel de toutes les règles AGA
 * Point unique de vérité pour le RuleRegistry
 */

import { ArchitectureRule } from '../types/rule.interface.js';
import { ARCH_001_NoInvalidImports } from './ARCH_001_NoInvalidImports.rule.js';
import { ARCH_002_RequiredAnnotations } from './ARCH_002_RequiredAnnotations.rule.js';
import { ARCH_010_StrictLayering } from './ARCH_010_StrictLayering.rule.js';
import {
  ARCH_030_AuditTrailMandatory,
  ARCH_031_SingleDecision,
  ARCH_032_ProcessContractRequired,
  ARCH_034_NoDirectEntityMutation,
  ARCH_036_NoProcessToProcess,
  ARCH_038_NoTechnicalEventsInDomain,
  ARCH_039_DomainFactImmutable,
  ARCH_040_DomainFactPastTense
} from './ARCH_CRITICAL_RULES.js';

/**
 * Liste officielle de toutes les règles AGA v0.1
 * ✔ Toutes les règles sont actives par défaut
 * ✔ Chaque règle a un ID unique
 * ✔ Chaque règle est indépendante et réutilisable
 */
export const ALL_AGA_RULES: ArchitectureRule[] = [
  ARCH_001_NoInvalidImports,
  ARCH_002_RequiredAnnotations,
  ARCH_010_StrictLayering,
  ARCH_030_AuditTrailMandatory,
  ARCH_031_SingleDecision,
  ARCH_032_ProcessContractRequired,
  ARCH_034_NoDirectEntityMutation,
  ARCH_036_NoProcessToProcess,
  ARCH_038_NoTechnicalEventsInDomain,
  ARCH_039_DomainFactImmutable,
  ARCH_040_DomainFactPastTense
];

export function getRulesIndex(): Map<string, ArchitectureRule> {
  const index = new Map<string, ArchitectureRule>();
  for (const rule of ALL_AGA_RULES) {
    index.set(rule.id, rule);
  }
  return index;
}
