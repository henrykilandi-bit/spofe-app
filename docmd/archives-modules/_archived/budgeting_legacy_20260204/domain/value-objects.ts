/**
 * Value Objects - Module Budget
 * Objets immuables sans identité propre
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 3
 */

export class Period {
  constructor(
    public readonly startDate: Date,
    public readonly endDate: Date,
    public readonly granularity: 'MONTHLY'
  ) {
    if (startDate >= endDate) {
      throw new Error('INVALID_PERIOD: startDate must be before endDate');
    }
  }

  equals(other: Period): boolean {
    return (
      this.startDate.getTime() === other.startDate.getTime() &&
      this.endDate.getTime() === other.endDate.getTime() &&
      this.granularity === other.granularity
    );
  }

  contains(date: Date): boolean {
    return date >= this.startDate && date <= this.endDate;
  }
}

export class Quantity {
  constructor(public readonly value: number) {
    if (value < 0) {
      throw new Error('INVALID_QUANTITY: value must be >= 0');
    }
  }

  equals(other: Quantity): boolean {
    return this.value === other.value;
  }

  add(other: Quantity): Quantity {
    return new Quantity(this.value + other.value);
  }
}

export class Money {
  constructor(
    public readonly amount: number,
    public readonly currency: string = 'XOF'
  ) {
    if (amount < 0) {
      throw new Error('INVALID_MONEY: amount must be >= 0');
    }
    if (!currency || currency.length !== 3) {
      throw new Error('INVALID_CURRENCY: must be ISO 4217 code');
    }
  }

  equals(other: Money): boolean {
    return this.amount === other.amount && this.currency === other.currency;
  }

  add(other: Money): Money {
    if (this.currency !== other.currency) {
      throw new Error('CURRENCY_MISMATCH: cannot add different currencies');
    }
    return new Money(this.amount + other.amount, this.currency);
  }

  multiply(factor: number): Money {
    return new Money(this.amount * factor, this.currency);
  }
}

export class PaymentTerm {
  constructor(public readonly days: number) {
    if (days < 0) {
      throw new Error('INVALID_PAYMENT_TERM: days must be >= 0');
    }
  }

  equals(other: PaymentTerm): boolean {
    return this.days === other.days;
  }
}

export class PaymentTermsSet {
  constructor(
    public readonly customerTerms: PaymentTerm,
    public readonly supplierTerms: PaymentTerm
  ) {}

  equals(other: PaymentTermsSet): boolean {
    return (
      this.customerTerms.equals(other.customerTerms) &&
      this.supplierTerms.equals(other.supplierTerms)
    );
  }
}
