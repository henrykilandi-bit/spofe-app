/**
 * Cost-Structure Module - Aggregate: DecisionRecord
 * Conformité: COUTFLEX Specification
 * Principe: Append-only, audit trail, immutable
 */

import { CostStructureEvent } from './events';

export type DecisionType = 'VALIDATED' | 'REJECTED';

/**
 * DecisionRecord - Aggregate (audit)
 */
export class DecisionRecord {
  constructor(
    public readonly decisionId: string,
    public readonly projectId: string,
    public readonly tenantId: string,
    public readonly costStructureVersion: number,
    public readonly decision: DecisionType,
    public readonly decidedBy: string,
    public readonly decidedAt: Date,
    public readonly justification: string
  ) {}

  /**
   * COUT-DEC-01: Créer une décision (autorité humaine)
   * COUT-DEC-02: Décision finale (immutable)
   */
  static createValidation(
    decisionId: string,
    projectId: string,
    tenantId: string,
    costStructureVersion: number,
    decidedBy: string,
    justification: string
  ): { aggregate: DecisionRecord; events: CostStructureEvent[] } {
    if (!decidedBy || decidedBy.trim().length === 0) {
      throw new Error('DECIDED_BY_REQUIRED: Human authority required for validation');
    }

    const now = new Date();
    const aggregate = new DecisionRecord(
      decisionId,
      projectId,
      tenantId,
      costStructureVersion,
      'VALIDATED',
      decidedBy,
      now,
      justification
    );

    const events: CostStructureEvent[] = [
      {
        type: 'ProjectValidated',
        projectId,
        tenantId,
        validatedBy: decidedBy,
        validatedAt: now,
      },
    ];

    return { aggregate, events };
  }

  /**
   * COUT-DEC-01: Créer un rejet (autorité humaine)
   * COUT-DEC-02: Décision finale (immutable)
   */
  static createRejection(
    decisionId: string,
    projectId: string,
    tenantId: string,
    costStructureVersion: number,
    decidedBy: string,
    reason: string
  ): { aggregate: DecisionRecord; events: CostStructureEvent[] } {
    if (!decidedBy || decidedBy.trim().length === 0) {
      throw new Error('DECIDED_BY_REQUIRED: Human authority required for rejection');
    }

    if (!reason || reason.trim().length === 0) {
      throw new Error('REASON_REQUIRED: Justification required for rejection');
    }

    const now = new Date();
    const aggregate = new DecisionRecord(
      decisionId,
      projectId,
      tenantId,
      costStructureVersion,
      'REJECTED',
      decidedBy,
      now,
      reason
    );

    const events: CostStructureEvent[] = [
      {
        type: 'ProjectRejected',
        projectId,
        tenantId,
        reason,
        rejectedBy: decidedBy,
        rejectedAt: now,
      },
    ];

    return { aggregate, events };
  }

  /**
   * Obtenir le résumé pour audit
   */
  getSummary(): {
    decisionId: string;
    projectId: string;
    version: number;
    decision: DecisionType;
    decidedBy: string;
    decidedAt: Date;
    justification: string;
  } {
    return {
      decisionId: this.decisionId,
      projectId: this.projectId,
      version: this.costStructureVersion,
      decision: this.decision,
      decidedBy: this.decidedBy,
      decidedAt: this.decidedAt,
      justification: this.justification,
    };
  }

  /**
   * Vérifier si la décision est finale
   */
  isFinal(): boolean {
    // Toutes les décisions sont finales (append-only)
    return true;
  }
}
