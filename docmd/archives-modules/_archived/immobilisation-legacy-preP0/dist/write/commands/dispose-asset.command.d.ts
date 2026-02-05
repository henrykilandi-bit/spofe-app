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
export declare class DisposeAssetCommand {
    readonly tenantId: string;
    readonly assetId: string;
    readonly disposalType: 'SALE' | 'SCRAP' | 'EXCHANGE' | 'DONATION';
    readonly disposalDate: string;
    readonly disposalValue: number;
    readonly currency: string;
    readonly purchaser: string | null;
    readonly reason: string;
    readonly actorId: string;
    readonly timestamp: Date;
    constructor(tenantId: string, assetId: string, disposalType: 'SALE' | 'SCRAP' | 'EXCHANGE' | 'DONATION', disposalDate: string, // ISO 8601
    disposalValue: number, currency: string, purchaser: string | null, reason: string, actorId: string, timestamp?: Date);
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
    }): DisposeAssetCommand;
}
//# sourceMappingURL=dispose-asset.command.d.ts.map