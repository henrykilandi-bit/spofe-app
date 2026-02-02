/**
 * Interface contractuelle d'une règle AGA
 * Toute règle DOIT implémenter cette interface
 */

import {
  ArchitectureViolation,
  ArchitectureSuggestion
} from './architecture.types.js';

/* ===========================
   Contexte fourni à une règle
   =========================== */

export interface RuleContext {
  filePath: string;
  fileContent: string;
  fileName?: string;
  layer?: 'domain' | 'application' | 'infrastructure' | 'unknown';
  fileType?: string;
}

/* ===========================
   Interface d'une règle AGA
   =========================== */

export interface ArchitectureRule {
  /**
   * Identifiant unique de la règle
   * Format: ARCH-NNN
   */
  readonly id: string;

  /**
   * Nom humain lisible
   */
  readonly name: string;

  /**
   * Description courte
   */
  readonly description: string;

  /**
   * Sévérité par défaut de la règle
   */
  readonly severity: ArchitectureViolation['severity'];

  /**
   * Types de fichiers concernés
   * Ex: ['domain-process', 'domain-entity']
   */
  readonly targetFileTypes: string[];

  /**
   * Analyse principale
   */
  check(context: RuleContext): ArchitectureViolation[];

  /**
   * Suggestions optionnelles
   */
  suggest?(context: RuleContext): ArchitectureSuggestion[];
}
