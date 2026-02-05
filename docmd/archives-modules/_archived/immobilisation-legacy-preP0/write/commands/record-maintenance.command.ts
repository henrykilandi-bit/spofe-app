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
  public readonly type = 'RecordMaintenance' as const;
  
  constructor(
    public readonly tenantId: string,
    public readonly maintenanceId: string,
    public readonly assetId: string,
    public readonly maintenanceType: 'PREVENTIVE' | 'CORRECTIVE' | 'UPGRADE',
    public readonly description: string,
    public readonly cost: number,
    public readonly currency: string,
    public readonly maintenanceDate: string, // ISO 8601
    public readonly vendor: string | null,
    public readonly actorId: string,
    public readonly timestamp: Date = new Date()
  ) {}

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
  }): RecordMaintenanceCommand {
    return new RecordMaintenanceCommand(
      data.tenantId,
      data.maintenanceId,
      data.assetId,
      data.type,
      data.description,
      data.cost,
      data.currency,
      data.maintenanceDate,
      data.vendor || null,
      data.actorId
    );
  }
}