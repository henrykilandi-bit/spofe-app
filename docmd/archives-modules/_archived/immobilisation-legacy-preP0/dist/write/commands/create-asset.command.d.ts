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
export declare class CreateAssetCommand {
    readonly tenantId: string;
    readonly assetId: string;
    readonly designation: string;
    readonly description: string | null;
    readonly category: string;
    readonly acquisitionCost: number;
    readonly currency: string;
    readonly acquisitionDate: string;
    readonly serviceStartDate: string;
    readonly usefulLifeMonths: number;
    readonly depreciationMethod: 'LINEAR' | 'DECLINING_BALANCE';
    readonly residualValue: number;
    readonly renewalDate: string | null;
    readonly replacementCost: number | null;
    readonly actorId: string;
    readonly timestamp: Date;
    readonly type: "CreateAsset";
    constructor(tenantId: string, assetId: string, designation: string, description: string | null, category: string, acquisitionCost: number, currency: string, acquisitionDate: string, // ISO 8601
    serviceStartDate: string, // ISO 8601
    usefulLifeMonths: number, depreciationMethod: 'LINEAR' | 'DECLINING_BALANCE', residualValue: number, renewalDate: string | null, // ISO 8601
    replacementCost: number | null, actorId: string, timestamp?: Date);
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
    }): CreateAssetCommand;
}
//# sourceMappingURL=create-asset.command.d.ts.map