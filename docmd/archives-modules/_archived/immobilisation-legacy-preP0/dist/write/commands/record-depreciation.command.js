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
export class RecordDepreciationCommand {
    tenantId;
    assetId;
    period;
    actorId;
    timestamp;
    type = 'RecordDepreciation';
    constructor(tenantId, assetId, period, // YYYY-MM
    actorId, timestamp = new Date()) {
        this.tenantId = tenantId;
        this.assetId = assetId;
        this.period = period;
        this.actorId = actorId;
        this.timestamp = timestamp;
    }
    static create(data) {
        return new RecordDepreciationCommand(data.tenantId, data.assetId, data.period, data.actorId);
    }
}
/**
 * Calculate Depreciation Batch Command
 * Pour calculer les amortissements de tous les assets d'une période
 */
export class CalculateDepreciationBatchCommand {
    tenantId;
    period;
    assetIds;
    actorId;
    timestamp;
    type = 'CalculateDepreciations';
    constructor(tenantId, period, // YYYY-MM
    assetIds, // Si null, tous les assets IN_SERVICE
    actorId, timestamp = new Date()) {
        this.tenantId = tenantId;
        this.period = period;
        this.assetIds = assetIds;
        this.actorId = actorId;
        this.timestamp = timestamp;
    }
    static create(data) {
        return new CalculateDepreciationBatchCommand(data.tenantId, data.period, data.assetIds || null, data.actorId);
    }
}
//# sourceMappingURL=record-depreciation.command.js.map