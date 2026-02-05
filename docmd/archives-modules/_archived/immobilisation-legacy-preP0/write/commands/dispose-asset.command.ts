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
  constructor(
    public readonly tenantId: string,
    public readonly assetId: string,
    public readonly disposalType: 'SALE' | 'SCRAP' | 'EXCHANGE' | 'DONATION',
    public readonly disposalDate: string, // ISO 8601
    public readonly disposalValue: number,
    public readonly currency: string,
    public readonly purchaser: string | null,
    public readonly reason: string,
    public readonly actorId: string,
    public readonly timestamp: Date = new Date()
  ) {}

  static create(data: {
    tenantId: string;
    assetId: string;
    disposalType: 'SALE' | 'SCRAP' | 'EXCHANGE' | 'DONATION';
    disposalDate: string;
    disposalValue: number;
    currency: string;
    purchaser?: string;
    reason: string;
    actorId: string;
  }): DisposeAssetCommand {
    return new DisposeAssetCommand(
      data.tenantId,
      data.assetId,
      data.disposalType,
      data.disposalDate,
      data.disposalValue,
      data.currency,
      data.purchaser || null,
      data.reason,
      data.actorId
    );
  }
}