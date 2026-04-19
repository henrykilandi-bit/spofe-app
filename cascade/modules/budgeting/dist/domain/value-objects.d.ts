/**
 * Value Objects - Module Budget
 * Objets immuables sans identité propre
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 3
 */
export declare class Period {
    readonly startDate: Date;
    readonly endDate: Date;
    readonly granularity: 'MONTHLY';
    constructor(startDate: Date, endDate: Date, granularity: 'MONTHLY');
    equals(other: Period): boolean;
    contains(date: Date): boolean;
}
export declare class Quantity {
    readonly value: number;
    constructor(value: number);
    equals(other: Quantity): boolean;
    add(other: Quantity): Quantity;
}
export declare class Money {
    readonly amount: number;
    readonly currency: string;
    constructor(amount: number, currency?: string);
    equals(other: Money): boolean;
    add(other: Money): Money;
    multiply(factor: number): Money;
}
export declare class PaymentTerm {
    readonly days: number;
    constructor(days: number);
    equals(other: PaymentTerm): boolean;
}
export declare class PaymentTermsSet {
    readonly customerTerms: PaymentTerm;
    readonly supplierTerms: PaymentTerm;
    constructor(customerTerms: PaymentTerm, supplierTerms: PaymentTerm);
    equals(other: PaymentTermsSet): boolean;
}
//# sourceMappingURL=value-objects.d.ts.map