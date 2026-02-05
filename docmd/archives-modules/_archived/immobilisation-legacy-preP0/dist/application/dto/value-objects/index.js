/**
 * Value Objects - Module Immobilisation v1.0.0
 * Conformité: SPOFE Domain Standards
 *
 * Exports pour les value objects du domaine immobilisation
 */
// ═══════════════════════════════════════════════════════════════════════════
// MONEY VALUE OBJECT
// ═══════════════════════════════════════════════════════════════════════════
export class Money {
    amount;
    currency;
    constructor(amount, currency = 'XAF') {
        this.amount = amount;
        this.currency = currency;
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
    equals(other) {
        return this.amount === other.amount && this.currency === other.currency;
    }
    add(other) {
        if (this.currency !== other.currency) {
            throw new Error('MONEY_CURRENCY_MISMATCH');
        }
        return new Money(this.amount + other.amount, this.currency);
    }
    subtract(other) {
        if (this.currency !== other.currency) {
            throw new Error('MONEY_CURRENCY_MISMATCH');
        }
        return new Money(this.amount - other.amount, this.currency);
    }
    multiply(factor) {
        return new Money(this.amount * factor, this.currency);
    }
    isZero() {
        return this.amount === 0;
    }
    isPositive() {
        return this.amount > 0;
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// PERCENTAGE VALUE OBJECT
// ═══════════════════════════════════════════════════════════════════════════
export class Percentage {
    value;
    constructor(value) {
        this.value = value;
        if (value < 0 || value > 100) {
            throw new Error('PERCENTAGE_OUT_OF_RANGE: Value must be between 0 and 100');
        }
    }
    toDecimal() {
        return this.value / 100;
    }
    equals(other) {
        return this.value === other.value;
    }
    add(other) {
        return new Percentage(this.value + other.value);
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// DATE RANGE VALUE OBJECT
// ═══════════════════════════════════════════════════════════════════════════
export class DateRange {
    startDate;
    endDate;
    constructor(startDate, endDate) {
        this.startDate = startDate;
        this.endDate = endDate;
        if (startDate >= endDate) {
            throw new Error('DATE_RANGE_INVALID: Start date must be before end date');
        }
    }
    contains(date) {
        return date >= this.startDate && date <= this.endDate;
    }
    getDurationInYears() {
        const diffInMs = this.endDate.getTime() - this.startDate.getTime();
        return diffInMs / (1000 * 60 * 60 * 24 * 365.25);
    }
    equals(other) {
        return this.startDate.getTime() === other.startDate.getTime() &&
            this.endDate.getTime() === other.endDate.getTime();
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// USEFUL LIFE VALUE OBJECT
// ═══════════════════════════════════════════════════════════════════════════
export class UsefulLife {
    years;
    constructor(years) {
        this.years = years;
        if (years <= 0) {
            throw new Error('USEFUL_LIFE_INVALID: Years must be positive');
        }
        if (years > 100) {
            throw new Error('USEFUL_LIFE_EXCESSIVE: Years cannot exceed 100');
        }
    }
    equals(other) {
        return this.years === other.years;
    }
    toMonths() {
        return this.years * 12;
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION PERCENTAGE VALUE OBJECT
// ═══════════════════════════════════════════════════════════════════════════
export class AllocationPercentage extends Percentage {
    constructor(value) {
        super(value);
        if (value <= 0) {
            throw new Error('ALLOCATION_PERCENTAGE_INVALID: Must be positive');
        }
    }
    static fromDecimal(decimal) {
        return new AllocationPercentage(decimal * 100);
    }
}
//# sourceMappingURL=index.js.map