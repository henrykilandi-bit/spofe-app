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

import {
  Controller,
  Get,
  Param,
  Query,
  Headers,
  HttpException,
  HttpStatus,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
  ApiBearerAuth,
} from '@nestjs/swagger';

import { ImmobilisationReadModelRepository } from '../infrastructure/persistence';
import {
  // Response DTOs
  AssetListItemDTO,
  AssetNetBookValueDTO,
  AssetDetailDTO,
  DepreciationHistoryItemDTO,
  DepreciationSummaryDTO,
  DepreciationCostStructureExportDTO,
  AllocationItemDTO,
  MaintenanceHistoryItemDTO,
  MaintenanceSummaryItemDTO,
  MaintenanceByPeriodItemDTO,
  RenewalProjectionItemDTO,
  DisposalHistoryItemDTO,
  ImmobilisationKpiDTO,
  // Query DTOs
  AssetListQueryDTO,
  AssetNetBookValueQueryDTO,
  DepreciationHistoryQueryDTO,
  DepreciationSummaryQueryDTO,
  DepreciationCostStructureExportQueryDTO,
  AllocationQueryDTO,
  MaintenanceHistoryQueryDTO,
  MaintenanceSummaryQueryDTO,
  MaintenanceByPeriodQueryDTO,
  RenewalQueryDTO,
  DisposalQueryDTO,
} from './dto';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface PaginatedResponse<T> {
  items: T[];
  page: number;
  limit: number;
  total: number;
  hasMore: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════

@ApiTags('Immobilisation - Read API (GET)')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Tenant-Id', required: true, description: 'Tenant ID (UUID)' })
@Controller('/api/immobilisation')
export class ImmobilisationReadController {
  constructor(
    private readonly readModelRepo: ImmobilisationReadModelRepository,
  ) {}

  // ─────────────────────────────────────────────────────────────────────────
  // HELPER METHODS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * Extract tenant ID from headers
   */
  private getTenantId(headers: Record<string, string>): string {
    const tenantId = headers['x-tenant-id'];
    if (!tenantId) {
      throw new BadRequestException('X-Tenant-Id header is required');
    }
    return tenantId;
  }

  /**
   * Build paginated response
   */
  private paginate<T>(items: T[], page: number, limit: number, total: number): PaginatedResponse<T> {
    return {
      items,
      page,
      limit,
      total,
      hasMore: page * limit < total,
    };
  }

  /**
   * Format date to ISO string
   */
  private formatDate(date: Date | null | undefined): string | undefined {
    return date ? date.toISOString().split('T')[0] : undefined;
  }

  /**
   * Format datetime to ISO string
   */
  private formatDateTime(date: Date | null | undefined): string | undefined {
    return date ? date.toISOString() : undefined;
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ASSET ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/assets
   * Liste des immobilisations (état courant)
   * Read-model: rm_assets_current
   */
  @Get('/assets')
  @ApiOperation({
    summary: 'Liste des immobilisations',
    description: 'Retourne tous les actifs du tenant. Read-model: rm_assets_current',
  })
  @ApiResponse({ status: 200, description: 'Liste paginée des actifs' })
  @ApiResponse({ status: 400, description: 'Paramètres invalides' })
  @ApiResponse({ status: 401, description: 'Non authentifié' })
  async listAssets(
    @Headers() headers: Record<string, string>,
    @Query() query: AssetListQueryDTO,
  ): Promise<PaginatedResponse<AssetListItemDTO>> {
    const tenantId = this.getTenantId(headers);
    const { page = 1, limit = 20, status } = query;

    const assets = await this.readModelRepo.findAllAssets({
      tenantId,
      status,
      limit,
      offset: (page - 1) * limit,
    });

    // Get total count (simplified - in production use COUNT query)
    const allAssets = await this.readModelRepo.findAllAssets({ tenantId, status });
    const total = allAssets.length;

    const items: AssetListItemDTO[] = assets.map(a => ({
      assetId: a.assetId,
      acquisitionCost: a.acquisitionCost,
      currency: a.currency,
      acquisitionDate: this.formatDate(a.acquisitionDate)!,
      usefulLifeMonths: a.usefulLifeMonths,
      depreciationMethod: a.depreciationMethod,
      residualValue: a.residualValue,
      renewalDate: this.formatDate(a.renewalDate),
      replacementCost: a.replacementCost ?? undefined,
      status: a.status,
      createdAt: this.formatDateTime(a.createdAt)!,
    }));

    return this.paginate(items, page, limit, total);
  }

  /**
   * GET /api/immobilisation/assets/net-book-value
   * VNC courante des actifs
   * Read-model: rm_asset_net_book_value
   */
  @Get('/assets/net-book-value')
  @ApiOperation({
    summary: 'VNC courante des actifs',
    description: 'Retourne la VNC de tous les actifs. Read-model: rm_asset_net_book_value',
  })
  @ApiResponse({ status: 200, description: 'Liste des VNC' })
  async listAssetNetBookValues(
    @Headers() headers: Record<string, string>,
    @Query() query: AssetNetBookValueQueryDTO,
  ): Promise<PaginatedResponse<AssetNetBookValueDTO>> {
    const tenantId = this.getTenantId(headers);
    const { page = 1, limit = 20, status, assetId } = query;

    const nbvs = await this.readModelRepo.findAssetNetBookValues({
      tenantId,
      status,
      assetId,
      limit,
      offset: (page - 1) * limit,
    });

    const allNbvs = await this.readModelRepo.findAssetNetBookValues({ tenantId, status, assetId });
    const total = allNbvs.length;

    const items: AssetNetBookValueDTO[] = nbvs.map(n => ({
      assetId: n.assetId,
      acquisitionCost: n.acquisitionCost,
      residualValue: n.residualValue,
      accumulatedDepreciation: n.accumulatedDepreciation,
      netBookValue: n.netBookValue,
      currency: n.currency,
      status: n.status,
      lastPeriod: n.lastPeriod ?? undefined,
    }));

    return this.paginate(items, page, limit, total);
  }

  /**
   * GET /api/immobilisation/assets/:assetId
   * Détail d'une immobilisation
   */
  @Get('/assets/:assetId')
  @ApiOperation({
    summary: 'Détail d\'une immobilisation',
    description: 'Retourne le détail complet d\'un actif avec historiques',
  })
  @ApiParam({ name: 'assetId', description: 'ID de l\'actif' })
  @ApiResponse({ status: 200, description: 'Détail de l\'actif' })
  @ApiResponse({ status: 404, description: 'Actif non trouvé' })
  async getAssetDetail(
    @Headers() headers: Record<string, string>,
    @Param('assetId') assetId: string,
  ): Promise<AssetDetailDTO> {
    const tenantId = this.getTenantId(headers);

    const asset = await this.readModelRepo.findAssetById(tenantId, assetId);
    if (!asset) {
      throw new NotFoundException(`Asset ${assetId} not found`);
    }

    const nbv = await this.readModelRepo.findAssetNetBookValue(tenantId, assetId);
    const depreciation = await this.readModelRepo.findAssetDepreciationHistory(tenantId, assetId);
    const maintenance = await this.readModelRepo.findAssetMaintenanceHistory(tenantId, assetId);
    const allocations = await this.readModelRepo.findAssetAllocations(tenantId, assetId, true);

    return {
      asset: {
        assetId: asset.assetId,
        acquisitionCost: asset.acquisitionCost,
        currency: asset.currency,
        acquisitionDate: this.formatDate(asset.acquisitionDate)!,
        usefulLifeMonths: asset.usefulLifeMonths,
        depreciationMethod: asset.depreciationMethod,
        residualValue: asset.residualValue,
        renewalDate: this.formatDate(asset.renewalDate),
        replacementCost: asset.replacementCost ?? undefined,
        status: asset.status,
        createdAt: this.formatDateTime(asset.createdAt)!,
      },
      netBookValue: nbv ? {
        assetId: nbv.assetId,
        acquisitionCost: nbv.acquisitionCost,
        residualValue: nbv.residualValue,
        accumulatedDepreciation: nbv.accumulatedDepreciation,
        netBookValue: nbv.netBookValue,
        currency: nbv.currency,
        status: nbv.status,
        lastPeriod: nbv.lastPeriod ?? undefined,
      } : {
        assetId: asset.assetId,
        acquisitionCost: asset.acquisitionCost,
        residualValue: asset.residualValue,
        accumulatedDepreciation: 0,
        netBookValue: asset.acquisitionCost,
        currency: asset.currency,
        status: asset.status,
      },
      depreciationHistory: depreciation.map(d => ({
        scheduleId: d.scheduleId,
        period: d.period,
        depreciationAmount: d.depreciationAmount,
        accumulatedDepreciation: d.accumulatedDepreciation,
        netBookValue: d.netBookValue,
        currency: d.currency,
        calculatedAt: this.formatDateTime(d.calculatedAt)!,
      })),
      maintenanceHistory: maintenance.map(m => ({
        maintenanceId: m.maintenanceId,
        assetId: m.assetId,
        maintenanceType: m.maintenanceType,
        maintenanceDate: this.formatDate(m.maintenanceDate)!,
        description: m.description,
        cost: m.cost,
        currency: m.currency,
        performedBy: m.performedBy,
        recordedAt: this.formatDateTime(m.recordedAt)!,
      })),
      allocations: allocations.map(a => ({
        allocationId: a.allocationId,
        assetId: a.assetId,
        targetType: a.targetType,
        targetId: a.targetId,
        percentage: a.percentage,
        effectiveFrom: this.formatDate(a.effectiveFrom)!,
        effectiveTo: this.formatDate(a.effectiveTo),
      })),
    };
  }

  /**
   * GET /api/immobilisation/assets/:assetId/depreciation
   * Historique des amortissements d'un actif
   * Read-model: rm_asset_depreciation_history
   */
  @Get('/assets/:assetId/depreciation')
  @ApiOperation({
    summary: 'Historique des amortissements d\'un actif',
    description: 'Read-model: rm_asset_depreciation_history',
  })
  @ApiParam({ name: 'assetId', description: 'ID de l\'actif' })
  @ApiResponse({ status: 200, description: 'Historique des amortissements' })
  async getAssetDepreciationHistory(
    @Headers() headers: Record<string, string>,
    @Param('assetId') assetId: string,
    @Query() query: DepreciationHistoryQueryDTO,
  ): Promise<PaginatedResponse<DepreciationHistoryItemDTO>> {
    const tenantId = this.getTenantId(headers);
    const { page = 1, limit = 20, fromPeriod, toPeriod } = query;

    const history = await this.readModelRepo.findDepreciationHistory({
      tenantId,
      assetId,
      periodFrom: fromPeriod,
      periodTo: toPeriod,
      limit,
      offset: (page - 1) * limit,
    });

    const allHistory = await this.readModelRepo.findDepreciationHistory({
      tenantId,
      assetId,
      periodFrom: fromPeriod,
      periodTo: toPeriod,
    });
    const total = allHistory.length;

    const items: DepreciationHistoryItemDTO[] = history.map(d => ({
      scheduleId: d.scheduleId,
      period: d.period,
      depreciationAmount: d.depreciationAmount,
      accumulatedDepreciation: d.accumulatedDepreciation,
      netBookValue: d.netBookValue,
      currency: d.currency,
      calculatedAt: this.formatDateTime(d.calculatedAt)!,
    }));

    return this.paginate(items, page, limit, total);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEPRECIATION ENDPOINTS (CONTRACTUEL: Cost-Structure)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/depreciation/summary
   * Amortissements agrégés par période
   * Read-model: rm_asset_depreciation_summary
   * CONTRACTUEL: Cost-Structure
   */
  @Get('/depreciation/summary')
  @ApiOperation({
    summary: 'Amortissements agrégés par période (Cost-Structure)',
    description: 'CONTRACTUEL: Cost-Structure. Read-model: rm_asset_depreciation_summary',
  })
  @ApiResponse({ status: 200, description: 'Résumé des amortissements' })
  @ApiResponse({ status: 400, description: 'Période obligatoire' })
  async getDepreciationSummary(
    @Headers() headers: Record<string, string>,
    @Query() query: DepreciationSummaryQueryDTO,
  ): Promise<DepreciationSummaryDTO> {
    const tenantId = this.getTenantId(headers);
    const { period } = query;

    if (!period) {
      throw new BadRequestException('period query parameter is required');
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

    const summary = summaries[0];
    return {
      period: summary.period,
      totalDepreciation: summary.totalDepreciation,
      assetCount: summary.assetCount,
      currency: summary.currency,
    };
  }

  /**
   * GET /api/immobilisation/depreciation/cost-structure-export
   * Dotations ventilées pour Cost-Structure
   * Read-model: rm_depreciation_cost_structure_export
   * CONTRACTUEL: Cost-Structure
   */
  @Get('/depreciation/cost-structure-export')
  @ApiOperation({
    summary: 'Dotations ventilées pour Cost-Structure',
    description: 'CONTRACTUEL: Cost-Structure. Read-model: rm_depreciation_cost_structure_export',
  })
  @ApiResponse({ status: 200, description: 'Export des dotations ventilées' })
  async getDepreciationCostStructureExport(
    @Headers() headers: Record<string, string>,
    @Query() query: DepreciationCostStructureExportQueryDTO,
  ): Promise<DepreciationCostStructureExportDTO> {
    const tenantId = this.getTenantId(headers);
    const { period } = query;

    if (!period) {
      throw new BadRequestException('period query parameter is required');
    }

    const exports = await this.readModelRepo.findDepreciationForCostStructure({
      tenantId,
      periodFrom: period,
      periodTo: period,
    });

    return {
      period,
      items: exports.map(e => ({
        assetId: e.assetId,
        depreciationAmount: e.depreciationAmount,
        targetType: e.targetType,
        targetId: e.targetId,
        percentage: e.percentage,
        allocatedAmount: e.allocatedAmount,
        currency: e.currency,
      })),
      total: exports.length,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // ALLOCATION ENDPOINTS (CONTRACTUEL: Cost-Structure)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/allocations
   * Affectations effectives des immobilisations
   * Read-model: rm_asset_allocation_effective
   * CONTRACTUEL: Cost-Structure
   */
  @Get('/allocations')
  @ApiOperation({
    summary: 'Affectations effectives (Cost-Structure)',
    description: 'CONTRACTUEL: Cost-Structure. Read-model: rm_asset_allocation_effective',
  })
  @ApiResponse({ status: 200, description: 'Liste des affectations' })
  async listAllocations(
    @Headers() headers: Record<string, string>,
    @Query() query: AllocationQueryDTO,
  ): Promise<PaginatedResponse<AllocationItemDTO>> {
    const tenantId = this.getTenantId(headers);
    const { page = 1, limit = 20, assetId, targetType, targetId } = query;

    const allocations = await this.readModelRepo.findEffectiveAllocations({
      tenantId,
      assetId,
      targetType,
      targetId,
      limit,
      offset: (page - 1) * limit,
    });

    const allAllocations = await this.readModelRepo.findEffectiveAllocations({
      tenantId,
      assetId,
      targetType,
      targetId,
    });
    const total = allAllocations.length;

    const items: AllocationItemDTO[] = allocations.map(a => ({
      allocationId: a.allocationId,
      assetId: a.assetId,
      targetType: a.targetType,
      targetId: a.targetId,
      percentage: a.percentage,
      effectiveFrom: this.formatDate(a.effectiveFrom)!,
      effectiveTo: this.formatDate(a.effectiveTo),
    }));

    return this.paginate(items, page, limit, total);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAINTENANCE ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/maintenance
   * Historique des coûts de maintenance
   * Read-model: rm_asset_maintenance_history
   */
  @Get('/maintenance')
  @ApiOperation({
    summary: 'Historique de maintenance',
    description: 'Read-model: rm_asset_maintenance_history',
  })
  @ApiResponse({ status: 200, description: 'Liste des interventions' })
  async listMaintenanceHistory(
    @Headers() headers: Record<string, string>,
    @Query() query: MaintenanceHistoryQueryDTO,
  ): Promise<PaginatedResponse<MaintenanceHistoryItemDTO>> {
    const tenantId = this.getTenantId(headers);
    const { page = 1, limit = 20, assetId } = query;

    const history = await this.readModelRepo.findMaintenanceHistory({
      tenantId,
      assetId,
      limit,
      offset: (page - 1) * limit,
    });

    const allHistory = await this.readModelRepo.findMaintenanceHistory({ tenantId, assetId });
    const total = allHistory.length;

    const items: MaintenanceHistoryItemDTO[] = history.map(m => ({
      maintenanceId: m.maintenanceId,
      assetId: m.assetId,
      maintenanceType: m.maintenanceType,
      maintenanceDate: this.formatDate(m.maintenanceDate)!,
      description: m.description,
      cost: m.cost,
      currency: m.currency,
      performedBy: m.performedBy,
      recordedAt: this.formatDateTime(m.recordedAt)!,
    }));

    return this.paginate(items, page, limit, total);
  }

  /**
   * GET /api/immobilisation/maintenance/summary
   * Coûts de maintenance agrégés par actif
   * Read-model: rm_asset_maintenance_summary
   * CONTRACTUEL: Cost-Structure, Budget
   */
  @Get('/maintenance/summary')
  @ApiOperation({
    summary: 'Résumé de maintenance par actif (Cost-Structure, Budget)',
    description: 'CONTRACTUEL: Cost-Structure, Budget. Read-model: rm_asset_maintenance_summary',
  })
  @ApiResponse({ status: 200, description: 'Résumé de maintenance' })
  async getMaintenanceSummary(
    @Headers() headers: Record<string, string>,
    @Query() query: MaintenanceSummaryQueryDTO,
  ): Promise<{ items: MaintenanceSummaryItemDTO[]; total: number }> {
    const tenantId = this.getTenantId(headers);
    const { assetId } = query;

    const summaries = await this.readModelRepo.findMaintenanceSummary({
      tenantId,
      assetId,
    });

    return {
      items: summaries.map(s => ({
        assetId: s.assetId,
        totalMaintenanceCost: s.totalMaintenanceCost,
        interventionCount: s.interventionCount,
        firstIntervention: this.formatDate(s.firstIntervention),
        lastIntervention: this.formatDate(s.lastIntervention),
        currency: s.currency,
      })),
      total: summaries.length,
    };
  }

  /**
   * GET /api/immobilisation/maintenance/by-period
   * Coûts de maintenance par période
   * Read-model: rm_asset_maintenance_by_period
   * CONTRACTUEL: Cost-Structure
   */
  @Get('/maintenance/by-period')
  @ApiOperation({
    summary: 'Maintenance par période (Cost-Structure)',
    description: 'CONTRACTUEL: Cost-Structure. Read-model: rm_asset_maintenance_by_period',
  })
  @ApiResponse({ status: 200, description: 'Maintenance par période' })
  async getMaintenanceByPeriod(
    @Headers() headers: Record<string, string>,
    @Query() query: MaintenanceByPeriodQueryDTO,
  ): Promise<{ items: MaintenanceByPeriodItemDTO[]; total: number }> {
    const tenantId = this.getTenantId(headers);
    const { fromPeriod, toPeriod } = query;

    const periods = await this.readModelRepo.findMaintenanceByPeriod({
      tenantId,
      periodFrom: fromPeriod,
      periodTo: toPeriod,
    });

    return {
      items: periods.map(p => ({
        period: p.period,
        totalMaintenanceCost: p.totalMaintenanceCost,
        interventionCount: p.interventionCount,
        assetsMaintained: p.assetsMaintained,
        currency: p.currency,
      })),
      total: periods.length,
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // RENEWAL ENDPOINTS (CONTRACTUEL: Budget)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/renewals
   * Projection de renouvellement
   * Read-model: rm_assets_renewal_projection
   * CONTRACTUEL: Budget
   */
  @Get('/renewals')
  @ApiOperation({
    summary: 'Projections de renouvellement (Budget)',
    description: 'CONTRACTUEL: Budget. Read-model: rm_assets_renewal_projection',
  })
  @ApiResponse({ status: 200, description: 'Projections de renouvellement' })
  async listRenewalProjections(
    @Headers() headers: Record<string, string>,
    @Query() query: RenewalQueryDTO,
  ): Promise<PaginatedResponse<RenewalProjectionItemDTO>> {
    const tenantId = this.getTenantId(headers);
    const { page = 1, limit = 20, fromYear, toYear } = query;

    const projections = await this.readModelRepo.findRenewalProjections({
      tenantId,
      renewalYearFrom: fromYear,
      renewalYearTo: toYear,
      limit,
      offset: (page - 1) * limit,
    });

    const allProjections = await this.readModelRepo.findRenewalProjections({
      tenantId,
      renewalYearFrom: fromYear,
      renewalYearTo: toYear,
    });
    const total = allProjections.length;

    const items: RenewalProjectionItemDTO[] = projections.map(p => ({
      assetId: p.assetId,
      acquisitionCost: p.acquisitionCost,
      renewalDate: this.formatDate(p.renewalDate)!,
      replacementCost: p.replacementCost ?? undefined,
      renewalYear: p.renewalYear,
      renewalMonth: p.renewalMonth,
      currency: p.currency,
    }));

    return this.paginate(items, page, limit, total);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DISPOSAL ENDPOINTS
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/disposals
   * Historique des cessions / déclassements
   * Read-model: rm_asset_disposal_history
   */
  @Get('/disposals')
  @ApiOperation({
    summary: 'Historique des cessions',
    description: 'Read-model: rm_asset_disposal_history',
  })
  @ApiResponse({ status: 200, description: 'Historique des cessions' })
  async listDisposals(
    @Headers() headers: Record<string, string>,
    @Query() query: DisposalQueryDTO,
  ): Promise<PaginatedResponse<DisposalHistoryItemDTO>> {
    const tenantId = this.getTenantId(headers);
    const { page = 1, limit = 20 } = query;

    const disposals = await this.readModelRepo.findDisposalHistory({
      tenantId,
      limit,
      offset: (page - 1) * limit,
    });

    const allDisposals = await this.readModelRepo.findDisposalHistory({ tenantId });
    const total = allDisposals.length;

    const items: DisposalHistoryItemDTO[] = disposals.map(d => ({
      disposalId: d.disposalId,
      assetId: d.assetId,
      disposalDate: this.formatDate(d.disposalDate)!,
      disposalType: d.disposalType,
      disposalValue: d.disposalValue,
      netBookValue: d.netBookValue,
      gainOrLoss: d.gainOrLoss,
      currency: d.currency,
      reason: d.reason ?? undefined,
      disposedAt: this.formatDateTime(d.disposedAt)!,
    }));

    return this.paginate(items, page, limit, total);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // KPI ENDPOINT
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/kpi
   * KPIs patrimoniales
   * Read-model: rm_immobilisation_kpi
   */
  @Get('/kpi')
  @ApiOperation({
    summary: 'KPIs patrimoniales',
    description: 'Read-model: rm_immobilisation_kpi',
  })
  @ApiResponse({ status: 200, description: 'KPIs du module' })
  async getKpi(
    @Headers() headers: Record<string, string>,
  ): Promise<ImmobilisationKpiDTO> {
    const tenantId = this.getTenantId(headers);

    const kpi = await this.readModelRepo.findKpi(tenantId);

    if (!kpi) {
      return {
        assetsInService: 0,
        assetsDisposed: 0,
        assetsScrapped: 0,
        totalAssets: 0,
        totalAcquisitionCost: 0,
        totalNetBookValue: 0,
        totalAccumulatedDepreciation: 0,
        currency: 'XAF',
      };
    }

    return {
      assetsInService: kpi.assetsInService,
      assetsDisposed: kpi.assetsDisposed,
      assetsScrapped: kpi.assetsScrapped,
      totalAssets: kpi.totalAssets,
      totalAcquisitionCost: kpi.totalAcquisitionCost ?? undefined,
      totalNetBookValue: kpi.totalNetBookValue ?? undefined,
      totalAccumulatedDepreciation: kpi.totalAccumulatedDepreciation ?? undefined,
      currency: kpi.currency,
    };
  }
}
