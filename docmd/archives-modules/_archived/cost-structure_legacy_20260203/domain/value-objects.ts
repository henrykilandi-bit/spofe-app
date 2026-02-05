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
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'XAF'
  ) {
    if (amount < 0) {
      throw new Error('MONEY_NEGATIVE: Amount must be >= 0');
    }
    if (!isFinite(amount)) {
      throw new Error('MONEY_INVALID: Amount must be finite');
    }
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('MONEY_CURRENCY_MISMATCH');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }
}

/**
 * Quantity - Quantité positive
 */
export class Quantity {
  constructor(public readonly value: number) {
    if (value < 0) {
      throw new Error('QUANTITY_NEGATIVE: Value must be >= 0');
    }
    if (!isFinite(value)) {
      throw new Error('QUANTITY_INVALID: Value must be finite');
    }
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }
}

/**
 * EconomicScenarios - Scénarios économiques (pessimiste, réaliste, optimiste)
 */
export class EconomicScenarios {
  constructor(
    public readonly pessimistic: number,
    public readonly realistic: number,
    public readonly optimistic: number
  ) {
    if (pessimistic < 0 || realistic < 0 || optimistic < 0) {
      throw new Error('SCENARIOS_NEGATIVE: All scenarios must be >= 0');
    }
    if (pessimistic > realistic || realistic > optimistic) {
      throw new Error('SCENARIOS_INVALID_ORDER: Must be pessimistic <= realistic <= optimistic');
    }
  }

  equals(other: EconomicScenarios): boolean {
    return (
      this.pessimistic === other.pessimistic &&
      this.realistic === other.realistic &&
      this.optimistic === other.optimistic
    );
  }
}

/**
 * CostLine - Ligne de coût
 */
export class CostLine {
  constructor(
    public readonly category: CostCategory,
    public readonly label: string,
    public readonly amount: Money,
    public readonly allocationRule?: string
  ) {
    if (!label || label.trim().length === 0) {
      throw new Error('COST_LINE_EMPTY_LABEL');
    }
  }

  equals(other: CostLine): boolean {
    return (
      this.category === other.category &&
      this.label === other.label &&
      this.amount.equals(other.amount) &&
      this.allocationRule === other.allocationRule
    );
  }
}

/**
 * EconomicAssumptions - Hypothèses économiques
 */
export class EconomicAssumptions {
  constructor(
    public readonly priceTarget: Money,
    public readonly expectedVolume: Quantity,
    public readonly capacityMax: Quantity,
    public readonly scenarios: EconomicScenarios
  ) {
    if (expectedVolume.value > capacityMax.value) {
      throw new Error('ASSUMPTIONS_VOLUME_EXCEEDS_CAPACITY');
    }
  }

  equals(other: EconomicAssumptions): boolean {
    return (
      this.priceTarget.equals(other.priceTarget) &&
      this.expectedVolume.equals(other.expectedVolume) &&
      this.capacityMax.equals(other.capacityMax) &&
      this.scenarios.equals(other.scenarios)
    );
  }
}

/**
 * SimulationMetrics - Résultats de simulation
 */
export class SimulationMetrics {
  constructor(
    public readonly unitCost: Money,
    public readonly totalCost: Money,
    public readonly grossMargin: number,
    public readonly netMargin: number,
    public readonly marginAt70: number,
    public readonly viableAt70: boolean
  ) {
    if (!isFinite(grossMargin) || !isFinite(netMargin) || !isFinite(marginAt70)) {
      throw new Error('METRICS_INVALID: Margins must be finite');
    }
  }
}
