/**
 * Record Depreciation Command
 * Module Immobilisation v1.0.0
 *
 * ⚠️ RÈGLES SPOFE:
 * ✅ DTO pur
 * ❌ Aucune logique métier
 * ❌ Aucun calcul
 * ✅ Validation des inputs par le Guardian uniquement
 */
export declare class RecordDepreciationCommand {
    readonly tenantId: string;
    readonly assetId: string;
    readonly period: string;
    readonly actorId: string;
    readonly timestamp: Date;
    readonly type: "RecordDepreciation";
    constructor(tenantId: string, assetId: string, period: string, // YYYY-MM
    actorId: string, timestamp?: Date);
    static create(data: {
        tenantId: string;
        assetId: string;
        period: string;
        actorId: string;
    }): RecordDepreciationCommand;
}
/**
 * Calculate Depreciation Batch Command
 * Pour calculer les amortissements de tous les assets d'une période
 */
export declare class CalculateDepreciationBatchCommand {
    readonly tenantId: string;
    readonly period: string;
    readonly assetIds: string[] | null;
    readonly actorId: string;
    readonly timestamp: Date;
    readonly type: "CalculateDepreciations";
    constructor(tenantId: string, period: string, // YYYY-MM
    assetIds: string[] | null, // Si null, tous les assets IN_SERVICE
    actorId: string, timestamp?: Date);
    static create(data: {
        tenantId: string;
        period: string;
        assetIds?: string[];
        actorId: string;
    }): CalculateDepreciationBatchCommand;
}
//# sourceMappingURL=record-depreciation.command.d.ts.map