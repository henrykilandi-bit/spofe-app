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
export declare class DecisionRecord {
    readonly decisionId: string;
    readonly projectId: string;
    readonly tenantId: string;
    readonly costStructureVersion: number;
    readonly decision: DecisionType;
    readonly decidedBy: string;
    readonly decidedAt: Date;
    readonly justification: string;
    constructor(decisionId: string, projectId: string, tenantId: string, costStructureVersion: number, decision: DecisionType, decidedBy: string, decidedAt: Date, justification: string);
    /**
     * COUT-DEC-01: Créer une décision (autorité humaine)
     * COUT-DEC-02: Décision finale (immutable)
     */
    static createValidation(decisionId: string, projectId: string, tenantId: string, costStructureVersion: number, decidedBy: string, justification: string): {
        aggregate: DecisionRecord;
        events: CostStructureEvent[];
    };
    /**
     * COUT-DEC-01: Créer un rejet (autorité humaine)
     * COUT-DEC-02: Décision finale (immutable)
     */
    static createRejection(decisionId: string, projectId: string, tenantId: string, costStructureVersion: number, decidedBy: string, reason: string): {
        aggregate: DecisionRecord;
        events: CostStructureEvent[];
    };
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
    };
    /**
     * Vérifier si la décision est finale
     */
    isFinal(): boolean;
}
//# sourceMappingURL=decision-record.aggregate.d.ts.map