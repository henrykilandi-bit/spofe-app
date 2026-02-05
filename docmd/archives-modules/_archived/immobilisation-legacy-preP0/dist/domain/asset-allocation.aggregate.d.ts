/**
 * Immobilisation Module - Aggregate: AssetAllocation
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Ventilation des coûts vers Cost-Structure
 */
import { Percentage, AllocationTarget, AllocationTargetType, DateRange, AssetStatus } from './value-objects';
import { ImmobilisationEvent } from './events';
export interface AssetAllocationProps {
    allocationId: string;
    assetId: string;
    tenantId: string;
    targetType: AllocationTargetType;
    targetId: string;
    percentage: Percentage;
    effectiveFrom: Date;
    effectiveTo?: Date;
    createdAt: Date;
    createdBy: string;
}
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
export declare class AssetAllocation {
    readonly allocationId: string;
    readonly assetId: string;
    readonly tenantId: string;
    readonly target: AllocationTarget;
    readonly percentage: Percentage;
    private _effectiveFrom;
    private _effectiveTo?;
    readonly createdAt: Date;
    readonly createdBy: string;
    private constructor();
    get effectiveFrom(): Date;
    get effectiveTo(): Date | undefined;
    get dateRange(): DateRange;
    get isActive(): boolean;
    /**
     * Créer une nouvelle allocation
     */
    static create(params: {
        allocationId: string;
        assetId: string;
        tenantId: string;
        targetType: AllocationTargetType;
        targetId: string;
        percentage: number;
        effectiveFrom: Date;
        effectiveTo?: Date;
        assetStatus: AssetStatus;
        existingAllocations: AssetAllocation[];
        actorId: string;
    }): {
        aggregate: AssetAllocation;
        events: ImmobilisationEvent[];
    };
    /**
     * Reconstituer depuis l'état persisté
     */
    static fromState(props: AssetAllocationProps): AssetAllocation;
    /**
     * Terminer une allocation (définir une date de fin)
     */
    endAllocation(params: {
        endDate: Date;
        reason: string;
        actorId: string;
    }): ImmobilisationEvent[];
    toState(): AssetAllocationProps;
}
/**
 * Service de validation des allocations
 * Vérifie IMM-ALL-02: Σ percentages = 100% (par période)
 */
export declare class AllocationValidator {
    /**
     * Vérifier que les allocations d'un asset totalisent 100% pour une date donnée
     */
    static validateTotalAllocation(allocations: AssetAllocation[], date: Date): {
        isValid: boolean;
        total: number;
        missing: number;
    };
    /**
     * Obtenir les allocations actives pour une période
     */
    static getActiveAllocationsForPeriod(allocations: AssetAllocation[], periodStart: Date, periodEnd: Date): AssetAllocation[];
}
//# sourceMappingURL=asset-allocation.aggregate.d.ts.map