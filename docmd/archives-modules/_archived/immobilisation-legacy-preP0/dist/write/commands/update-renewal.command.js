/**
 * Update Renewal Command
 * Module Immobilisation v1.0.0
 *
 * ⚠️ RÈGLES SPOFE:
 * ✅ DTO pur
 * ❌ Aucune logique métier
 * ❌ Aucun calcul
 * ✅ Validation des inputs par le Guardian uniquement
 */
export class UpdateRenewalCommand {
    tenantId;
    assetId;
    renewalDate;
    replacementCost;
    currency;
    actorId;
    timestamp;
    type = 'UpdateRenewalInfo';
    constructor(tenantId, assetId, renewalDate, // ISO 8601
    replacementCost, currency, actorId, timestamp = new Date()) {
        this.tenantId = tenantId;
        this.assetId = assetId;
        this.renewalDate = renewalDate;
        this.replacementCost = replacementCost;
        this.currency = currency;
        this.actorId = actorId;
        this.timestamp = timestamp;
    }
    static create(data) {
        return new UpdateRenewalCommand(data.tenantId, data.assetId, data.renewalDate || null, data.replacementCost || null, data.currency || null, data.actorId);
    }
}
//# sourceMappingURL=update-renewal.command.js.map