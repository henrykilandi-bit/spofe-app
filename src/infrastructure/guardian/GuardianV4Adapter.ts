// ==================================================================================
// GuardianV4Adapter
// Adaptateur qui implémente GuardianPort en wrappant SilcGuardian
// ==================================================================================

import {
  GuardianPort,
  GuardianVerdict,
  VIOLATION_CODES,
} from '../../application/transaction/GuardianPort';
import { SilcGuardian } from './GuardianInstance';

/**
 * Adapter permettant à TransactionManager de communiquer avec SilcGuardian v4
 * via l'interface GuardianPort (abstraction)
 *
 * Responsabilités:
 * - Traduction des types entre TransactionManager et SilcGuardian
 * - Capture de la version des invariants
 * - Génération du checksum pour l'audit
 * - Mappage des codes de violation
 */
export class GuardianV4Adapter implements GuardianPort {
  constructor(private readonly guardian: SilcGuardian) {
    if (!guardian) {
      throw new Error('SilcGuardian instance is required');
    }
  }

  /**
   * Validation d'une mutation via Guardian v4
   */
  async validateMutation(input: any): Promise<GuardianVerdict> {
    return this.validateDecision(input);
  }

  /**
   * Valide une décision via SilcGuardian v4
   *
   * @param input Décision à valider (processName, decisionType, actorRole, payload, context)
   * @returns Verdict contenant ok/violationCode et (si ok) invariantVersion + checksum
   *
   * Pipeline:
   * 1. Appelle guardian.validateDecision()
   * 2. Si rejeté: retourne violationCode
   * 3. Si accepté: retourne invariantVersion + checksum
   */
  validateDecision(input: {
    processName: string;
    decisionType: string;
    actorRole: string;
    payload: unknown;
    context: unknown;
  }): GuardianVerdict {
    // Validation des inputs minimale
    if (!input.processName || typeof input.processName !== 'string') {
      return {
        ok: false,
        violationCode: VIOLATION_CODES.INVALID_PROCESS,
      };
    }

    if (!input.actorRole || typeof input.actorRole !== 'string') {
      return {
        ok: false,
        violationCode: VIOLATION_CODES.INVALID_ACTOR,
      };
    }

    if (!input.decisionType || typeof input.decisionType !== 'string') {
      return {
        ok: false,
        violationCode: VIOLATION_CODES.INVALID_DECISION_TYPE,
      };
    }

    // Appel à SilcGuardian v4
    let guardianResult;
    try {
      guardianResult = this.guardian.validateDecision({
        process: input.processName,
        decisionType: input.decisionType,
        actorRole: input.actorRole,
        payload: input.payload,
        context: input.context,
      });
    } catch (err) {
      console.error('GuardianV4 validation error:', err);
      return {
        ok: false,
        violationCode: VIOLATION_CODES.INTERNAL_ERROR,
      };
    }

    // Mappage du résultat Guardian → GuardianVerdict
    if (!guardianResult.ok) {
      // Guardian a rejeté la décision
      return {
        ok: false,
        violationCode: this.mapViolationCode(guardianResult.violationCode),
      };
    }

    // Guardian a accepté: générer le verdict avec checksum
    return {
      ok: true,
      invariantVersion: guardianResult.invariantVersion || '4',
      checksum: guardianResult.auditChecksum || this.generateChecksum(input),
    };
  }

  /**
   * Mappe les codes de violation Guardian → VIOLATION_CODES
   * Permet une évolution indépendante de SilcGuardian
   */
  private mapViolationCode(guardianCode: string): string {
    const mapping: Record<string, string> = {
      'UNKNOWN_PROCESS': VIOLATION_CODES.INVALID_PROCESS,
      'UNAUTHORIZED_ROLE': VIOLATION_CODES.INVALID_ACTOR,
      'INVALID_DECISION_TYPE': VIOLATION_CODES.INVALID_DECISION_TYPE,
      'INVARIANT_VIOLATION': VIOLATION_CODES.INVARIANT_VIOLATION,
      'NON_REGRESSION_FAILURE': VIOLATION_CODES.REGRESSION_DETECTED,
      'IMPLICIT_AUTHORITY': VIOLATION_CODES.IMPLICIT_AUTHORITY,
      'PROCESS_NOT_FOUND': VIOLATION_CODES.INVALID_PROCESS,
      'ROLE_NOT_AUTHORIZED': VIOLATION_CODES.INVALID_ACTOR,
    };

    return mapping[guardianCode] || VIOLATION_CODES.INTERNAL_ERROR;
  }

  /**
   * Génère un checksum pour audit si Guardian ne l'a pas fourni
   * Format: sha256(processName + decisionType + actorRole + timestamp)
   */
  private generateChecksum(input: {
    processName: string;
    decisionType: string;
    actorRole: string;
    payload: unknown;
    context: unknown;
  }): string {
    // Import crypto (Node.js built-in)
    const crypto = require('crypto');

    const data = JSON.stringify({
      processName: input.processName,
      decisionType: input.decisionType,
      actorRole: input.actorRole,
      timestamp: new Date().toISOString(),
    });

    return (
      'sha256:' +
      crypto
        .createHash('sha256')
        .update(data)
        .digest('hex')
    );
  }
}
