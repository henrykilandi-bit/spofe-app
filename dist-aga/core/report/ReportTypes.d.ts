/**
 * Types et interfaces pour les rapports enrichis AGA
 */
import { ArchitectureViolation } from '../types/architecture.types.js';
export interface FileReport {
    filePath: string;
    violations: ArchitectureViolation[];
}
export interface RuleGroup {
    ruleId: string;
    ruleName: string;
    severity: string;
    occurrences: ArchitectureViolation[];
}
export interface SeverityGroup {
    severity: string;
    count: number;
    rules: RuleGroup[];
}
export interface EnrichedReport {
    timestamp: string;
    totalFilesAnalyzed: number;
    totalViolations: number;
    bySeverity: SeverityGroup[];
    byRule: RuleGroup[];
    byFile: FileReport[];
    isCompliant: boolean;
}
//# sourceMappingURL=ReportTypes.d.ts.map