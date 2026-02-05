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
export declare class RecordMaintenanceCommand {
    readonly tenantId: string;
    readonly maintenanceId: string;
    readonly assetId: string;
    readonly maintenanceType: 'PREVENTIVE' | 'CORRECTIVE' | 'UPGRADE';
    readonly description: string;
    readonly cost: number;
    readonly currency: string;
    readonly maintenanceDate: string;
    readonly vendor: string | null;
    readonly actorId: string;
    readonly timestamp: Date;
    readonly type: "RecordMaintenance";
    constructor(tenantId: string, maintenanceId: string, assetId: string, maintenanceType: 'PREVENTIVE' | 'CORRECTIVE' | 'UPGRADE', description: string, cost: number, currency: string, maintenanceDate: string, // ISO 8601
    vendor: string | null, actorId: string, timestamp?: Date);
    static create(data: {
        tenantId: string;
        maintenanceId: string;
        assetId: string;
        type: 'PREVENTIVE' | 'CORRECTIVE' | 'UPGRADE';
        description: string;
        cost: number;
        currency: string;
        maintenanceDate: string;
        vendor?: string;
        actorId: string;
    }): RecordMaintenanceCommand;
}
//# sourceMappingURL=record-maintenance.command.d.ts.map