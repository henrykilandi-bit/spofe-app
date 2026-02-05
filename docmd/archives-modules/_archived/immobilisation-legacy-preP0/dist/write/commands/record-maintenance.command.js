/**
 * Record Maintenance Command
 * Module Immobilisation v1.0.0
 *
 * ⚠️ RÈGLES SPOFE:
 * ✅ DTO pur
 * ❌ Aucune logique métier
 * ❌ Aucun calcul
 * ✅ Validation des inputs par le Guardian uniquement
 */
export class RecordMaintenanceCommand {
    tenantId;
    maintenanceId;
    assetId;
    maintenanceType;
    description;
    cost;
    currency;
    maintenanceDate;
    vendor;
    actorId;
    timestamp;
    type = 'RecordMaintenance';
    constructor(tenantId, maintenanceId, assetId, maintenanceType, description, cost, currency, maintenanceDate, // ISO 8601
    vendor, actorId, timestamp = new Date()) {
        this.tenantId = tenantId;
        this.maintenanceId = maintenanceId;
        this.assetId = assetId;
        this.maintenanceType = maintenanceType;
        this.description = description;
        this.cost = cost;
        this.currency = currency;
        this.maintenanceDate = maintenanceDate;
        this.vendor = vendor;
        this.actorId = actorId;
        this.timestamp = timestamp;
    }
    static create(data) {
        return new RecordMaintenanceCommand(data.tenantId, data.maintenanceId, data.assetId, data.type, data.description, data.cost, data.currency, data.maintenanceDate, data.vendor || null, data.actorId);
    }
}
//# sourceMappingURL=record-maintenance.command.js.map