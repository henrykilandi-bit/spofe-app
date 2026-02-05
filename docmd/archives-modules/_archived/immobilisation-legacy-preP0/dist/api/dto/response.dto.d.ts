/**
 * Immobilisation Module - API Response DTOs
 * Conformité: API_READ_ONLY.md v1.0.0
 *
 * DTOs pour les réponses API (read-only).
 */
/**
 * Réponse paginée générique
 */
export declare class PaginatedResponseDTO<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}
/**
 * DTO pour un actif dans la liste
 */
export declare class AssetListItemDTO {
    assetId: string;
    acquisitionCost: number;
    currency: string;
    acquisitionDate: string;
    usefulLifeMonths: number;
    depreciationMethod: string;
    residualValue: number;
    renewalDate?: string;
    replacementCost?: number;
    status: string;
    createdAt: string;
}
/**
 * DTO pour la VNC d'un actif
 */
export declare class AssetNetBookValueDTO {
    assetId: string;
    acquisitionCost: number;
    residualValue: number;
    accumulatedDepreciation: number;
    netBookValue: number;
    currency: string;
    status: string;
    lastPeriod?: string;
}
/**
 * DTO pour le détail complet d'un actif
 */
export declare class AssetDetailDTO {
    asset: AssetListItemDTO;
    netBookValue: AssetNetBookValueDTO;
    depreciationHistory: DepreciationHistoryItemDTO[];
    maintenanceHistory: MaintenanceHistoryItemDTO[];
    allocations: AllocationItemDTO[];
}
/**
 * DTO pour un enregistrement d'amortissement
 */
export declare class DepreciationHistoryItemDTO {
    scheduleId: string;
    period: string;
    depreciationAmount: number;
    accumulatedDepreciation: number;
    netBookValue: number;
    currency: string;
    calculatedAt: string;
}
/**
 * DTO pour le résumé des amortissements par période
 * CONTRACTUEL: Cost-Structure
 */
export declare class DepreciationSummaryDTO {
    period: string;
    totalDepreciation: number;
    assetCount: number;
    currency: string;
}
/**
 * DTO pour une dotation ventilée
 * CONTRACTUEL: Cost-Structure
 */
export declare class DepreciationCostStructureExportItemDTO {
    assetId: string;
    depreciationAmount: number;
    targetType: string;
    targetId: string;
    percentage: number;
    allocatedAmount: number;
    currency: string;
}
/**
 * DTO pour l'export Cost-Structure
 */
export declare class DepreciationCostStructureExportDTO {
    period: string;
    items: DepreciationCostStructureExportItemDTO[];
    total: number;
}
/**
 * DTO pour une affectation
 * CONTRACTUEL: Cost-Structure
 */
export declare class AllocationItemDTO {
    allocationId: string;
    assetId: string;
    targetType: string;
    targetId: string;
    percentage: number;
    effectiveFrom: string;
    effectiveTo?: string;
}
/**
 * DTO pour un enregistrement de maintenance
 */
export declare class MaintenanceHistoryItemDTO {
    maintenanceId: string;
    assetId: string;
    maintenanceType: string;
    maintenanceDate: string;
    description: string;
    cost: number;
    currency: string;
    performedBy: string;
    recordedAt: string;
}
/**
 * DTO pour le résumé de maintenance par actif
 * CONTRACTUEL: Cost-Structure, Budget
 */
export declare class MaintenanceSummaryItemDTO {
    assetId: string;
    totalMaintenanceCost: number;
    interventionCount: number;
    firstIntervention?: string;
    lastIntervention?: string;
    currency: string;
}
/**
 * DTO pour la maintenance par période
 * CONTRACTUEL: Cost-Structure
 */
export declare class MaintenanceByPeriodItemDTO {
    period: string;
    totalMaintenanceCost: number;
    interventionCount: number;
    assetsMaintained: number;
    currency: string;
}
/**
 * DTO pour une projection de renouvellement
 * CONTRACTUEL: Budget
 */
export declare class RenewalProjectionItemDTO {
    assetId: string;
    acquisitionCost: number;
    renewalDate: string;
    replacementCost?: number;
    renewalYear: number;
    renewalMonth: number;
    currency: string;
}
/**
 * DTO pour un historique de cession
 */
export declare class DisposalHistoryItemDTO {
    disposalId: string;
    assetId: string;
    disposalDate: string;
    disposalType: string;
    disposalValue: number;
    netBookValue: number;
    gainOrLoss: number;
    currency: string;
    reason?: string;
    disposedAt: string;
}
/**
 * DTO pour les KPIs patrimoniales
 */
export declare class ImmobilisationKpiDTO {
    assetsInService: number;
    assetsDisposed: number;
    assetsScrapped: number;
    totalAssets: number;
    totalAcquisitionCost?: number;
    totalNetBookValue?: number;
    totalAccumulatedDepreciation?: number;
    currency: string;
}
//# sourceMappingURL=response.dto.d.ts.map