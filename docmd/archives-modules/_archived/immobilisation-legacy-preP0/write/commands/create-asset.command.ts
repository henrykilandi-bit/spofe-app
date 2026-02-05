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
  public readonly type = 'CreateAsset' as const;
  
  constructor(
    public readonly tenantId: string,
    public readonly assetId: string,
    public readonly designation: string,
    public readonly description: string | null,
    public readonly category: string,
    public readonly acquisitionCost: number,
    public readonly currency: string,
    public readonly acquisitionDate: string, // ISO 8601
    public readonly serviceStartDate: string, // ISO 8601
    public readonly usefulLifeMonths: number,
    public readonly depreciationMethod: 'LINEAR' | 'DECLINING_BALANCE',
    public readonly residualValue: number,
    public readonly renewalDate: string | null, // ISO 8601
    public readonly replacementCost: number | null,
    public readonly actorId: string,
    public readonly timestamp: Date = new Date()
  ) {}

  static create(data: {
    tenantId: string;
    assetId: string;
    designation: string;
    description?: string;
    category: string;
    acquisitionCost: number;
    currency: string;
    acquisitionDate: string;
    serviceStartDate: string;
    usefulLifeMonths: number;
    depreciationMethod: 'LINEAR' | 'DECLINING_BALANCE';
    residualValue: number;
    renewalDate?: string;
    replacementCost?: number;
    actorId: string;
  }): CreateAssetCommand {
    return new CreateAssetCommand(
      data.tenantId,
      data.assetId,
      data.designation,
      data.description || null,
      data.category,
      data.acquisitionCost,
      data.currency,
      data.acquisitionDate,
      data.serviceStartDate,
      data.usefulLifeMonths,
      data.depreciationMethod,
      data.residualValue,
      data.renewalDate || null,
      data.replacementCost || null,
      data.actorId
    );
  }
}