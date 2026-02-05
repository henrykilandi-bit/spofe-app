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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import { Controller, Get, Query, Headers, BadRequestException, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader, ApiBearerAuth, } from '@nestjs/swagger';
import { RenewalQueryDTO, MaintenanceSummaryQueryDTO, } from '../dto';
// ═══════════════════════════════════════════════════════════════════════════
// BUDGET CONTRACT CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════
let ImmobilisationBudgetController = class ImmobilisationBudgetController {
    readModelRepo;
    constructor(readModelRepo) {
        this.readModelRepo = readModelRepo;
    }
    getTenantId(headers) {
        const tenantId = headers['x-tenant-id'];
        if (!tenantId) {
            throw new BadRequestException('X-Tenant-Id header is required');
        }
        return tenantId;
    }
    formatDate(date) {
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
    async getRenewalProjections(headers, query) {
        const tenantId = this.getTenantId(headers);
        const { fromYear, toYear } = query;
        const projections = await this.readModelRepo.findRenewalProjections({
            tenantId,
            renewalYearFrom: fromYear,
            renewalYearTo: toYear,
        });
        const items = projections.map(p => ({
            assetId: p.assetId,
            acquisitionCost: p.acquisitionCost,
            renewalDate: this.formatDate(p.renewalDate),
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
    async getRenewalsByYear(headers, query) {
        const tenantId = this.getTenantId(headers);
        const { fromYear, toYear } = query;
        const projections = await this.readModelRepo.findRenewalProjections({
            tenantId,
            renewalYearFrom: fromYear,
            renewalYearTo: toYear,
        });
        // Group by year
        const byYear = new Map();
        for (const p of projections) {
            const item = {
                assetId: p.assetId,
                acquisitionCost: p.acquisitionCost,
                renewalDate: this.formatDate(p.renewalDate),
                replacementCost: p.replacementCost ?? undefined,
                renewalYear: p.renewalYear,
                renewalMonth: p.renewalMonth,
                currency: p.currency,
            };
            if (!byYear.has(p.renewalYear)) {
                byYear.set(p.renewalYear, []);
            }
            byYear.get(p.renewalYear).push(item);
        }
        // Build response
        const result = [];
        for (const [year, items] of byYear) {
            const totalReplacementCost = items.reduce((sum, item) => sum + (item.replacementCost ?? item.acquisitionCost), 0);
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
    async getMaintenanceSummary(headers, query) {
        const tenantId = this.getTenantId(headers);
        const { assetId } = query;
        const summaries = await this.readModelRepo.findMaintenanceSummary({
            tenantId,
            assetId,
        });
        const items = summaries.map(s => ({
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
    async getDepreciationSummary(headers, fromPeriod, toPeriod) {
        const tenantId = this.getTenantId(headers);
        const summaries = await this.readModelRepo.findDepreciationSummary({
            tenantId,
            periodFrom: fromPeriod,
            periodTo: toPeriod,
        });
        const items = summaries.map(s => ({
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
};
__decorate([
    Get('/renewals'),
    ApiOperation({
        summary: 'Projections de renouvellement (CAPEX)',
        description: 'CONTRAT IMM-BUD-REN-01: Investissements futurs pour Budget',
    }),
    ApiResponse({ status: 200, description: 'Projections de renouvellement' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RenewalQueryDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationBudgetController.prototype, "getRenewalProjections", null);
__decorate([
    Get('/renewals/by-year'),
    ApiOperation({
        summary: 'Projections de renouvellement par année',
        description: 'CONTRAT IMM-BUD-REN-02: CAPEX agrégé par année pour Budget',
    }),
    ApiResponse({ status: 200, description: 'Renouvellements par année' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, RenewalQueryDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationBudgetController.prototype, "getRenewalsByYear", null);
__decorate([
    Get('/maintenance'),
    ApiOperation({
        summary: 'Coûts de maintenance (OPEX)',
        description: 'CONTRAT IMM-BUD-MNT-01: Charges récurrentes pour Budget',
    }),
    ApiResponse({ status: 200, description: 'Résumé maintenance' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, MaintenanceSummaryQueryDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationBudgetController.prototype, "getMaintenanceSummary", null);
__decorate([
    Get('/depreciation'),
    ApiOperation({
        summary: 'Dotations d\'amortissement pour Budget',
        description: 'CONTRAT IMM-BUD-DEP-01: Dotations mensuelles pour Budget',
    }),
    ApiResponse({ status: 200, description: 'Résumé des dotations' }),
    __param(0, Headers()),
    __param(1, Query('fromPeriod')),
    __param(2, Query('toPeriod')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String]),
    __metadata("design:returntype", Promise)
], ImmobilisationBudgetController.prototype, "getDepreciationSummary", null);
ImmobilisationBudgetController = __decorate([
    ApiTags('Immobilisation - Budget Contract'),
    ApiBearerAuth(),
    ApiHeader({ name: 'X-Tenant-Id', required: true, description: 'Tenant ID (UUID)' }),
    Controller('/api/immobilisation/budget'),
    __metadata("design:paramtypes", [Object])
], ImmobilisationBudgetController);
export { ImmobilisationBudgetController };
//# sourceMappingURL=immobilisation-budget.controller.js.map