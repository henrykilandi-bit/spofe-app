/**
 * Immobilisation Module - API Query DTOs
 * Conformité: API_READ_ONLY.md v1.0.0
 *
 * DTOs pour les paramètres de requête (query params).
 */
export declare enum AssetStatusFilter {
    IN_SERVICE = "IN_SERVICE",
    DISPOSED = "DISPOSED",
    SCRAPPED = "SCRAPPED"
}
export declare enum AllocationTargetTypeFilter {
    PRODUCT = "PRODUCT",
    SERVICE = "SERVICE",
    PROJECT = "PROJECT"
}
export declare enum MaintenanceTypeFilter {
    MAINTENANCE = "MAINTENANCE",
    REPAIR = "REPAIR",
    SERVICE = "SERVICE"
}
export declare enum DisposalTypeFilter {
    SALE = "SALE",
    SCRAP = "SCRAP"
}
/**
 * Paramètres de pagination
 */
export declare class PaginationQueryDTO {
    page?: number;
    limit?: number;
}
/**
 * Query params pour la liste des actifs
 */
export declare class AssetListQueryDTO extends PaginationQueryDTO {
    status?: AssetStatusFilter;
}
/**
 * Query params pour la VNC des actifs
 */
export declare class AssetNetBookValueQueryDTO extends PaginationQueryDTO {
    status?: AssetStatusFilter;
    assetId?: string;
}
/**
 * Query params pour l'historique des amortissements
 */
export declare class DepreciationHistoryQueryDTO extends PaginationQueryDTO {
    fromPeriod?: string;
    toPeriod?: string;
}
/**
 * Query params pour le résumé des amortissements
 * CONTRACTUEL: Cost-Structure
 */
export declare class DepreciationSummaryQueryDTO {
    period: string;
}
/**
 * Query params pour l'export Cost-Structure
 */
export declare class DepreciationCostStructureExportQueryDTO {
    period: string;
}
/**
 * Query params pour les allocations
 * CONTRACTUEL: Cost-Structure
 */
export declare class AllocationQueryDTO extends PaginationQueryDTO {
    assetId?: string;
    targetType?: AllocationTargetTypeFilter;
    targetId?: string;
}
/**
 * Query params pour l'historique de maintenance
 */
export declare class MaintenanceHistoryQueryDTO extends PaginationQueryDTO {
    assetId?: string;
    type?: MaintenanceTypeFilter;
    fromDate?: string;
    toDate?: string;
}
/**
 * Query params pour le résumé de maintenance
 * CONTRACTUEL: Cost-Structure, Budget
 */
export declare class MaintenanceSummaryQueryDTO {
    assetId?: string;
}
/**
 * Query params pour la maintenance par période
 * CONTRACTUEL: Cost-Structure
 */
export declare class MaintenanceByPeriodQueryDTO {
    fromPeriod?: string;
    toPeriod?: string;
}
/**
 * Query params pour les projections de renouvellement
 * CONTRACTUEL: Budget
 */
export declare class RenewalQueryDTO extends PaginationQueryDTO {
    fromYear?: number;
    toYear?: number;
}
/**
 * Query params pour l'historique des cessions
 */
export declare class DisposalQueryDTO extends PaginationQueryDTO {
    disposalType?: DisposalTypeFilter;
    fromDate?: string;
    toDate?: string;
}
//# sourceMappingURL=query.dto.d.ts.map