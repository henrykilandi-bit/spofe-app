/**
 * Immobilisation Module - Value Objects
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Immutables, validés à la construction
 */
export type AssetStatus = 'IN_SERVICE' | 'DISPOSED' | 'DECOMMISSIONED';
export type DepreciationMethod = 'LINEAR';
export type MaintenanceType = 'MAINTENANCE' | 'REPAIR' | 'SERVICE';
export type DisposalType = 'SALE' | 'SCRAP';
export type AllocationTargetType = 'PRODUCT' | 'SERVICE' | 'PROJECT';
/**
 * Money - Montant monétaire
 * IMM-ASS-01: acquisitionCost > 0 (pour création)
 * IMM-ASS-03: residualValue >= 0
 */
export declare class Money {
    readonly amount: number;
    readonly currency: string;
    constructor(amount: number, currency?: string);
    /**
     * Factory pour montant strictement positif
     */
    static positive(amount: number, currency?: string): Money;
    /**
     * Factory pour montant non négatif
     */
    static nonNegative(amount: number, currency?: string): Money;
    equals(other: Money): boolean;
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(factor: number): Money;
    isGreaterThan(other: Money): boolean;
    isGreaterThanOrEqual(other: Money): boolean;
    isLessThanOrEqual(other: Money): boolean;
}
/**
 * UsefulLife - Durée de vie en mois
 * IMM-ASS-02: usefulLife > 0
 */
export declare class UsefulLife {
    readonly months: number;
    constructor(months: number);
    get years(): number;
    equals(other: UsefulLife): boolean;
}
/**
 * Percentage - Pourcentage de ventilation
 * IMM-ALL-01: 0 < percentage <= 100
 */
export declare class Percentage {
    readonly value: number;
    constructor(value: number);
    equals(other: Percentage): boolean;
    static sum(percentages: Percentage[]): number;
    static isComplete(percentages: Percentage[]): boolean;
}
/**
 * Period - Période comptable YYYY-MM
 */
export declare class Period {
    readonly year: number;
    readonly month: number;
    constructor(year: number, month: number);
    static fromString(period: string): Period;
    toString(): string;
    equals(other: Period): boolean;
    /**
     * Nombre de mois entre deux périodes
     */
    monthsUntil(other: Period): number;
    /**
     * Période suivante
     */
    next(): Period;
    /**
     * Période précédente
     */
    previous(): Period;
    isAfter(other: Period): boolean;
    isBefore(other: Period): boolean;
    static fromDate(date: Date): Period;
}
/**
 * AssetId - Identifiant unique d'immobilisation
 */
export declare class AssetId {
    readonly value: string;
    constructor(value: string);
    equals(other: AssetId): boolean;
    toString(): string;
}
/**
 * TenantId - Identifiant du tenant
 */
export declare class TenantId {
    readonly value: string;
    constructor(value: string);
    equals(other: TenantId): boolean;
    toString(): string;
}
/**
 * AllocationTarget - Cible de ventilation
 */
export declare class AllocationTarget {
    readonly type: AllocationTargetType;
    readonly id: string;
    constructor(type: AllocationTargetType, id: string);
    equals(other: AllocationTarget): boolean;
}
/**
 * DateRange - Plage de dates pour allocation
 * IMM-ALL-03: effectiveFrom <= effectiveTo
 */
export declare class DateRange {
    readonly from: Date;
    readonly to?: Date | undefined;
    constructor(from: Date, to?: Date | undefined);
    contains(date: Date): boolean;
    overlaps(other: DateRange): boolean;
    equals(other: DateRange): boolean;
}
/**
 * Description - Description textuelle
 */
export declare class Description {
    readonly value: string;
    constructor(value: string);
    equals(other: Description): boolean;
}
//# sourceMappingURL=value-objects.d.ts.map