/**
 * AGA — Architecture Guardian Assistant
 * Core architectural types (v0.1)
 *
 * ⚠️ CRITICAL: Ce fichier est la fondation contractuelle d'AGA
 *    Aucune modification sans validation Guardian v4
 */
export declare enum Severity {
    INFO = "info",
    WARNING = "warning",
    ERROR = "error",
    BLOCKER = "blocker"
}
export interface SourceLocation {
    filePath: string;
    line: number;
    column: number;
    endLine?: number;
    endColumn?: number;
}
export interface ArchitectureViolation {
    ruleId: string;
    ruleName: string;
    severity: Severity;
    message: string;
    location: SourceLocation;
    /** Peut être auto-corrigée */
    autoFixable: boolean;
    /** Identifiant logique (Guardian-ready) */
    category: 'import' | 'contract' | 'annotation' | 'layer' | 'naming' | 'pattern' | 'structure' | 'process-coupling';
    /** Contexte optionnel */
    metadata?: Record<string, any>;
}
export interface ArchitectureSuggestion {
    message: string;
    ruleId?: string;
    location?: SourceLocation;
}
export interface FileAnalysisResult {
    filePath: string;
    fileType: string;
    violations: ArchitectureViolation[];
    suggestions: ArchitectureSuggestion[];
    isCompliant: boolean;
}
export interface AnalysisReport {
    summary: {
        totalViolations: number;
        bySeverity: Record<Severity, number>;
        autoFixableCount: number;
    };
    violationsByRule: Record<string, ArchitectureViolation[]>;
    files: FileAnalysisResult[];
    guardianCompatible: boolean;
}
//# sourceMappingURL=architecture.types.d.ts.map