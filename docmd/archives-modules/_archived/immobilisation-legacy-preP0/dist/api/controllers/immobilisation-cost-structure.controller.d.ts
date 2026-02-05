/**
 * Immobilisation Module - Cost-Structure Contract Controller
 * Conformité: API_READ_ONLY.md v1.0.0
 *
 * Endpoints contractuels pour le module Cost-Structure.
 *
 * ✅ Zero logique métier
 * ✅ Zero Guardian
 * ✅ Mapping 1:1 vers read-models SQL
 * ✅ Multi-tenant explicite
 */
import { ImmobilisationReadModelRepository } from '../../infrastructure/persistence';
import { DepreciationSummaryDTO, DepreciationCostStructureExportDTO, AllocationItemDTO, MaintenanceSummaryItemDTO, MaintenanceByPeriodItemDTO, DepreciationSummaryQueryDTO, DepreciationCostStructureExportQueryDTO, AllocationQueryDTO, MaintenanceSummaryQueryDTO, MaintenanceByPeriodQueryDTO } from '../dto';
export declare class ImmobilisationCostStructureController {
    private readonly readModelRepo;
    constructor(readModelRepo: ImmobilisationReadModelRepository);
    private getTenantId;
    private formatDate;
    /**
     * GET /api/immobilisation/cost-structure/depreciation/summary
     * Amortissements agrégés par période
     * CONTRAT: IMM-CS-DEP-01
     */
    getDepreciationSummary(headers: Record<string, string>, query: DepreciationSummaryQueryDTO): Promise<DepreciationSummaryDTO>;
    /**
     * GET /api/immobilisation/cost-structure/depreciation/export
     * Dotations ventilées pour Cost-Structure
     * CONTRAT: IMM-CS-DEP-02
     */
    getDepreciationExport(headers: Record<string, string>, query: DepreciationCostStructureExportQueryDTO): Promise<DepreciationCostStructureExportDTO>;
    /**
     * GET /api/immobilisation/cost-structure/allocations
     * Affectations effectives
     * CONTRAT: IMM-CS-ALL-01
     */
    getAllocations(headers: Record<string, string>, query: AllocationQueryDTO): Promise<AllocationItemDTO[]>;
    /**
     * GET /api/immobilisation/cost-structure/maintenance/summary
     * Coûts de maintenance agrégés par actif
     * CONTRAT: IMM-CS-MNT-01
     */
    getMaintenanceSummary(headers: Record<string, string>, query: MaintenanceSummaryQueryDTO): Promise<MaintenanceSummaryItemDTO[]>;
    /**
     * GET /api/immobilisation/cost-structure/maintenance/by-period
     * Coûts de maintenance par période
     * CONTRAT: IMM-CS-MNT-02
     */
    getMaintenanceByPeriod(headers: Record<string, string>, query: MaintenanceByPeriodQueryDTO): Promise<MaintenanceByPeriodItemDTO[]>;
}
//# sourceMappingURL=immobilisation-cost-structure.controller.d.ts.map