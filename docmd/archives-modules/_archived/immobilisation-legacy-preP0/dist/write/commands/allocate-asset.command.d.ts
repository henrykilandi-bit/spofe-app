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
export declare class AllocateAssetCommand {
    readonly tenantId: string;
    readonly allocationId: string;
    readonly assetId: string;
    readonly targetType: 'PRODUCT' | 'SERVICE' | 'PROJECT';
    readonly targetId: string;
    readonly percentage: number;
    readonly effectiveFrom: string;
    readonly effectiveTo: string | null;
    readonly actorId: string;
    readonly timestamp: Date;
    readonly type: "CreateAllocation";
    constructor(tenantId: string, allocationId: string, assetId: string, targetType: 'PRODUCT' | 'SERVICE' | 'PROJECT', targetId: string, percentage: number, effectiveFrom: string, // ISO 8601
    effectiveTo: string | null, // ISO 8601
    actorId: string, timestamp?: Date);
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
    }): AllocateAssetCommand;
}
//# sourceMappingURL=allocate-asset.command.d.ts.map