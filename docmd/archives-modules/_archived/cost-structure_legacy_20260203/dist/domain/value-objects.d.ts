/**
 * Cost-Structure Module - Value Objects
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Immutables, validés à la construction
 */
export type ProjectType = 'PRODUCT' | 'SERVICE';
export type CostCategory = 'VARIABLE' | 'FIXED' | 'INDIRECT';
export type ProjectStatus = 'DRAFT' | 'SIMULATED' | 'VALIDATED' | 'REJECTED';
export type VersionStatus = 'DRAFT' | 'FROZEN';
/**
 * Money - Montant monétaire positif
 */
export declare class Money {
    readonly amount: number;
    readonly currency: string;
    constructor(amount: number, currency?: string);
    equals(other: Money): boolean;
    add(other: Money): Money;
    multiply(factor: number): Money;
}
/**
 * Quantity - Quantité positive
 */
export declare class Quantity {
    readonly value: number;
    constructor(value: number);
    equals(other: Quantity): boolean;
}
/**
 * EconomicScenarios - Scénarios économiques (pessimiste, réaliste, optimiste)
 */
export declare class EconomicScenarios {
    readonly pessimistic: number;
    readonly realistic: number;
    readonly optimistic: number;
    constructor(pessimistic: number, realistic: number, optimistic: number);
    equals(other: EconomicScenarios): boolean;
}
/**
 * CostLine - Ligne de coût
 */
export declare class CostLine {
    readonly category: CostCategory;
    readonly label: string;
    readonly amount: Money;
    readonly allocationRule?: string | undefined;
    constructor(category: CostCategory, label: string, amount: Money, allocationRule?: string | undefined);
    equals(other: CostLine): boolean;
}
/**
 * EconomicAssumptions - Hypothèses économiques
 */
export declare class EconomicAssumptions {
    readonly priceTarget: Money;
    readonly expectedVolume: Quantity;
    readonly capacityMax: Quantity;
    readonly scenarios: EconomicScenarios;
    constructor(priceTarget: Money, expectedVolume: Quantity, capacityMax: Quantity, scenarios: EconomicScenarios);
    equals(other: EconomicAssumptions): boolean;
}
/**
 * SimulationMetrics - Résultats de simulation
 */
export declare class SimulationMetrics {
    readonly unitCost: Money;
    readonly totalCost: Money;
    readonly grossMargin: number;
    readonly netMargin: number;
    readonly marginAt70: number;
    readonly viableAt70: boolean;
    constructor(unitCost: Money, totalCost: Money, grossMargin: number, netMargin: number, marginAt70: number, viableAt70: boolean);
}
//# sourceMappingURL=value-objects.d.ts.map