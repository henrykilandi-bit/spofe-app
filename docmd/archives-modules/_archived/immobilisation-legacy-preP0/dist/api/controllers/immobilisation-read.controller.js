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
var _a;
import { Controller, Get, Param, Query, Headers, NotFoundException, BadRequestException, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiHeader, ApiBearerAuth, } from '@nestjs/swagger';
import { ImmobilisationReadModelRepository } from '../infrastructure/persistence';
// ═══════════════════════════════════════════════════════════════════════════
// CONTROLLER
// ═══════════════════════════════════════════════════════════════════════════
let ImmobilisationReadController = class ImmobilisationReadController {
    readModelRepo;
    constructor(readModelRepo) {
        this.readModelRepo = readModelRepo;
    }
    // ─────────────────────────────────────────────────────────────────────────
    // HELPER METHODS
    // ─────────────────────────────────────────────────────────────────────────
    /**
     * Extract tenant ID from headers
     */
    getTenantId(headers) {
        const tenantId = headers['x-tenant-id'];
        if (!tenantId) {
            throw new BadRequestException('X-Tenant-Id header is required');
        }
        return tenantId;
    }
    /**
     * Build paginated response
     */
    paginate(items, page, limit, total) {
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
    formatDate(date) {
        return date ? date.toISOString().split('T')[0] : undefined;
    }
    /**
     * Format datetime to ISO string
     */
    formatDateTime(date) {
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
    async listAssets(headers, query) {
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
        const items = assets.map(a => ({
            assetId: a.assetId,
            acquisitionCost: a.acquisitionCost,
            currency: a.currency,
            acquisitionDate: this.formatDate(a.acquisitionDate),
            usefulLifeMonths: a.usefulLifeMonths,
            depreciationMethod: a.depreciationMethod,
            residualValue: a.residualValue,
            renewalDate: this.formatDate(a.renewalDate),
            replacementCost: a.replacementCost ?? undefined,
            status: a.status,
            createdAt: this.formatDateTime(a.createdAt),
        }));
        return this.paginate(items, page, limit, total);
    }
    /**
     * GET /api/immobilisation/assets/net-book-value
     * VNC courante des actifs
     * Read-model: rm_asset_net_book_value
     */
    async listAssetNetBookValues(headers, query) {
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
        const items = nbvs.map(n => ({
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
    async getAssetDetail(headers, assetId) {
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
                acquisitionDate: this.formatDate(asset.acquisitionDate),
                usefulLifeMonths: asset.usefulLifeMonths,
                depreciationMethod: asset.depreciationMethod,
                residualValue: asset.residualValue,
                renewalDate: this.formatDate(asset.renewalDate),
                replacementCost: asset.replacementCost ?? undefined,
                status: asset.status,
                createdAt: this.formatDateTime(asset.createdAt),
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
                calculatedAt: this.formatDateTime(d.calculatedAt),
            })),
            maintenanceHistory: maintenance.map(m => ({
                maintenanceId: m.maintenanceId,
                assetId: m.assetId,
                maintenanceType: m.maintenanceType,
                maintenanceDate: this.formatDate(m.maintenanceDate),
                description: m.description,
                cost: m.cost,
                currency: m.currency,
                performedBy: m.performedBy,
                recordedAt: this.formatDateTime(m.recordedAt),
            })),
            allocations: allocations.map(a => ({
                allocationId: a.allocationId,
                assetId: a.assetId,
                targetType: a.targetType,
                targetId: a.targetId,
                percentage: a.percentage,
                effectiveFrom: this.formatDate(a.effectiveFrom),
                effectiveTo: this.formatDate(a.effectiveTo),
            })),
        };
    }
    /**
     * GET /api/immobilisation/assets/:assetId/depreciation
     * Historique des amortissements d'un actif
     * Read-model: rm_asset_depreciation_history
     */
    async getAssetDepreciationHistory(headers, assetId, query) {
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
        const items = history.map(d => ({
            scheduleId: d.scheduleId,
            period: d.period,
            depreciationAmount: d.depreciationAmount,
            accumulatedDepreciation: d.accumulatedDepreciation,
            netBookValue: d.netBookValue,
            currency: d.currency,
            calculatedAt: this.formatDateTime(d.calculatedAt),
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
    async getDepreciationSummary(headers, query) {
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
    async getDepreciationCostStructureExport(headers, query) {
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
    async listAllocations(headers, query) {
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
        const items = allocations.map(a => ({
            allocationId: a.allocationId,
            assetId: a.assetId,
            targetType: a.targetType,
            targetId: a.targetId,
            percentage: a.percentage,
            effectiveFrom: this.formatDate(a.effectiveFrom),
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
    async listMaintenanceHistory(headers, query) {
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
        const items = history.map(m => ({
            maintenanceId: m.maintenanceId,
            assetId: m.assetId,
            maintenanceType: m.maintenanceType,
            maintenanceDate: this.formatDate(m.maintenanceDate),
            description: m.description,
            cost: m.cost,
            currency: m.currency,
            performedBy: m.performedBy,
            recordedAt: this.formatDateTime(m.recordedAt),
        }));
        return this.paginate(items, page, limit, total);
    }
    /**
     * GET /api/immobilisation/maintenance/summary
     * Coûts de maintenance agrégés par actif
     * Read-model: rm_asset_maintenance_summary
     * CONTRACTUEL: Cost-Structure, Budget
     */
    async getMaintenanceSummary(headers, query) {
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
    async getMaintenanceByPeriod(headers, query) {
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
    async listRenewalProjections(headers, query) {
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
        const items = projections.map(p => ({
            assetId: p.assetId,
            acquisitionCost: p.acquisitionCost,
            renewalDate: this.formatDate(p.renewalDate),
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
    async listDisposals(headers, query) {
        const tenantId = this.getTenantId(headers);
        const { page = 1, limit = 20 } = query;
        const disposals = await this.readModelRepo.findDisposalHistory({
            tenantId,
            limit,
            offset: (page - 1) * limit,
        });
        const allDisposals = await this.readModelRepo.findDisposalHistory({ tenantId });
        const total = allDisposals.length;
        const items = disposals.map(d => ({
            disposalId: d.disposalId,
            assetId: d.assetId,
            disposalDate: this.formatDate(d.disposalDate),
            disposalType: d.disposalType,
            disposalValue: d.disposalValue,
            netBookValue: d.netBookValue,
            gainOrLoss: d.gainOrLoss,
            currency: d.currency,
            reason: d.reason ?? undefined,
            disposedAt: this.formatDateTime(d.disposedAt),
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
    async getKpi(headers) {
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
};
__decorate([
    Get('/assets'),
    ApiOperation({
        summary: 'Liste des immobilisations',
        description: 'Retourne tous les actifs du tenant. Read-model: rm_assets_current',
    }),
    ApiResponse({ status: 200, description: 'Liste paginée des actifs' }),
    ApiResponse({ status: 400, description: 'Paramètres invalides' }),
    ApiResponse({ status: 401, description: 'Non authentifié' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "listAssets", null);
__decorate([
    Get('/assets/net-book-value'),
    ApiOperation({
        summary: 'VNC courante des actifs',
        description: 'Retourne la VNC de tous les actifs. Read-model: rm_asset_net_book_value',
    }),
    ApiResponse({ status: 200, description: 'Liste des VNC' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "listAssetNetBookValues", null);
__decorate([
    Get('/assets/:assetId'),
    ApiOperation({
        summary: 'Détail d\'une immobilisation',
        description: 'Retourne le détail complet d\'un actif avec historiques',
    }),
    ApiParam({ name: 'assetId', description: 'ID de l\'actif' }),
    ApiResponse({ status: 200, description: 'Détail de l\'actif' }),
    ApiResponse({ status: 404, description: 'Actif non trouvé' }),
    __param(0, Headers()),
    __param(1, Param('assetId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "getAssetDetail", null);
__decorate([
    Get('/assets/:assetId/depreciation'),
    ApiOperation({
        summary: 'Historique des amortissements d\'un actif',
        description: 'Read-model: rm_asset_depreciation_history',
    }),
    ApiParam({ name: 'assetId', description: 'ID de l\'actif' }),
    ApiResponse({ status: 200, description: 'Historique des amortissements' }),
    __param(0, Headers()),
    __param(1, Param('assetId')),
    __param(2, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "getAssetDepreciationHistory", null);
__decorate([
    Get('/depreciation/summary'),
    ApiOperation({
        summary: 'Amortissements agrégés par période (Cost-Structure)',
        description: 'CONTRACTUEL: Cost-Structure. Read-model: rm_asset_depreciation_summary',
    }),
    ApiResponse({ status: 200, description: 'Résumé des amortissements' }),
    ApiResponse({ status: 400, description: 'Période obligatoire' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "getDepreciationSummary", null);
__decorate([
    Get('/depreciation/cost-structure-export'),
    ApiOperation({
        summary: 'Dotations ventilées pour Cost-Structure',
        description: 'CONTRACTUEL: Cost-Structure. Read-model: rm_depreciation_cost_structure_export',
    }),
    ApiResponse({ status: 200, description: 'Export des dotations ventilées' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "getDepreciationCostStructureExport", null);
__decorate([
    Get('/allocations'),
    ApiOperation({
        summary: 'Affectations effectives (Cost-Structure)',
        description: 'CONTRACTUEL: Cost-Structure. Read-model: rm_asset_allocation_effective',
    }),
    ApiResponse({ status: 200, description: 'Liste des affectations' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "listAllocations", null);
__decorate([
    Get('/maintenance'),
    ApiOperation({
        summary: 'Historique de maintenance',
        description: 'Read-model: rm_asset_maintenance_history',
    }),
    ApiResponse({ status: 200, description: 'Liste des interventions' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "listMaintenanceHistory", null);
__decorate([
    Get('/maintenance/summary'),
    ApiOperation({
        summary: 'Résumé de maintenance par actif (Cost-Structure, Budget)',
        description: 'CONTRACTUEL: Cost-Structure, Budget. Read-model: rm_asset_maintenance_summary',
    }),
    ApiResponse({ status: 200, description: 'Résumé de maintenance' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "getMaintenanceSummary", null);
__decorate([
    Get('/maintenance/by-period'),
    ApiOperation({
        summary: 'Maintenance par période (Cost-Structure)',
        description: 'CONTRACTUEL: Cost-Structure. Read-model: rm_asset_maintenance_by_period',
    }),
    ApiResponse({ status: 200, description: 'Maintenance par période' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "getMaintenanceByPeriod", null);
__decorate([
    Get('/renewals'),
    ApiOperation({
        summary: 'Projections de renouvellement (Budget)',
        description: 'CONTRACTUEL: Budget. Read-model: rm_assets_renewal_projection',
    }),
    ApiResponse({ status: 200, description: 'Projections de renouvellement' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "listRenewalProjections", null);
__decorate([
    Get('/disposals'),
    ApiOperation({
        summary: 'Historique des cessions',
        description: 'Read-model: rm_asset_disposal_history',
    }),
    ApiResponse({ status: 200, description: 'Historique des cessions' }),
    __param(0, Headers()),
    __param(1, Query()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "listDisposals", null);
__decorate([
    Get('/kpi'),
    ApiOperation({
        summary: 'KPIs patrimoniales',
        description: 'Read-model: rm_immobilisation_kpi',
    }),
    ApiResponse({ status: 200, description: 'KPIs du module' }),
    __param(0, Headers()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], ImmobilisationReadController.prototype, "getKpi", null);
ImmobilisationReadController = __decorate([
    ApiTags('Immobilisation - Read API (GET)'),
    ApiBearerAuth(),
    ApiHeader({ name: 'X-Tenant-Id', required: true, description: 'Tenant ID (UUID)' }),
    Controller('/api/immobilisation'),
    __metadata("design:paramtypes", [typeof (_a = typeof ImmobilisationReadModelRepository !== "undefined" && ImmobilisationReadModelRepository) === "function" ? _a : Object])
], ImmobilisationReadController);
export { ImmobilisationReadController };
//# sourceMappingURL=immobilisation-read.controller.js.map