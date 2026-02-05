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
  public readonly type = 'CreateAllocation' as const;
  
  constructor(
    public readonly tenantId: string,
    public readonly allocationId: string,
    public readonly assetId: string,
    public readonly targetType: 'PRODUCT' | 'SERVICE' | 'PROJECT',
    public readonly targetId: string,
    public readonly percentage: number,
    public readonly effectiveFrom: string, // ISO 8601
    public readonly effectiveTo: string | null, // ISO 8601
    public readonly actorId: string,
    public readonly timestamp: Date = new Date()
  ) {}

  static create(data: {
    tenantId: string;
    allocationId: string;
    assetId: string;
    targetType: 'PRODUCT' | 'SERVICE' | 'PROJECT';
    targetId: string;
    percentage: number;
    effectiveFrom: string;
    effectiveTo?: string;
    actorId: string;
  }): AllocateAssetCommand {
    return new AllocateAssetCommand(
      data.tenantId,
      data.allocationId,
      data.assetId,
      data.targetType,
      data.targetId,
      data.percentage,
      data.effectiveFrom,
      data.effectiveTo || null,
      data.actorId
    );
  }
}