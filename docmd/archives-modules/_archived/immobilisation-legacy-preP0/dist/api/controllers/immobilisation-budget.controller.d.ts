/**
 * Immobilisation Module - Budget Contract Controller
 * Conformité: API_READ_ONLY.md v1.0.0
 *
 * Endpoints contractuels pour le module Budget.
 *
 * ✅ Zero logique métier
 * ✅ Zero Guardian
 * ✅ Mapping 1:1 vers read-models SQL
 * ✅ Multi-tenant explicite
 */
import { ImmobilisationReadModelRepository } from '../../infrastructure/persistence';
import { RenewalProjectionItemDTO, MaintenanceSummaryItemDTO, DepreciationSummaryDTO, RenewalQueryDTO, MaintenanceSummaryQueryDTO } from '../dto';
interface RenewalsByYearDTO {
    year: number;
    items: RenewalProjectionItemDTO[];
    totalReplacementCost: number;
    assetCount: number;
    currency: string;
}
export declare class ImmobilisationBudgetController {
    private readonly readModelRepo;
    constructor(readModelRepo: ImmobilisationReadModelRepository);
    private getTenantId;
    private formatDate;
    /**
     * GET /api/immobilisation/budget/renewals
     * Projections de renouvellement pour Budget (CAPEX)
     * CONTRAT: IMM-BUD-REN-01
     */
    getRenewalProjections(headers: Record<string, string>, query: RenewalQueryDTO): Promise<{
        items: RenewalProjectionItemDTO[];
        total: number;
    }>;
    /**
     * GET /api/immobilisation/budget/renewals/by-year
     * Projections de renouvellement agrégées par année
     * CONTRAT: IMM-BUD-REN-02
     */
    getRenewalsByYear(headers: Record<string, string>, query: RenewalQueryDTO): Promise<RenewalsByYearDTO[]>;
    /**
     * GET /api/immobilisation/budget/maintenance
     * Coûts de maintenance pour Budget (OPEX récurrent)
     * CONTRAT: IMM-BUD-MNT-01
     */
    getMaintenanceSummary(headers: Record<string, string>, query: MaintenanceSummaryQueryDTO): Promise<{
        items: MaintenanceSummaryItemDTO[];
        totalCost: number;
        currency: string;
    }>;
    /**
     * GET /api/immobilisation/budget/depreciation
     * Dotations d'amortissement pour Budget
     * CONTRAT: IMM-BUD-DEP-01
     */
    getDepreciationSummary(headers: Record<string, string>, fromPeriod?: string, toPeriod?: string): Promise<{
        items: DepreciationSummaryDTO[];
        totalDepreciation: number;
        currency: string;
    }>;
}
export {};
//# sourceMappingURL=immobilisation-budget.controller.d.ts.map