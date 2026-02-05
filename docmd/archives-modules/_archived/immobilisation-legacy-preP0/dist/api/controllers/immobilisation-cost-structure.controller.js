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
import { DepreciationSummaryDTO, DepreciationCostStructureExportDTO, AllocationItemDTO, MaintenanceSummaryItemDTO, MaintenanceByPeriodItemDTO, DepreciationSummaryQueryDTO, DepreciationCostStructureExportQueryDTO, AllocationQueryDTO, MaintenanceSummaryQueryDTO, MaintenanceByPeriodQueryDTO, } from '../dto';
// ═══════════════════════════════════════════════════════════════════════════
// COST-STRUCTURE CONTRACT CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════
let ImmobilisationCostStructureController = class ImmobilisationCostStructureController {
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
    // DEPRECIATION (CONTRACTUEL)
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * GET /api/immobilisation/cost-structure/depreciation/summary
     * Amortissements agrégés par période
     * CONTRAT: IMM-CS-DEP-01
     */
    async getDepreciationSummary(headers, query) {
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
    async getDepreciationExport(headers, query) {
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
        const items = exports.map(e => ({
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
    async getAllocations(headers, query) {
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
            effectiveFrom: this.formatDate(a.effectiveFrom),
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
    async getMaintenanceSummary(headers, query) {
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
    async getMaintenanceByPeriod(headers, query) {
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
};
__decorate([
    Get('/depreciation/summary'),
    ApiOperation({
        summary: 'Amortissements agrégés par période',
        description: 'CONTRAT IMM-CS-DEP-01: Dotations mensuelles pour Cost-Structure',
    }),
    ApiResponse({ status: 200, description: 'Résumé des amortissements', type: DepreciationSummaryDTO }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, DepreciationSummaryQueryDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationCostStructureController.prototype, "getDepreciationSummary", null);
__decorate([
    Get('/depreciation/export'),
    ApiOperation({
        summary: 'Dotations ventilées pour intégration Cost-Structure',
        description: 'CONTRAT IMM-CS-DEP-02: Dotations ventilées par cible (PRODUCT/SERVICE/PROJECT)',
    }),
    ApiResponse({ status: 200, description: 'Export des dotations', type: DepreciationCostStructureExportDTO }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, DepreciationCostStructureExportQueryDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationCostStructureController.prototype, "getDepreciationExport", null);
__decorate([
    Get('/allocations'),
    ApiOperation({
        summary: 'Affectations effectives des immobilisations',
        description: 'CONTRAT IMM-CS-ALL-01: Ventilations par cible pour Cost-Structure',
    }),
    ApiResponse({ status: 200, description: 'Liste des affectations', type: [AllocationItemDTO] }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, AllocationQueryDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationCostStructureController.prototype, "getAllocations", null);
__decorate([
    Get('/maintenance/summary'),
    ApiOperation({
        summary: 'Résumé de maintenance par actif',
        description: 'CONTRAT IMM-CS-MNT-01: Coûts indirects pour Cost-Structure',
    }),
    ApiResponse({ status: 200, description: 'Résumé maintenance', type: [MaintenanceSummaryItemDTO] }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, MaintenanceSummaryQueryDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationCostStructureController.prototype, "getMaintenanceSummary", null);
__decorate([
    Get('/maintenance/by-period'),
    ApiOperation({
        summary: 'Coûts de maintenance par période',
        description: 'CONTRAT IMM-CS-MNT-02: Coûts périodiques pour Cost-Structure',
    }),
    ApiResponse({ status: 200, description: 'Maintenance par période', type: [MaintenanceByPeriodItemDTO] }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, MaintenanceByPeriodQueryDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationCostStructureController.prototype, "getMaintenanceByPeriod", null);
ImmobilisationCostStructureController = __decorate([
    ApiTags('Immobilisation - Cost-Structure Contract'),
    ApiBearerAuth(),
    ApiHeader({ name: 'X-Tenant-Id', required: true, description: 'Tenant ID (UUID)' }),
    Controller('/api/immobilisation/cost-structure'),
    __metadata("design:paramtypes", [Object])
], ImmobilisationCostStructureController);
export { ImmobilisationCostStructureController };
//# sourceMappingURL=immobilisation-cost-structure.controller.js.map