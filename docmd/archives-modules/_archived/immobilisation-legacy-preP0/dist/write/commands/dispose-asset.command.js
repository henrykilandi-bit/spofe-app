/**
 * Dispose Asset Command
 * Module Immobilisation v1.0.0
 *
 * ⚠️ RÈGLES SPOFE:
 * ✅ DTO pur
 * ❌ Aucune logique métier
 * ❌ Aucun calcul
 * ✅ Validation des inputs par le Guardian uniquement
 */
export class DisposeAssetCommand {
    tenantId;
    assetId;
    disposalType;
    disposalDate;
    disposalValue;
    currency;
    purchaser;
    reason;
    actorId;
    timestamp;
    constructor(tenantId, assetId, disposalType, disposalDate, // ISO 8601
    disposalValue, currency, purchaser, reason, actorId, timestamp = new Date()) {
        this.tenantId = tenantId;
        this.assetId = assetId;
        this.disposalType = disposalType;
        this.disposalDate = disposalDate;
        this.disposalValue = disposalValue;
        this.currency = currency;
        this.purchaser = purchaser;
        this.reason = reason;
        this.actorId = actorId;
        this.timestamp = timestamp;
    }
    static create(data) {
        return new DisposeAssetCommand(data.tenantId, data.assetId, data.disposalType, data.disposalDate, data.disposalValue, data.currency, data.purchaser || null, data.reason, data.actorId);
    }
}
//# sourceMappingURL=dispose-asset.command.js.map