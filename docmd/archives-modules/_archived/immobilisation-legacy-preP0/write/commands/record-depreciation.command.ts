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
  public readonly type = 'RecordDepreciation' as const;
  
  constructor(
    public readonly tenantId: string,
    public readonly assetId: string,
    public readonly period: string, // YYYY-MM
    public readonly actorId: string,
    public readonly timestamp: Date = new Date()
  ) {}

  static create(data: {
    tenantId: string;
    assetId: string;
    period: string;
    actorId: string;
  }): RecordDepreciationCommand {
    return new RecordDepreciationCommand(
      data.tenantId,
      data.assetId,
      data.period,
      data.actorId
    );
  }
}

/**
 * Calculate Depreciation Batch Command
 * Pour calculer les amortissements de tous les assets d'une période
 */
export class CalculateDepreciationBatchCommand {
  public readonly type = 'CalculateDepreciations' as const;
  
  constructor(
    public readonly tenantId: string,
    public readonly period: string, // YYYY-MM
    public readonly assetIds: string[] | null, // Si null, tous les assets IN_SERVICE
    public readonly actorId: string,
    public readonly timestamp: Date = new Date()
  ) {}

  static create(data: {
    tenantId: string;
    period: string;
    assetIds?: string[];
    actorId: string;
  }): CalculateDepreciationBatchCommand {
    return new CalculateDepreciationBatchCommand(
      data.tenantId,
      data.period,
      data.assetIds || null,
      data.actorId
    );
  }
}