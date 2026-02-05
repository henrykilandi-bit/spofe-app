/**
 * Immobilisation Module - Read API Controller (HTTP GET)
 * Conformité: API_READ_ONLY.md v1.0.0
 *
 * Principe: GET uniquement, 1 endpoint = 1 read-model SQL, aucune logique métier
 *
 * ✅ Zero logique métier
 * ✅ Zero Guardian
 * ✅ Mapping 1:1 vers read-models SQL
 * ✅ Multi-tenant explicite
 */
import { ImmobilisationReadModelRepository } from '../infrastructure/persistence';
import { AssetListItemDTO, AssetNetBookValueDTO, AssetDetailDTO, DepreciationHistoryItemDTO, DepreciationSummaryDTO, DepreciationCostStructureExportDTO, AllocationItemDTO, MaintenanceHistoryItemDTO, MaintenanceSummaryItemDTO, MaintenanceByPeriodItemDTO, RenewalProjectionItemDTO, DisposalHistoryItemDTO, ImmobilisationKpiDTO, AssetListQueryDTO, AssetNetBookValueQueryDTO, DepreciationHistoryQueryDTO, DepreciationSummaryQueryDTO, DepreciationCostStructureExportQueryDTO, AllocationQueryDTO, MaintenanceHistoryQueryDTO, MaintenanceSummaryQueryDTO, MaintenanceByPeriodQueryDTO, RenewalQueryDTO, DisposalQueryDTO } from './dto';
interface PaginatedResponse<T> {
    items: T[];
    page: number;
    limit: number;
    total: number;
    hasMore: boolean;
}
export declare class ImmobilisationReadController {
    private readonly readModelRepo;
    constructor(readModelRepo: ImmobilisationReadModelRepository);
    /**
     * Extract tenant ID from headers
     */
    private getTenantId;
    /**
     * Build paginated response
     */
    private paginate;
    /**
     * Format date to ISO string
     */
    private formatDate;
    /**
     * Format datetime to ISO string
     */
    private formatDateTime;
    /**
     * GET /api/immobilisation/assets
     * Liste des immobilisations (état courant)
     * Read-model: rm_assets_current
     */
    listAssets(headers: Record<string, string>, query: AssetListQueryDTO): Promise<PaginatedResponse<AssetListItemDTO>>;
    /**
     * GET /api/immobilisation/assets/net-book-value
     * VNC courante des actifs
     * Read-model: rm_asset_net_book_value
     */
    listAssetNetBookValues(headers: Record<string, string>, query: AssetNetBookValueQueryDTO): Promise<PaginatedResponse<AssetNetBookValueDTO>>;
    /**
     * GET /api/immobilisation/assets/:assetId
     * Détail d'une immobilisation
     */
    getAssetDetail(headers: Record<string, string>, assetId: string): Promise<AssetDetailDTO>;
    /**
     * GET /api/immobilisation/assets/:assetId/depreciation
     * Historique des amortissements d'un actif
     * Read-model: rm_asset_depreciation_history
     */
    getAssetDepreciationHistory(headers: Record<string, string>, assetId: string, query: DepreciationHistoryQueryDTO): Promise<PaginatedResponse<DepreciationHistoryItemDTO>>;
    /**
     * GET /api/immobilisation/depreciation/summary
     * Amortissements agrégés par période
     * Read-model: rm_asset_depreciation_summary
     * CONTRACTUEL: Cost-Structure
     */
    getDepreciationSummary(headers: Record<string, string>, query: DepreciationSummaryQueryDTO): Promise<DepreciationSummaryDTO>;
    /**
     * GET /api/immobilisation/depreciation/cost-structure-export
     * Dotations ventilées pour Cost-Structure
     * Read-model: rm_depreciation_cost_structure_export
     * CONTRACTUEL: Cost-Structure
     */
    getDepreciationCostStructureExport(headers: Record<string, string>, query: DepreciationCostStructureExportQueryDTO): Promise<DepreciationCostStructureExportDTO>;
    /**
     * GET /api/immobilisation/allocations
     * Affectations effectives des immobilisations
     * Read-model: rm_asset_allocation_effective
     * CONTRACTUEL: Cost-Structure
     */
    listAllocations(headers: Record<string, string>, query: AllocationQueryDTO): Promise<PaginatedResponse<AllocationItemDTO>>;
    /**
     * GET /api/immobilisation/maintenance
     * Historique des coûts de maintenance
     * Read-model: rm_asset_maintenance_history
     */
    listMaintenanceHistory(headers: Record<string, string>, query: MaintenanceHistoryQueryDTO): Promise<PaginatedResponse<MaintenanceHistoryItemDTO>>;
    /**
     * GET /api/immobilisation/maintenance/summary
     * Coûts de maintenance agrégés par actif
     * Read-model: rm_asset_maintenance_summary
     * CONTRACTUEL: Cost-Structure, Budget
     */
    getMaintenanceSummary(headers: Record<string, string>, query: MaintenanceSummaryQueryDTO): Promise<{
        items: MaintenanceSummaryItemDTO[];
        total: number;
    }>;
    /**
     * GET /api/immobilisation/maintenance/by-period
     * Coûts de maintenance par période
     * Read-model: rm_asset_maintenance_by_period
     * CONTRACTUEL: Cost-Structure
     */
    getMaintenanceByPeriod(headers: Record<string, string>, query: MaintenanceByPeriodQueryDTO): Promise<{
        items: MaintenanceByPeriodItemDTO[];
        total: number;
    }>;
    /**
     * GET /api/immobilisation/renewals
     * Projection de renouvellement
     * Read-model: rm_assets_renewal_projection
     * CONTRACTUEL: Budget
     */
    listRenewalProjections(headers: Record<string, string>, query: RenewalQueryDTO): Promise<PaginatedResponse<RenewalProjectionItemDTO>>;
    /**
     * GET /api/immobilisation/disposals
     * Historique des cessions / déclassements
     * Read-model: rm_asset_disposal_history
     */
    listDisposals(headers: Record<string, string>, query: DisposalQueryDTO): Promise<PaginatedResponse<DisposalHistoryItemDTO>>;
    /**
     * GET /api/immobilisation/kpi
     * KPIs patrimoniales
     * Read-model: rm_immobilisation_kpi
     */
    getKpi(headers: Record<string, string>): Promise<ImmobilisationKpiDTO>;
}
export {};
//# sourceMappingURL=immobilisation-read.controller.d.ts.map