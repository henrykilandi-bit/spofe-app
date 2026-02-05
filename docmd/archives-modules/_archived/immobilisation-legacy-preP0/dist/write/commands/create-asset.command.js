/**
 * Create Asset Command
 * Module Immobilisation v1.0.0
 *
 * ⚠️ RÈGLES SPOFE:
 * ✅ DTO pur
 * ❌ Aucune logique métier
 * ❌ Aucun calcul
 * ✅ Validation des inputs par le Guardian uniquement
 */
export class CreateAssetCommand {
    tenantId;
    assetId;
    designation;
    description;
    category;
    acquisitionCost;
    currency;
    acquisitionDate;
    serviceStartDate;
    usefulLifeMonths;
    depreciationMethod;
    residualValue;
    renewalDate;
    replacementCost;
    actorId;
    timestamp;
    type = 'CreateAsset';
    constructor(tenantId, assetId, designation, description, category, acquisitionCost, currency, acquisitionDate, // ISO 8601
    serviceStartDate, // ISO 8601
    usefulLifeMonths, depreciationMethod, residualValue, renewalDate, // ISO 8601
    replacementCost, actorId, timestamp = new Date()) {
        this.tenantId = tenantId;
        this.assetId = assetId;
        this.designation = designation;
        this.description = description;
        this.category = category;
        this.acquisitionCost = acquisitionCost;
        this.currency = currency;
        this.acquisitionDate = acquisitionDate;
        this.serviceStartDate = serviceStartDate;
        this.usefulLifeMonths = usefulLifeMonths;
        this.depreciationMethod = depreciationMethod;
        this.residualValue = residualValue;
        this.renewalDate = renewalDate;
        this.replacementCost = replacementCost;
        this.actorId = actorId;
        this.timestamp = timestamp;
    }
    static create(data) {
        return new CreateAssetCommand(data.tenantId, data.assetId, data.designation, data.description || null, data.category, data.acquisitionCost, data.currency, data.acquisitionDate, data.serviceStartDate, data.usefulLifeMonths, data.depreciationMethod, data.residualValue, data.renewalDate || null, data.replacementCost || null, data.actorId);
    }
}
//# sourceMappingURL=create-asset.command.js.map