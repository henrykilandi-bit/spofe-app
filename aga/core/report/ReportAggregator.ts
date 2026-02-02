/**
 * Agrégateur de rapports
 * Transforme violations plates en vision architecturale
 */

import { ArchitectureViolation } from '../types/architecture.types.js';
import { EnrichedReport, FileReport, RuleGroup, SeverityGroup } from './ReportTypes.js';

export class ReportAggregator {

  static build(
    filesAnalyzed: number,
    violations: ArchitectureViolation[]
  ): EnrichedReport {

    const byFileMap = new Map<string, ArchitectureViolation[]>();
    const byRuleMap = new Map<string, RuleGroup>();
    const bySeverityMap = new Map<string, SeverityGroup>();

    // Grouper les violations
    for (const v of violations) {
      // Par fichier
      if (!byFileMap.has(v.location.filePath)) {
        byFileMap.set(v.location.filePath, []);
      }
      byFileMap.get(v.location.filePath)!.push(v);

      // Par règle
      if (!byRuleMap.has(v.ruleId)) {
        byRuleMap.set(v.ruleId, {
          ruleId: v.ruleId,
          ruleName: v.ruleName,
          severity: v.severity,
          occurrences: []
        });
      }
      byRuleMap.get(v.ruleId)!.occurrences.push(v);

      // Par sévérité
      if (!bySeverityMap.has(v.severity)) {
        bySeverityMap.set(v.severity, {
          severity: v.severity,
          count: 0,
          rules: []
        });
      }
      bySeverityMap.get(v.severity)!.count++;
    }

    // Rattacher règles → sévérités
    for (const rule of byRuleMap.values()) {
      bySeverityMap.get(rule.severity)!.rules.push(rule);
    }

    return {
      timestamp: new Date().toISOString(),
      totalFilesAnalyzed: filesAnalyzed,
      totalViolations: violations.length,
      bySeverity: Array.from(bySeverityMap.values()),
      byRule: Array.from(byRuleMap.values()),
      byFile: Array.from(byFileMap.entries()).map(
        ([filePath, violations]) => ({
          filePath,
          violations
        })
      ),
      isCompliant: violations.length === 0
    };
  }
}
