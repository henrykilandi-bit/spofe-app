/**
 * Immobilisation Module - Aggregate: AssetAllocation
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Ventilation des coûts vers Cost-Structure
 */
import { Percentage, AllocationTarget, DateRange, } from './value-objects';
import { createBaseEvent } from './events';
import { AllocationInvariants, SecurityInvariants } from './invariants';
/**
 * AssetAllocation - Aggregate
 *
 * Ventile une immobilisation sur les produits / services / projets,
 * afin de répartir les amortissements.
 *
 * 👉 Pont contractuel avec Cost-Structure
 *
 * Invariants:
 * - IMM-ALL-01: 0 < percentage <= 100
 * - IMM-ALL-02: Σ percentages = 100% (par période)
 * - IMM-ALL-03: effectiveFrom <= effectiveTo
 * - IMM-ALL-04: no overlap for same asset + target
 * - IMM-ALL-05: allocation forbidden if asset DISPOSED
 *
 * 📌 Toute modification crée une nouvelle allocation
 * 📌 Historique conservé
 */
export class AssetAllocation {
    allocationId;
    assetId;
    tenantId;
    target;
    percentage;
    _effectiveFrom;
    _effectiveTo;
    createdAt;
    createdBy;
    constructor(allocationId, assetId, tenantId, target, percentage, _effectiveFrom, _effectiveTo, createdAt = new Date(), createdBy = 'system') {
        this.allocationId = allocationId;
        this.assetId = assetId;
        this.tenantId = tenantId;
        this.target = target;
        this.percentage = percentage;
        this._effectiveFrom = _effectiveFrom;
        this._effectiveTo = _effectiveTo;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════════════════════════
    get effectiveFrom() {
        return this._effectiveFrom;
    }
    get effectiveTo() {
        return this._effectiveTo;
    }
    get dateRange() {
        return new DateRange(this._effectiveFrom, this._effectiveTo);
    }
    get isActive() {
        const now = new Date();
        return this.dateRange.contains(now);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // FACTORY METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Créer une nouvelle allocation
     */
    static create(params) {
        // Validation des invariants
        SecurityInvariants.validateTenantIdPresent(params.tenantId);
        AllocationInvariants.validateAssetNotDisposed(params.assetStatus);
        const percentage = new Percentage(params.percentage);
        const dateRange = new DateRange(params.effectiveFrom, params.effectiveTo);
        const target = new AllocationTarget(params.targetType, params.targetId);
        // Vérifier qu'il n'y a pas de chevauchement pour le même target
        const sameTargetAllocations = params.existingAllocations
            .filter(a => a.target.equals(target))
            .map(a => a.dateRange);
        AllocationInvariants.validateNoOverlap(dateRange, sameTargetAllocations);
        const now = new Date();
        const aggregate = new AssetAllocation(params.allocationId, params.assetId, params.tenantId, target, percentage, params.effectiveFrom, params.effectiveTo, now, params.actorId);
        const event = {
            ...createBaseEvent(params.tenantId, params.actorId),
            type: 'AllocationCreated',
            allocationId: params.allocationId,
            assetId: params.assetId,
            targetType: params.targetType,
            targetId: params.targetId,
            percentage: percentage.value,
            effectiveFrom: params.effectiveFrom,
            effectiveTo: params.effectiveTo,
        };
        return { aggregate, events: [event] };
    }
    /**
     * Reconstituer depuis l'état persisté
     */
    static fromState(props) {
        return new AssetAllocation(props.allocationId, props.assetId, props.tenantId, new AllocationTarget(props.targetType, props.targetId), props.percentage, props.effectiveFrom, props.effectiveTo, props.createdAt, props.createdBy);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Terminer une allocation (définir une date de fin)
     */
    endAllocation(params) {
        if (this._effectiveTo) {
            throw new Error('ALLOCATION_ALREADY_ENDED: This allocation already has an end date');
        }
        if (params.endDate < this._effectiveFrom) {
            throw new Error('ALLOCATION_END_BEFORE_START: End date cannot be before start date');
        }
        this._effectiveTo = params.endDate;
        const event = {
            ...createBaseEvent(this.tenantId, params.actorId),
            type: 'AllocationEnded',
            allocationId: this.allocationId,
            assetId: this.assetId,
            endDate: params.endDate,
            reason: params.reason,
        };
        return [event];
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SERIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    toState() {
        return {
            allocationId: this.allocationId,
            assetId: this.assetId,
            tenantId: this.tenantId,
            targetType: this.target.type,
            targetId: this.target.id,
            percentage: this.percentage,
            effectiveFrom: this._effectiveFrom,
            effectiveTo: this._effectiveTo,
            createdAt: this.createdAt,
            createdBy: this.createdBy,
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Service de validation des allocations
 * Vérifie IMM-ALL-02: Σ percentages = 100% (par période)
 */
export class AllocationValidator {
    /**
     * Vérifier que les allocations d'un asset totalisent 100% pour une date donnée
     */
    static validateTotalAllocation(allocations, date) {
        const activeAllocations = allocations.filter(a => a.dateRange.contains(date));
        const total = activeAllocations.reduce((sum, a) => sum + a.percentage.value, 0);
        const isValid = Math.abs(total - 100) < 0.001;
        const missing = 100 - total;
        return { isValid, total, missing };
    }
    /**
     * Obtenir les allocations actives pour une période
     */
    static getActiveAllocationsForPeriod(allocations, periodStart, periodEnd) {
        const periodRange = new DateRange(periodStart, periodEnd);
        return allocations.filter(a => a.dateRange.overlaps(periodRange));
    }
}
//# sourceMappingURL=asset-allocation.aggregate.js.map