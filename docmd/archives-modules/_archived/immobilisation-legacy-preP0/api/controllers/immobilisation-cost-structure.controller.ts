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

import {
  Controller,
  Get,
  Query,
  Headers,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ImmobilisationReadModelRepository } from '../../infrastructure/persistence';
import {
  DepreciationSummaryDTO,
  DepreciationCostStructureExportDTO,
  DepreciationCostStructureExportItemDTO,
  AllocationItemDTO,
  MaintenanceSummaryItemDTO,
  MaintenanceByPeriodItemDTO,
  DepreciationSummaryQueryDTO,
  DepreciationCostStructureExportQueryDTO,
  AllocationQueryDTO,
  MaintenanceSummaryQueryDTO,
  MaintenanceByPeriodQueryDTO,
} from '../dto';

// ═══════════════════════════════════════════════════════════════════════════
// COST-STRUCTURE CONTRACT CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════

@ApiTags('Immobilisation - Cost-Structure Contract')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Tenant-Id', required: true, description: 'Tenant ID (UUID)' })
@Controller('/api/immobilisation/cost-structure')
export class ImmobilisationCostStructureController {
  constructor(
    private readonly readModelRepo: ImmobilisationReadModelRepository,
  ) {}

  private getTenantId(headers: Record<string, string>): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }
    return tenantId;
  }

  private formatDate(date: Date | null | undefined): string | undefined {
    return date ? date.toISOString().split('T')[0] : undefined;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEPRECIATION (CONTRACTUEL)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/cost-structure/depreciation/summary
   * Amortissements agrégés par période
   * CONTRAT: IMM-CS-DEP-01
   */
  @Get('/depreciation/summary')
  @ApiOperation({
    summary: 'Amortissements agrégés par période',
    description: 'CONTRAT IMM-CS-DEP-01: Dotations mensuelles pour Cost-Structure',
  })
  @ApiResponse({ status: 200, description: 'Résumé des amortissements', type: DepreciationSummaryDTO })
  async getDepreciationSummary(
    @Headers() headers: Record<string, string>,
    @Query() query: DepreciationSummaryQueryDTO,
  ): Promise<DepreciationSummaryDTO> {
    const tenantId = this.getTenantId(headers);
    const { period } = query;

    if (!period) {
      throw new BadRequestException('period is required (format: YYYY-MM)');
    }

    const summaries = await this.readModelRepo.findDepreciationSummary({
      tenantId,
      periodFrom: period,
      periodTo: period,
    });

    if (summaries.length === 0) {
      return {
        period,
        totalDepreciation: 0,
        assetCount: 0,
        currency: 'XAF',
      };
    }

    return {
      period: summaries[0].period,
      totalDepreciation: summaries[0].totalDepreciation,
      assetCount: summaries[0].assetCount,
      currency: summaries[0].currency,
    };
  }

  /**
   * GET /api/immobilisation/cost-structure/depreciation/export
   * Dotations ventilées pour Cost-Structure
   * CONTRAT: IMM-CS-DEP-02
   */
  @Get('/depreciation/export')
  @ApiOperation({
    summary: 'Dotations ventilées pour intégration Cost-Structure',
    description: 'CONTRAT IMM-CS-DEP-02: Dotations ventilées par cible (PRODUCT/SERVICE/PROJECT)',
  })
  @ApiResponse({ status: 200, description: 'Export des dotations', type: DepreciationCostStructureExportDTO })
  async getDepreciationExport(
    @Headers() headers: Record<string, string>,
    @Query() query: DepreciationCostStructureExportQueryDTO,
  ): Promise<DepreciationCostStructureExportDTO> {
    const tenantId = this.getTenantId(headers);
    const { period } = query;

    if (!period) {
      throw new BadRequestException('period is required (format: YYYY-MM)');
    }

    const exports = await this.readModelRepo.findDepreciationForCostStructure({
      tenantId,
      periodFrom: period,
      periodTo: period,
    });

    const items: DepreciationCostStructureExportItemDTO[] = exports.map(e => ({
      assetId: e.assetId,
      depreciationAmount: e.depreciationAmount,
      targetType: e.targetType,
      targetId: e.targetId,
      percentage: e.percentage,
      allocatedAmount: e.allocatedAmount,
      currency: e.currency,
    }));

    return {
      period,
      items,
      total: items.length,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ALLOCATIONS (CONTRACTUEL)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/cost-structure/allocations
   * Affectations effectives
   * CONTRAT: IMM-CS-ALL-01
   */
  @Get('/allocations')
  @ApiOperation({
    summary: 'Affectations effectives des immobilisations',
    description: 'CONTRAT IMM-CS-ALL-01: Ventilations par cible pour Cost-Structure',
  })
  @ApiResponse({ status: 200, description: 'Liste des affectations', type: [AllocationItemDTO] })
  async getAllocations(
    @Headers() headers: Record<string, string>,
    @Query() query: AllocationQueryDTO,
  ): Promise<AllocationItemDTO[]> {
    const tenantId = this.getTenantId(headers);
    const { assetId, targetType, targetId } = query;

    const allocations = await this.readModelRepo.findEffectiveAllocations({
      tenantId,
      assetId,
      targetType,
      targetId,
    });

    return allocations.map(a => ({
      allocationId: a.allocationId,
      assetId: a.assetId,
      targetType: a.targetType,
      targetId: a.targetId,
      percentage: a.percentage,
      effectiveFrom: this.formatDate(a.effectiveFrom)!,
      effectiveTo: this.formatDate(a.effectiveTo),
    }));
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAINTENANCE (CONTRACTUEL)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/cost-structure/maintenance/summary
   * Coûts de maintenance agrégés par actif
   * CONTRAT: IMM-CS-MNT-01
   */
  @Get('/maintenance/summary')
  @ApiOperation({
    summary: 'Résumé de maintenance par actif',
    description: 'CONTRAT IMM-CS-MNT-01: Coûts indirects pour Cost-Structure',
  })
  @ApiResponse({ status: 200, description: 'Résumé maintenance', type: [MaintenanceSummaryItemDTO] })
  async getMaintenanceSummary(
    @Headers() headers: Record<string, string>,
    @Query() query: MaintenanceSummaryQueryDTO,
  ): Promise<MaintenanceSummaryItemDTO[]> {
    const tenantId = this.getTenantId(headers);
    const { assetId } = query;

    const summaries = await this.readModelRepo.findMaintenanceSummary({
      tenantId,
      assetId,
    });

    return summaries.map(s => ({
      assetId: s.assetId,
      totalMaintenanceCost: s.totalMaintenanceCost,
      interventionCount: s.interventionCount,
      firstIntervention: this.formatDate(s.firstIntervention),
      lastIntervention: this.formatDate(s.lastIntervention),
      currency: s.currency,
    }));
  }

  /**
   * GET /api/immobilisation/cost-structure/maintenance/by-period
   * Coûts de maintenance par période
   * CONTRAT: IMM-CS-MNT-02
   */
  @Get('/maintenance/by-period')
  @ApiOperation({
    summary: 'Coûts de maintenance par période',
    description: 'CONTRAT IMM-CS-MNT-02: Coûts périodiques pour Cost-Structure',
  })
  @ApiResponse({ status: 200, description: 'Maintenance par période', type: [MaintenanceByPeriodItemDTO] })
  async getMaintenanceByPeriod(
    @Headers() headers: Record<string, string>,
    @Query() query: MaintenanceByPeriodQueryDTO,
  ): Promise<MaintenanceByPeriodItemDTO[]> {
    const tenantId = this.getTenantId(headers);
    const { fromPeriod, toPeriod } = query;

    const periods = await this.readModelRepo.findMaintenanceByPeriod({
      tenantId,
      periodFrom: fromPeriod,
      periodTo: toPeriod,
    });

    return periods.map(p => ({
      period: p.period,
      totalMaintenanceCost: p.totalMaintenanceCost,
      interventionCount: p.interventionCount,
      assetsMaintained: p.assetsMaintained,
      currency: p.currency,
    }));
  }
}
