/**
 * Allocate Asset Command
 * Module Immobilisation v1.0.0
 *
 * ⚠️ RÈGLES SPOFE:
 * ✅ DTO pur
 * ❌ Aucune logique métier
 * ❌ Aucun calcul
 * ✅ Validation des inputs par le Guardian uniquement
 */
export class AllocateAssetCommand {
    tenantId;
    allocationId;
    assetId;
    targetType;
    targetId;
    percentage;
    effectiveFrom;
    effectiveTo;
    actorId;
    timestamp;
    type = 'CreateAllocation';
    constructor(tenantId, allocationId, assetId, targetType, targetId, percentage, effectiveFrom, // ISO 8601
    effectiveTo, // ISO 8601
    actorId, timestamp = new Date()) {
        this.tenantId = tenantId;
        this.allocationId = allocationId;
        this.assetId = assetId;
        this.targetType = targetType;
        this.targetId = targetId;
        this.percentage = percentage;
        this.effectiveFrom = effectiveFrom;
        this.effectiveTo = effectiveTo;
        this.actorId = actorId;
        this.timestamp = timestamp;
    }
    static create(data) {
        return new AllocateAssetCommand(data.tenantId, data.allocationId, data.assetId, data.targetType, data.targetId, data.percentage, data.effectiveFrom, data.effectiveTo || null, data.actorId);
    }
}
//# sourceMappingURL=allocate-asset.command.js.map