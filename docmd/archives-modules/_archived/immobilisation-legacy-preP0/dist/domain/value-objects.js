/**
 * Immobilisation Module - Value Objects
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Immutables, validés à la construction
 */
// ═══════════════════════════════════════════════════════════════════════════
// VALUE OBJECTS
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Money - Montant monétaire
 * IMM-ASS-01: acquisitionCost > 0 (pour création)
 * IMM-ASS-03: residualValue >= 0
 */
export class Money {
    amount;
    currency;
    constructor(amount, currency = 'XAF') {
        this.amount = amount;
        this.currency = currency;
        if (!isFinite(amount)) {
            throw new Error('MONEY_INVALID: Amount must be finite');
        }
    }
    /**
     * Factory pour montant strictement positif
     */
    static positive(amount, currency = 'XAF') {
        if (amount <= 0) {
            throw new Error('MONEY_NOT_POSITIVE: Amount must be > 0');
        }
        return new Money(amount, currency);
    }
    /**
     * Factory pour montant non négatif
     */
    static nonNegative(amount, currency = 'XAF') {
        if (amount < 0) {
            throw new Error('MONEY_NEGATIVE: Amount must be >= 0');
        }
        return new Money(amount, currency);
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
    isGreaterThan(other) {
        if (this.currency !== other.currency) {
            throw new Error('MONEY_CURRENCY_MISMATCH');
        }
        return this.amount > other.amount;
    }
    isGreaterThanOrEqual(other) {
        if (this.currency !== other.currency) {
            throw new Error('MONEY_CURRENCY_MISMATCH');
        }
        return this.amount >= other.amount;
    }
    isLessThanOrEqual(other) {
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
    months;
    constructor(months) {
        this.months = months;
        if (!Number.isInteger(months) || months <= 0) {
            throw new Error('USEFUL_LIFE_INVALID: Must be a positive integer (months)');
        }
    }
    get years() {
        return this.months / 12;
    }
    equals(other) {
        return this.months === other.months;
    }
}
/**
 * Percentage - Pourcentage de ventilation
 * IMM-ALL-01: 0 < percentage <= 100
 */
export class Percentage {
    value;
    constructor(value) {
        this.value = value;
        if (value <= 0 || value > 100) {
            throw new Error('PERCENTAGE_INVALID: Must be > 0 and <= 100');
        }
        if (!isFinite(value)) {
            throw new Error('PERCENTAGE_INVALID: Must be finite');
        }
    }
    equals(other) {
        return this.value === other.value;
    }
    static sum(percentages) {
        return percentages.reduce((sum, p) => sum + p.value, 0);
    }
    static isComplete(percentages) {
        const sum = Percentage.sum(percentages);
        return Math.abs(sum - 100) < 0.001; // Tolérance pour erreurs d'arrondi
    }
}
/**
 * Period - Période comptable YYYY-MM
 */
export class Period {
    year;
    month;
    constructor(year, month) {
        this.year = year;
        this.month = month;
        if (!Number.isInteger(year) || year < 1900 || year > 2100) {
            throw new Error('PERIOD_INVALID_YEAR');
        }
        if (!Number.isInteger(month) || month < 1 || month > 12) {
            throw new Error('PERIOD_INVALID_MONTH');
        }
    }
    static fromString(period) {
        const match = period.match(/^(\d{4})-(\d{2})$/);
        if (!match) {
            throw new Error('PERIOD_INVALID_FORMAT: Expected YYYY-MM');
        }
        return new Period(parseInt(match[1], 10), parseInt(match[2], 10));
    }
    toString() {
        return `${this.year}-${this.month.toString().padStart(2, '0')}`;
    }
    equals(other) {
        return this.year === other.year && this.month === other.month;
    }
    /**
     * Nombre de mois entre deux périodes
     */
    monthsUntil(other) {
        return (other.year - this.year) * 12 + (other.month - this.month);
    }
    /**
     * Période suivante
     */
    next() {
        if (this.month === 12) {
            return new Period(this.year + 1, 1);
        }
        return new Period(this.year, this.month + 1);
    }
    /**
     * Période précédente
     */
    previous() {
        if (this.month === 1) {
            return new Period(this.year - 1, 12);
        }
        return new Period(this.year, this.month - 1);
    }
    isAfter(other) {
        return this.year > other.year || (this.year === other.year && this.month > other.month);
    }
    isBefore(other) {
        return this.year < other.year || (this.year === other.year && this.month < other.month);
    }
    static fromDate(date) {
        return new Period(date.getFullYear(), date.getMonth() + 1);
    }
}
/**
 * AssetId - Identifiant unique d'immobilisation
 */
export class AssetId {
    value;
    constructor(value) {
        this.value = value;
        if (!value || value.trim().length === 0) {
            throw new Error('ASSET_ID_EMPTY');
        }
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
/**
 * TenantId - Identifiant du tenant
 */
export class TenantId {
    value;
    constructor(value) {
        this.value = value;
        if (!value || value.trim().length === 0) {
            throw new Error('TENANT_ID_EMPTY');
        }
    }
    equals(other) {
        return this.value === other.value;
    }
    toString() {
        return this.value;
    }
}
/**
 * AllocationTarget - Cible de ventilation
 */
export class AllocationTarget {
    type;
    id;
    constructor(type, id) {
        this.type = type;
        this.id = id;
        if (!id || id.trim().length === 0) {
            throw new Error('ALLOCATION_TARGET_ID_EMPTY');
        }
    }
    equals(other) {
        return this.type === other.type && this.id === other.id;
    }
}
/**
 * DateRange - Plage de dates pour allocation
 * IMM-ALL-03: effectiveFrom <= effectiveTo
 */
export class DateRange {
    from;
    to;
    constructor(from, to) {
        this.from = from;
        this.to = to;
        if (to && from > to) {
            throw new Error('DATE_RANGE_INVALID: from must be <= to');
        }
    }
    contains(date) {
        if (date < this.from)
            return false;
        if (this.to && date > this.to)
            return false;
        return true;
    }
    overlaps(other) {
        // Si l'une des deux n'a pas de fin, elle s'étend indéfiniment
        const thisEnd = this.to ?? new Date('9999-12-31');
        const otherEnd = other.to ?? new Date('9999-12-31');
        return this.from <= otherEnd && other.from <= thisEnd;
    }
    equals(other) {
        return (this.from.getTime() === other.from.getTime() &&
            this.to?.getTime() === other.to?.getTime());
    }
}
/**
 * Description - Description textuelle
 */
export class Description {
    value;
    constructor(value) {
        this.value = value;
        if (!value || value.trim().length === 0) {
            throw new Error('DESCRIPTION_EMPTY');
        }
        if (value.length > 1000) {
            throw new Error('DESCRIPTION_TOO_LONG: Max 1000 characters');
        }
    }
    equals(other) {
        return this.value === other.value;
    }
}
//# sourceMappingURL=value-objects.js.map