/**
 * DTOs pour Write-Side - Module Immobilisation v1.0.0
 */
export declare class CreateAssetDTO {
    assetId: string;
    designation: string;
    description: string | null;
    category: string;
    acquisitionCost: number;
    currency: string;
    acquisitionDate: string;
    serviceStartDate: string;
    usefulLifeMonths: number;
    depreciationMethod: 'LINEAR' | 'DECLINING_BALANCE';
    residualValue: number;
    renewalDate: string | null;
    replacementCost: number | null;
    actorId: string;
}
export declare class UpdateRenewalDTO {
    renewalDate: string | null;
    replacementCost: number | null;
    actorId: string;
}
export declare class AllocateAssetDTO {
    targetType: 'PRODUCT' | 'PROJECT' | 'ACTIVITY';
    targetId: string;
    percentage: number;
    effectiveFrom: string;
    effectiveTo: string | null;
    actorId: string;
}
export declare class RecordDepreciationDTO {
    period: string;
    actorId: string;
}
export declare class RecordMaintenanceDTO {
    date: string;
    cost: number;
    description: string;
    actorId: string;
}
export declare class DisposeAssetDTO {
    disposalDate: string;
    disposalValue: number;
    actorId: string;
}
//# sourceMappingURL=write.dto.d.ts.map