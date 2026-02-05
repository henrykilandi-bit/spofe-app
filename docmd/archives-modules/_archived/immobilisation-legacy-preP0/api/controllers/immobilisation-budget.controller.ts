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
  RenewalProjectionItemDTO,
  MaintenanceSummaryItemDTO,
  DepreciationSummaryDTO,
  RenewalQueryDTO,
  MaintenanceSummaryQueryDTO,
} from '../dto';

// ═══════════════════════════════════════════════════════════════════════════
// HELPER TYPES
// ═══════════════════════════════════════════════════════════════════════════

interface RenewalsByYearDTO {
  year: number;
  items: RenewalProjectionItemDTO[];
  totalReplacementCost: number;
  assetCount: number;
  currency: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// BUDGET CONTRACT CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════

@ApiTags('Immobilisation - Budget Contract')
@ApiBearerAuth()
@ApiHeader({ name: 'X-Tenant-Id', required: true, description: 'Tenant ID (UUID)' })
@Controller('/api/immobilisation/budget')
export class ImmobilisationBudgetController {
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
  // RENEWALS (CONTRACTUEL: CAPEX)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/budget/renewals
   * Projections de renouvellement pour Budget (CAPEX)
   * CONTRAT: IMM-BUD-REN-01
   */
  @Get('/renewals')
  @ApiOperation({
    summary: 'Projections de renouvellement (CAPEX)',
    description: 'CONTRAT IMM-BUD-REN-01: Investissements futurs pour Budget',
  })
  @ApiResponse({ status: 200, description: 'Projections de renouvellement' })
  async getRenewalProjections(
    @Headers() headers: Record<string, string>,
    @Query() query: RenewalQueryDTO,
  ): Promise<{ items: RenewalProjectionItemDTO[]; total: number }> {
    const tenantId = this.getTenantId(headers);
    const { fromYear, toYear } = query;

    const projections = await this.readModelRepo.findRenewalProjections({
      tenantId,
      renewalYearFrom: fromYear,
      renewalYearTo: toYear,
    });

    const items: RenewalProjectionItemDTO[] = projections.map(p => ({
      assetId: p.assetId,
      acquisitionCost: p.acquisitionCost,
      renewalDate: this.formatDate(p.renewalDate)!,
      replacementCost: p.replacementCost ?? undefined,
      renewalYear: p.renewalYear,
      renewalMonth: p.renewalMonth,
      currency: p.currency,
    }));

    return {
      items,
      total: items.length,
    };
  }

  /**
   * GET /api/immobilisation/budget/renewals/by-year
   * Projections de renouvellement agrégées par année
   * CONTRAT: IMM-BUD-REN-02
   */
  @Get('/renewals/by-year')
  @ApiOperation({
    summary: 'Projections de renouvellement par année',
    description: 'CONTRAT IMM-BUD-REN-02: CAPEX agrégé par année pour Budget',
  })
  @ApiResponse({ status: 200, description: 'Renouvellements par année' })
  async getRenewalsByYear(
    @Headers() headers: Record<string, string>,
    @Query() query: RenewalQueryDTO,
  ): Promise<RenewalsByYearDTO[]> {
    const tenantId = this.getTenantId(headers);
    const { fromYear, toYear } = query;

    const projections = await this.readModelRepo.findRenewalProjections({
      tenantId,
      renewalYearFrom: fromYear,
      renewalYearTo: toYear,
    });

    // Group by year
    const byYear = new Map<number, RenewalProjectionItemDTO[]>();
    
    for (const p of projections) {
      const item: RenewalProjectionItemDTO = {
        assetId: p.assetId,
        acquisitionCost: p.acquisitionCost,
        renewalDate: this.formatDate(p.renewalDate)!,
        replacementCost: p.replacementCost ?? undefined,
        renewalYear: p.renewalYear,
        renewalMonth: p.renewalMonth,
        currency: p.currency,
      };

      if (!byYear.has(p.renewalYear)) {
        byYear.set(p.renewalYear, []);
      }
      byYear.get(p.renewalYear)!.push(item);
    }

    // Build response
    const result: RenewalsByYearDTO[] = [];
    for (const [year, items] of byYear) {
      const totalReplacementCost = items.reduce(
        (sum, item) => sum + (item.replacementCost ?? item.acquisitionCost),
        0,
      );

      result.push({
        year,
        items,
        totalReplacementCost,
        assetCount: items.length,
        currency: items[0]?.currency || 'XAF',
      });
    }

    return result.sort((a, b) => a.year - b.year);
  }

  // ─────────────────────────────────────────────────────────────────────────
  // MAINTENANCE (CONTRACTUEL: OPEX)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/budget/maintenance
   * Coûts de maintenance pour Budget (OPEX récurrent)
   * CONTRAT: IMM-BUD-MNT-01
   */
  @Get('/maintenance')
  @ApiOperation({
    summary: 'Coûts de maintenance (OPEX)',
    description: 'CONTRAT IMM-BUD-MNT-01: Charges récurrentes pour Budget',
  })
  @ApiResponse({ status: 200, description: 'Résumé maintenance' })
  async getMaintenanceSummary(
    @Headers() headers: Record<string, string>,
    @Query() query: MaintenanceSummaryQueryDTO,
  ): Promise<{ items: MaintenanceSummaryItemDTO[]; totalCost: number; currency: string }> {
    const tenantId = this.getTenantId(headers);
    const { assetId } = query;

    const summaries = await this.readModelRepo.findMaintenanceSummary({
      tenantId,
      assetId,
    });

    const items: MaintenanceSummaryItemDTO[] = summaries.map(s => ({
      assetId: s.assetId,
      totalMaintenanceCost: s.totalMaintenanceCost,
      interventionCount: s.interventionCount,
      firstIntervention: this.formatDate(s.firstIntervention),
      lastIntervention: this.formatDate(s.lastIntervention),
      currency: s.currency,
    }));

    const totalCost = items.reduce((sum, item) => sum + item.totalMaintenanceCost, 0);

    return {
      items,
      totalCost,
      currency: items[0]?.currency || 'XAF',
    };
  }

  // ─────────────────────────────────────────────────────────────────────────
  // DEPRECIATION (CONTRACTUEL: Dotations budgétées)
  // ─────────────────────────────────────────────────────────────────────────

  /**
   * GET /api/immobilisation/budget/depreciation
   * Dotations d'amortissement pour Budget
   * CONTRAT: IMM-BUD-DEP-01
   */
  @Get('/depreciation')
  @ApiOperation({
    summary: 'Dotations d\'amortissement pour Budget',
    description: 'CONTRAT IMM-BUD-DEP-01: Dotations mensuelles pour Budget',
  })
  @ApiResponse({ status: 200, description: 'Résumé des dotations' })
  async getDepreciationSummary(
    @Headers() headers: Record<string, string>,
    @Query('fromPeriod') fromPeriod?: string,
    @Query('toPeriod') toPeriod?: string,
  ): Promise<{ items: DepreciationSummaryDTO[]; totalDepreciation: number; currency: string }> {
    const tenantId = this.getTenantId(headers);

    const summaries = await this.readModelRepo.findDepreciationSummary({
      tenantId,
      periodFrom: fromPeriod,
      periodTo: toPeriod,
    });

    const items: DepreciationSummaryDTO[] = summaries.map(s => ({
      period: s.period,
      totalDepreciation: s.totalDepreciation,
      assetCount: s.assetCount,
      currency: s.currency,
    }));

    const totalDepreciation = items.reduce((sum, item) => sum + item.totalDepreciation, 0);

    return {
      items,
      totalDepreciation,
      currency: items[0]?.currency || 'XAF',
    };
  }
}
