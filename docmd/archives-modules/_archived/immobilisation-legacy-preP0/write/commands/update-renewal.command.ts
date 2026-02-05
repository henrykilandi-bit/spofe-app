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
  public readonly type = 'UpdateRenewalInfo' as const;
  
  constructor(
    public readonly tenantId: string,
    public readonly assetId: string,
    public readonly renewalDate: string | null, // ISO 8601
    public readonly replacementCost: number | null,
    public readonly currency: string | null,
    public readonly actorId: string,
    public readonly timestamp: Date = new Date()
  ) {}

  static create(data: {
    tenantId: string;
    assetId: string;
    renewalDate?: string;
    replacementCost?: number;
    currency?: string;
    actorId: string;
  }): UpdateRenewalCommand {
    return new UpdateRenewalCommand(
      data.tenantId,
      data.assetId,
      data.renewalDate || null,
      data.replacementCost || null,
      data.currency || null,
      data.actorId
    );
  }
}