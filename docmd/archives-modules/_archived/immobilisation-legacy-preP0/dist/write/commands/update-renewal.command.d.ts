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
export declare class UpdateRenewalCommand {
    readonly tenantId: string;
    readonly assetId: string;
    readonly renewalDate: string | null;
    readonly replacementCost: number | null;
    readonly currency: string | null;
    readonly actorId: string;
    readonly timestamp: Date;
    readonly type: "UpdateRenewalInfo";
    constructor(tenantId: string, assetId: string, renewalDate: string | null, // ISO 8601
    replacementCost: number | null, currency: string | null, actorId: string, timestamp?: Date);
    static create(data: {
        tenantId: string;
        assetId: string;
        renewalDate?: string;
        replacementCost?: number;
        currency?: string;
        actorId: string;
    }): UpdateRenewalCommand;
}
//# sourceMappingURL=update-renewal.command.d.ts.map