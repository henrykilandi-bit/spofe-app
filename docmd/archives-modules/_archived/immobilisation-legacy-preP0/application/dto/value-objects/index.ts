/**
 * Value Objects - Module Immobilisation v1.0.0
 * Conformité: SPOFE Domain Standards
 * 
 * Exports pour les value objects du domaine immobilisation
 */

// ═══════════════════════════════════════════════════════════════════════════
// ENUMERATION TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type AllocationTargetType = 'PRODUCT' | 'SERVICE' | 'PROJECT';
export type MaintenanceType = 'MAINTENANCE' | 'REPAIR' | 'SERVICE';
export type DisposalType = 'SALE' | 'SCRAP';
export type AssetStatus = 'DRAFT' | 'IN_SERVICE' | 'DISPOSED' | 'MAINTENANCE';
export type DepreciationMethod = 'LINEAR';

// ═══════════════════════════════════════════════════════════════════════════
// MONEY VALUE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

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
    if (!currency || currency.length !== 3) {
      throw new Error('MONEY_INVALID_CURRENCY: Currency must be 3 chars');
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

  subtract(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('MONEY_CURRENCY_MISMATCH');
    }
    return new Money(this.amount - other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }

  isZero(): boolean {
    return this.amount === 0;
  }

  isPositive(): boolean {
    return this.amount > 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// PERCENTAGE VALUE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class Percentage {
  constructor(public readonly value: number) {
    if (value < 0 || value > 100) {
      throw new Error('PERCENTAGE_OUT_OF_RANGE: Value must be between 0 and 100');
    }
  }

  toDecimal(): number {
    return this.value / 100;
  }

  equals(other: Percentage): boolean {
    return this.value === other.value;
  }

  add(other: Percentage): Percentage {
    return new Percentage(this.value + other.value);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DATE RANGE VALUE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class DateRange {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date
  ) {
    if (startDate >= endDate) {
      throw new Error('DATE_RANGE_INVALID: Start date must be before end date');
    }
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }

  getDurationInYears(): number {
    const diffInMs = this.endDate.getTime() - this.startDate.getTime();
    return diffInMs / (1000 * 60 * 60 * 24 * 365.25);
  }

  equals(other: DateRange): boolean {
    return this.startDate.getTime() === other.startDate.getTime() &&
           this.endDate.getTime() === other.endDate.getTime();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// USEFUL LIFE VALUE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class UsefulLife {
  constructor(public readonly years: number) {
    if (years <= 0) {
      throw new Error('USEFUL_LIFE_INVALID: Years must be positive');
    }
    if (years > 100) {
      throw new Error('USEFUL_LIFE_EXCESSIVE: Years cannot exceed 100');
    }
  }

  equals(other: UsefulLife): boolean {
    return this.years === other.years;
  }

  toMonths(): number {
    return this.years * 12;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION PERCENTAGE VALUE OBJECT
// ═══════════════════════════════════════════════════════════════════════════

export class AllocationPercentage extends Percentage {
  constructor(value: number) {
    super(value);
    if (value <= 0) {
      throw new Error('ALLOCATION_PERCENTAGE_INVALID: Must be positive');
    }
  }

  static fromDecimal(decimal: number): AllocationPercentage {
    return new AllocationPercentage(decimal * 100);
  }
}