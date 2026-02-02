/**
 * AGA — Architecture Guardian Assistant
 * Core architectural types (v0.1)
 * 
 * ⚠️ CRITICAL: Ce fichier est la fondation contractuelle d'AGA
 *    Aucune modification sans validation Guardian v4
 */

/* ===========================
   Sévérités
   =========================== */

export enum Severity {
  INFO = 'info',
  WARNING = 'warning',
  ERROR = 'error',
  BLOCKER = 'blocker'
}

/* ===========================
   Position précise dans un fichier
   =========================== */

export interface SourceLocation {
  filePath: string;
  line: number;
  column: number;
  endLine?: number;
  endColumn?: number;
}

/* ===========================
   Violation d'architecture
   =========================== */

export interface ArchitectureViolation {
  ruleId: string;
  ruleName: string;
  severity: Severity;
  message: string;
  location: SourceLocation;

  /** Peut être auto-corrigée */
  autoFixable: boolean;

  /** Identifiant logique (Guardian-ready) */
  category:
    | 'import'
    | 'contract'
    | 'annotation'
    | 'layer'
    | 'naming'
    | 'pattern'
    | 'structure'
    | 'process-coupling';

  /** Contexte optionnel */
  metadata?: Record<string, any>;
}

/* ===========================
   Suggestion non bloquante
   =========================== */

export interface ArchitectureSuggestion {
  message: string;
  ruleId?: string;
  location?: SourceLocation;
}

/* ===========================
   Résultat d'analyse d'un fichier
   =========================== */

export interface FileAnalysisResult {
  filePath: string;
  fileType: string;

  violations: ArchitectureViolation[];
  suggestions: ArchitectureSuggestion[];

  isCompliant: boolean;
}

/* ===========================
   Rapport enrichi (groupé)
   =========================== */

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
