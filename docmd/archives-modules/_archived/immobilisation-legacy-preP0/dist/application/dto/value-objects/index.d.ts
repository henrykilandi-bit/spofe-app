/**
 * Value Objects - Module Immobilisation v1.0.0
 * Conformité: SPOFE Domain Standards
 *
 * Exports pour les value objects du domaine immobilisation
 */
export type AllocationTargetType = 'PRODUCT' | 'SERVICE' | 'PROJECT';
export type MaintenanceType = 'MAINTENANCE' | 'REPAIR' | 'SERVICE';
export type DisposalType = 'SALE' | 'SCRAP';
export type AssetStatus = 'DRAFT' | 'IN_SERVICE' | 'DISPOSED' | 'MAINTENANCE';
export type DepreciationMethod = 'LINEAR';
export declare class Money {
    readonly amount: number;
    readonly currency: string;
    constructor(amount: number, currency?: string);
    equals(other: Money): boolean;
    add(other: Money): Money;
    subtract(other: Money): Money;
    multiply(factor: number): Money;
    isZero(): boolean;
    isPositive(): boolean;
}
export declare class Percentage {
    readonly value: number;
    constructor(value: number);
    toDecimal(): number;
    equals(other: Percentage): boolean;
    add(other: Percentage): Percentage;
}
export declare class DateRange {
    readonly startDate: Date;
    readonly endDate: Date;
    constructor(startDate: Date, endDate: Date);
    contains(date: Date): boolean;
    getDurationInYears(): number;
    equals(other: DateRange): boolean;
}
export declare class UsefulLife {
    readonly years: number;
    constructor(years: number);
    equals(other: UsefulLife): boolean;
    toMonths(): number;
}
export declare class AllocationPercentage extends Percentage {
    constructor(value: number);
    static fromDecimal(decimal: number): AllocationPercentage;
}
//# sourceMappingURL=index.d.ts.map