"use strict";
/**
 * Cost-Structure Module - Aggregate: DecisionRecord
 * Conformité: COUTFLEX Specification
 * Principe: Append-only, audit trail, immutable
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.DecisionRecord = void 0;
/**
 * DecisionRecord - Aggregate (audit)
 */
class DecisionRecord {
    constructor(decisionId, projectId, tenantId, costStructureVersion, decision, decidedBy, decidedAt, justification) {
        this.decisionId = decisionId;
        this.projectId = projectId;
        this.tenantId = tenantId;
        this.costStructureVersion = costStructureVersion;
        this.decision = decision;
        this.decidedBy = decidedBy;
        this.decidedAt = decidedAt;
        this.justification = justification;
    }
    /**
     * COUT-DEC-01: Créer une décision (autorité humaine)
     * COUT-DEC-02: Décision finale (immutable)
     */
    static createValidation(decisionId, projectId, tenantId, costStructureVersion, decidedBy, justification) {
        if (!decidedBy || decidedBy.trim().length === 0) {
            throw new Error('DECIDED_BY_REQUIRED: Human authority required for validation');
        }
        const now = new Date();
        const aggregate = new DecisionRecord(decisionId, projectId, tenantId, costStructureVersion, 'VALIDATED', decidedBy, now, justification);
        const events = [
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
    static createRejection(decisionId, projectId, tenantId, costStructureVersion, decidedBy, reason) {
        if (!decidedBy || decidedBy.trim().length === 0) {
            throw new Error('DECIDED_BY_REQUIRED: Human authority required for rejection');
        }
        if (!reason || reason.trim().length === 0) {
            throw new Error('REASON_REQUIRED: Justification required for rejection');
        }
        const now = new Date();
        const aggregate = new DecisionRecord(decisionId, projectId, tenantId, costStructureVersion, 'REJECTED', decidedBy, now, reason);
        const events = [
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
    getSummary() {
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
    isFinal() {
        // Toutes les décisions sont finales (append-only)
        return true;
    }
}
exports.DecisionRecord = DecisionRecord;
//# sourceMappingURL=decision-record.aggregate.js.map