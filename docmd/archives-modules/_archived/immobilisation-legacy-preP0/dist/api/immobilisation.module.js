/**
 * Immobilisation Module - NestJS Module
 * Conformité: API_READ_ONLY.md v1.0.0
 *
 * Module NestJS pour l'enregistrement des controllers read-only.
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
import { ImmobilisationReadController, ImmobilisationCostStructureController, ImmobilisationBudgetController, } from './controllers';
import { PostgresImmobilisationReadModelRepository } from '../infrastructure/persistence';
import { IMMOBILISATION_READ_MODEL_REPOSITORY } from '../infrastructure/persistence';
// ═══════════════════════════════════════════════════════════════════════════
// MODULE DEFINITION
// ═══════════════════════════════════════════════════════════════════════════
let ImmobilisationReadModule = class ImmobilisationReadModule {
};
ImmobilisationReadModule = __decorate([
    Module({
        controllers: [
            ImmobilisationReadController,
            ImmobilisationCostStructureController,
            ImmobilisationBudgetController,
        ],
        providers: [
            {
                provide: IMMOBILISATION_READ_MODEL_REPOSITORY,
                useClass: PostgresImmobilisationReadModelRepository,
            },
        ],
        exports: [
            IMMOBILISATION_READ_MODEL_REPOSITORY,
        ],
    })
], ImmobilisationReadModule);
export { ImmobilisationReadModule };
export async function registerImmobilisationRoutes(fastify, readModelRepo) {
    // Helper to get tenant ID
    const getTenantId = (request) => {
        const tenantId = request.headers['x-tenant-id'];
        if (!tenantId) {
            throw { statusCode: 400, message: 'X-Tenant-Id header is required' };
        }
        return tenantId;
    };
    // Helper to paginate
    const paginate = (items, page, limit, total) => ({
        items,
        page,
        limit,
        total,
        hasMore: page * limit < total,
    });
    const formatDate = (date) => date ? date.toISOString().split('T')[0] : undefined;
    const formatDateTime = (date) => date ? date.toISOString() : undefined;
    // ─────────────────────────────────────────────────────────────────────────
    // ASSET ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/immobilisation/assets
    fastify.get('/api/immobilisation/assets', async (request, reply) => {
        const tenantId = getTenantId(request);
        const query = request.query;
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const status = query.status;
        const assets = await readModelRepo.findAllAssets({
            tenantId,
            status,
            limit,
            offset: (page - 1) * limit,
        });
        const allAssets = await readModelRepo.findAllAssets({ tenantId, status });
        const total = allAssets.length;
        return paginate(assets.map(a => ({
            assetId: a.assetId,
            acquisitionCost: a.acquisitionCost,
            currency: a.currency,
            acquisitionDate: formatDate(a.acquisitionDate),
            usefulLifeMonths: a.usefulLifeMonths,
            depreciationMethod: a.depreciationMethod,
            residualValue: a.residualValue,
            renewalDate: formatDate(a.renewalDate),
            replacementCost: a.replacementCost,
            status: a.status,
            createdAt: formatDateTime(a.createdAt),
        })), page, limit, total);
    });
    // GET /api/immobilisation/assets/net-book-value
    fastify.get('/api/immobilisation/assets/net-book-value', async (request, reply) => {
        const tenantId = getTenantId(request);
        const query = request.query;
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const nbvs = await readModelRepo.findAssetNetBookValues({
            tenantId,
            status: query.status,
            assetId: query.assetId,
            limit,
            offset: (page - 1) * limit,
        });
        const allNbvs = await readModelRepo.findAssetNetBookValues({ tenantId });
        const total = allNbvs.length;
        return paginate(nbvs.map(n => ({
            assetId: n.assetId,
            acquisitionCost: n.acquisitionCost,
            residualValue: n.residualValue,
            accumulatedDepreciation: n.accumulatedDepreciation,
            netBookValue: n.netBookValue,
            currency: n.currency,
            status: n.status,
            lastPeriod: n.lastPeriod,
        })), page, limit, total);
    });
    // GET /api/immobilisation/assets/:assetId
    fastify.get('/api/immobilisation/assets/:assetId', async (request, reply) => {
        const tenantId = getTenantId(request);
        const { assetId } = request.params;
        const asset = await readModelRepo.findAssetById(tenantId, assetId);
        if (!asset) {
            reply.status(404);
            return { error: 'Asset not found' };
        }
        const nbv = await readModelRepo.findAssetNetBookValue(tenantId, assetId);
        const depreciation = await readModelRepo.findAssetDepreciationHistory(tenantId, assetId);
        const maintenance = await readModelRepo.findAssetMaintenanceHistory(tenantId, assetId);
        const allocations = await readModelRepo.findAssetAllocations(tenantId, assetId, true);
        return {
            asset: {
                assetId: asset.assetId,
                acquisitionCost: asset.acquisitionCost,
                currency: asset.currency,
                acquisitionDate: formatDate(asset.acquisitionDate),
                usefulLifeMonths: asset.usefulLifeMonths,
                depreciationMethod: asset.depreciationMethod,
                residualValue: asset.residualValue,
                renewalDate: formatDate(asset.renewalDate),
                replacementCost: asset.replacementCost,
                status: asset.status,
                createdAt: formatDateTime(asset.createdAt),
            },
            netBookValue: nbv ? {
                acquisitionCost: nbv.acquisitionCost,
                residualValue: nbv.residualValue,
                accumulatedDepreciation: nbv.accumulatedDepreciation,
                netBookValue: nbv.netBookValue,
                currency: nbv.currency,
                lastPeriod: nbv.lastPeriod,
            } : null,
            depreciationHistory: depreciation.map(d => ({
                scheduleId: d.scheduleId,
                period: d.period,
                depreciationAmount: d.depreciationAmount,
                accumulatedDepreciation: d.accumulatedDepreciation,
                netBookValue: d.netBookValue,
                calculatedAt: formatDateTime(d.calculatedAt),
            })),
            maintenanceHistory: maintenance.map(m => ({
                maintenanceId: m.maintenanceId,
                maintenanceType: m.maintenanceType,
                maintenanceDate: formatDate(m.maintenanceDate),
                description: m.description,
                cost: m.cost,
                currency: m.currency,
                performedBy: m.performedBy,
                recordedAt: formatDateTime(m.recordedAt),
            })),
            allocations: allocations.map(a => ({
                allocationId: a.allocationId,
                targetType: a.targetType,
                targetId: a.targetId,
                percentage: a.percentage,
                effectiveFrom: formatDate(a.effectiveFrom),
                effectiveTo: formatDate(a.effectiveTo),
            })),
        };
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DEPRECIATION ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/immobilisation/depreciation/summary
    fastify.get('/api/immobilisation/depreciation/summary', async (request, reply) => {
        const tenantId = getTenantId(request);
        const { period } = request.query;
        if (!period) {
            reply.status(400);
            return { error: 'period query parameter is required' };
        }
        const summaries = await readModelRepo.findDepreciationSummary({
            tenantId,
            periodFrom: period,
            periodTo: period,
        });
        if (summaries.length === 0) {
            return { period, totalDepreciation: 0, assetCount: 0, currency: 'XAF' };
        }
        const s = summaries[0];
        return {
            period: s.period,
            totalDepreciation: s.totalDepreciation,
            assetCount: s.assetCount,
            currency: s.currency,
        };
    });
    // GET /api/immobilisation/depreciation/cost-structure-export
    fastify.get('/api/immobilisation/depreciation/cost-structure-export', async (request, reply) => {
        const tenantId = getTenantId(request);
        const { period } = request.query;
        if (!period) {
            reply.status(400);
            return { error: 'period query parameter is required' };
        }
        const exports = await readModelRepo.findDepreciationForCostStructure({
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
    });
    // ─────────────────────────────────────────────────────────────────────────
    // ALLOCATION ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/immobilisation/allocations
    fastify.get('/api/immobilisation/allocations', async (request, reply) => {
        const tenantId = getTenantId(request);
        const query = request.query;
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const allocations = await readModelRepo.findEffectiveAllocations({
            tenantId,
            assetId: query.assetId,
            targetType: query.targetType,
            targetId: query.targetId,
            limit,
            offset: (page - 1) * limit,
        });
        const allAllocations = await readModelRepo.findEffectiveAllocations({
            tenantId,
            assetId: query.assetId,
            targetType: query.targetType,
            targetId: query.targetId,
        });
        const total = allAllocations.length;
        return paginate(allocations.map(a => ({
            allocationId: a.allocationId,
            assetId: a.assetId,
            targetType: a.targetType,
            targetId: a.targetId,
            percentage: a.percentage,
            effectiveFrom: formatDate(a.effectiveFrom),
            effectiveTo: formatDate(a.effectiveTo),
        })), page, limit, total);
    });
    // ─────────────────────────────────────────────────────────────────────────
    // MAINTENANCE ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/immobilisation/maintenance
    fastify.get('/api/immobilisation/maintenance', async (request, reply) => {
        const tenantId = getTenantId(request);
        const query = request.query;
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const history = await readModelRepo.findMaintenanceHistory({
            tenantId,
            assetId: query.assetId,
            limit,
            offset: (page - 1) * limit,
        });
        const allHistory = await readModelRepo.findMaintenanceHistory({ tenantId, assetId: query.assetId });
        const total = allHistory.length;
        return paginate(history.map(m => ({
            maintenanceId: m.maintenanceId,
            assetId: m.assetId,
            maintenanceType: m.maintenanceType,
            maintenanceDate: formatDate(m.maintenanceDate),
            description: m.description,
            cost: m.cost,
            currency: m.currency,
            performedBy: m.performedBy,
            recordedAt: formatDateTime(m.recordedAt),
        })), page, limit, total);
    });
    // GET /api/immobilisation/maintenance/summary
    fastify.get('/api/immobilisation/maintenance/summary', async (request, reply) => {
        const tenantId = getTenantId(request);
        const { assetId } = request.query;
        const summaries = await readModelRepo.findMaintenanceSummary({
            tenantId,
            assetId,
        });
        return {
            items: summaries.map(s => ({
                assetId: s.assetId,
                totalMaintenanceCost: s.totalMaintenanceCost,
                interventionCount: s.interventionCount,
                firstIntervention: formatDate(s.firstIntervention),
                lastIntervention: formatDate(s.lastIntervention),
                currency: s.currency,
            })),
            total: summaries.length,
        };
    });
    // GET /api/immobilisation/maintenance/by-period
    fastify.get('/api/immobilisation/maintenance/by-period', async (request, reply) => {
        const tenantId = getTenantId(request);
        const { fromPeriod, toPeriod } = request.query;
        const periods = await readModelRepo.findMaintenanceByPeriod({
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
    });
    // ─────────────────────────────────────────────────────────────────────────
    // RENEWAL ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/immobilisation/renewals
    fastify.get('/api/immobilisation/renewals', async (request, reply) => {
        const tenantId = getTenantId(request);
        const query = request.query;
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const fromYear = query.fromYear ? parseInt(query.fromYear, 10) : undefined;
        const toYear = query.toYear ? parseInt(query.toYear, 10) : undefined;
        const projections = await readModelRepo.findRenewalProjections({
            tenantId,
            renewalYearFrom: fromYear,
            renewalYearTo: toYear,
            limit,
            offset: (page - 1) * limit,
        });
        const allProjections = await readModelRepo.findRenewalProjections({
            tenantId,
            renewalYearFrom: fromYear,
            renewalYearTo: toYear,
        });
        const total = allProjections.length;
        return paginate(projections.map(p => ({
            assetId: p.assetId,
            acquisitionCost: p.acquisitionCost,
            renewalDate: formatDate(p.renewalDate),
            replacementCost: p.replacementCost,
            renewalYear: p.renewalYear,
            renewalMonth: p.renewalMonth,
            currency: p.currency,
        })), page, limit, total);
    });
    // ─────────────────────────────────────────────────────────────────────────
    // DISPOSAL ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/immobilisation/disposals
    fastify.get('/api/immobilisation/disposals', async (request, reply) => {
        const tenantId = getTenantId(request);
        const query = request.query;
        const page = parseInt(query.page || '1', 10);
        const limit = parseInt(query.limit || '20', 10);
        const disposals = await readModelRepo.findDisposalHistory({
            tenantId,
            limit,
            offset: (page - 1) * limit,
        });
        const allDisposals = await readModelRepo.findDisposalHistory({ tenantId });
        const total = allDisposals.length;
        return paginate(disposals.map(d => ({
            disposalId: d.disposalId,
            assetId: d.assetId,
            disposalDate: formatDate(d.disposalDate),
            disposalType: d.disposalType,
            disposalValue: d.disposalValue,
            netBookValue: d.netBookValue,
            gainOrLoss: d.gainOrLoss,
            currency: d.currency,
            reason: d.reason,
            disposedAt: formatDateTime(d.disposedAt),
        })), page, limit, total);
    });
    // ─────────────────────────────────────────────────────────────────────────
    // KPI ROUTES
    // ─────────────────────────────────────────────────────────────────────────
    // GET /api/immobilisation/kpi
    fastify.get('/api/immobilisation/kpi', async (request, reply) => {
        const tenantId = getTenantId(request);
        const kpi = await readModelRepo.findKpi(tenantId);
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
            totalAcquisitionCost: kpi.totalAcquisitionCost,
            totalNetBookValue: kpi.totalNetBookValue,
            totalAccumulatedDepreciation: kpi.totalAccumulatedDepreciation,
            currency: kpi.currency,
        };
    });
}
//# sourceMappingURL=immobilisation.module.js.map