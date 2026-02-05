/**
 * Immobilisation Module - Value Objects
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Immutables, validés à la construction
 */

// ═══════════════════════════════════════════════════════════════════════════
// TYPES & ENUMS
// ═══════════════════════════════════════════════════════════════════════════

export type AssetStatus = 'IN_SERVICE' | 'DISPOSED' | 'DECOMMISSIONED';
export type DepreciationMethod = 'LINEAR';
export type MaintenanceType = 'MAINTENANCE' | 'REPAIR' | 'SERVICE';
export type DisposalType = 'SALE' | 'SCRAP';
export type AllocationTargetType = 'PRODUCT' | 'SERVICE' | 'PROJECT';

// ═══════════════════════════════════════════════════════════════════════════
// VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Money - Montant monétaire
 * IMM-ASS-01: acquisitionCost > 0 (pour création)
 * IMM-ASS-03: residualValue >= 0
 */
export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'XAF'
  ) {
    if (!isFinite(amount)) {
      throw new Error('MONEY_INVALID: Amount must be finite');
    }
  }

  /**
   * Factory pour montant strictement positif
   */
  static positive(amount: number, currency: string = 'XAF'): Money {
    if (amount <= 0) {
      throw new Error('MONEY_NOT_POSITIVE: Amount must be > 0');
    }
    return new Money(amount, currency);
  }

  /**
   * Factory pour montant non négatif
   */
  static nonNegative(amount: number, currency: string = 'XAF'): Money {
    if (amount < 0) {
      throw new Error('MONEY_NEGATIVE: Amount must be >= 0');
    }
    return new Money(amount, currency);
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

  isGreaterThan(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('MONEY_CURRENCY_MISMATCH');
    }
    return this.amount > other.amount;
  }

  isGreaterThanOrEqual(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('MONEY_CURRENCY_MISMATCH');
    }
    return this.amount >= other.amount;
  }

  isLessThanOrEqual(other: Money): boolean {
    if (this.currency !== other.currency) {
      throw new Error('MONEY_CURRENCY_MISMATCH');
    }
    return this.amount <= other.amount;
  }
}

/**
 * UsefulLife - Durée de vie en mois
 * IMM-ASS-02: usefulLife > 0
 */
export class UsefulLife {
  constructor(public readonly months: number) {
    if (!Number.isInteger(months) || months <= 0) {
      throw new Error('USEFUL_LIFE_INVALID: Must be a positive integer (months)');
    }
  }

  get years(): number {
    return this.months / 12;
  }

  equals(other: UsefulLife): boolean {
    return this.months === other.months;
  }
}

/**
 * Percentage - Pourcentage de ventilation
 * IMM-ALL-01: 0 < percentage <= 100
 */
export class Percentage {
  constructor(public readonly value: number) {
    if (value <= 0 || value > 100) {
      throw new Error('PERCENTAGE_INVALID: Must be > 0 and <= 100');
    }
    if (!isFinite(value)) {
      throw new Error('PERCENTAGE_INVALID: Must be finite');
    }
  }

  equals(other: Percentage): boolean {
    return this.value === other.value;
  }

  static sum(percentages: Percentage[]): number {
    return percentages.reduce((sum, p) => sum + p.value, 0);
  }

  static isComplete(percentages: Percentage[]): boolean {
    const sum = Percentage.sum(percentages);
    return Math.abs(sum - 100) < 0.001; // Tolérance pour erreurs d'arrondi
  }
}

/**
 * Period - Période comptable YYYY-MM
 */
export class Period {
  constructor(
    public readonly year: number,
    public readonly month: number
  ) {
    if (!Number.isInteger(year) || year < 1900 || year > 2100) {
      throw new Error('PERIOD_INVALID_YEAR');
    }
    if (!Number.isInteger(month) || month < 1 || month > 12) {
      throw new Error('PERIOD_INVALID_MONTH');
    }
  }

  static fromString(period: string): Period {
    const match = period.match(/^(\d{4})-(\d{2})$/);
    if (!match) {
      throw new Error('PERIOD_INVALID_FORMAT: Expected YYYY-MM');
    }
    return new Period(parseInt(match[1], 10), parseInt(match[2], 10));
  }

  toString(): string {
    return `${this.year}-${this.month.toString().padStart(2, '0')}`;
  }

  equals(other: Period): boolean {
    return this.year === other.year && this.month === other.month;
  }

  /**
   * Nombre de mois entre deux périodes
   */
  monthsUntil(other: Period): number {
    return (other.year - this.year) * 12 + (other.month - this.month);
  }

  /**
   * Période suivante
   */
  next(): Period {
    if (this.month === 12) {
      return new Period(this.year + 1, 1);
    }
    return new Period(this.year, this.month + 1);
  }

  /**
   * Période précédente
   */
  previous(): Period {
    if (this.month === 1) {
      return new Period(this.year - 1, 12);
    }
    return new Period(this.year, this.month - 1);
  }

  isAfter(other: Period): boolean {
    return this.year > other.year || (this.year === other.year && this.month > other.month);
  }

  isBefore(other: Period): boolean {
    return this.year < other.year || (this.year === other.year && this.month < other.month);
  }

  static fromDate(date: Date): Period {
    return new Period(date.getFullYear(), date.getMonth() + 1);
  }
}

/**
 * AssetId - Identifiant unique d'immobilisation
 */
export class AssetId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('ASSET_ID_EMPTY');
    }
  }

  equals(other: AssetId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * TenantId - Identifiant du tenant
 */
export class TenantId {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('TENANT_ID_EMPTY');
    }
  }

  equals(other: TenantId): boolean {
    return this.value === other.value;
  }

  toString(): string {
    return this.value;
  }
}

/**
 * AllocationTarget - Cible de ventilation
 */
export class AllocationTarget {
  constructor(
    public readonly type: AllocationTargetType,
    public readonly id: string
  ) {
    if (!id || id.trim().length === 0) {
      throw new Error('ALLOCATION_TARGET_ID_EMPTY');
    }
  }

  equals(other: AllocationTarget): boolean {
    return this.type === other.type && this.id === other.id;
  }
}

/**
 * DateRange - Plage de dates pour allocation
 * IMM-ALL-03: effectiveFrom <= effectiveTo
 */
export class DateRange {
  constructor(
    public readonly from: Date,
    public readonly to?: Date
  ) {
    if (to && from > to) {
      throw new Error('DATE_RANGE_INVALID: from must be <= to');
    }
  }

  contains(date: Date): boolean {
    if (date < this.from) return false;
    if (this.to && date > this.to) return false;
    return true;
  }

  overlaps(other: DateRange): boolean {
    // Si l'une des deux n'a pas de fin, elle s'étend indéfiniment
    const thisEnd = this.to ?? new Date('9999-12-31');
    const otherEnd = other.to ?? new Date('9999-12-31');

    return this.from <= otherEnd && other.from <= thisEnd;
  }

  equals(other: DateRange): boolean {
    return (
      this.from.getTime() === other.from.getTime() &&
      this.to?.getTime() === other.to?.getTime()
    );
  }
}

/**
 * Description - Description textuelle
 */
export class Description {
  constructor(public readonly value: string) {
    if (!value || value.trim().length === 0) {
      throw new Error('DESCRIPTION_EMPTY');
    }
    if (value.length > 1000) {
      throw new Error('DESCRIPTION_TOO_LONG: Max 1000 characters');
    }
  }

  equals(other: Description): boolean {
    return this.value === other.value;
  }
}
