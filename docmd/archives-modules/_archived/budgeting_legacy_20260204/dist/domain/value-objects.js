"use strict";
/**
 * Value Objects - Module Budget
 * Objets immuables sans identité propre
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 3
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentTermsSet = exports.PaymentTerm = exports.Money = exports.Quantity = exports.Period = void 0;
class Period {
    constructor(startDate, endDate, granularity) {
        this.startDate = startDate;
        this.endDate = endDate;
        this.granularity = granularity;
        if (startDate >= endDate) {
            throw new Error('INVALID_PERIOD: startDate must be before endDate');
        }
    }
    equals(other) {
        return (this.startDate.getTime() === other.startDate.getTime() &&
            this.endDate.getTime() === other.endDate.getTime() &&
            this.granularity === other.granularity);
    }
    contains(date) {
        return date >= this.startDate && date <= this.endDate;
    }
}
exports.Period = Period;
class Quantity {
    constructor(value) {
        this.value = value;
        if (value < 0) {
            throw new Error('INVALID_QUANTITY: value must be >= 0');
        }
    }
    equals(other) {
        return this.value === other.value;
    }
    add(other) {
        return new Quantity(this.value + other.value);
    }
}
exports.Quantity = Quantity;
class Money {
    constructor(amount, currency = 'XOF') {
        this.amount = amount;
        this.currency = currency;
        if (amount < 0) {
            throw new Error('INVALID_MONEY: amount must be >= 0');
        }
        if (!currency || currency.length !== 3) {
            throw new Error('INVALID_CURRENCY: must be ISO 4217 code');
        }
    }
    equals(other) {
        return this.amount === other.amount && this.currency === other.currency;
    }
    add(other) {
        if (this.currency !== other.currency) {
            throw new Error('CURRENCY_MISMATCH: cannot add different currencies');
        }
        return new Money(this.amount + other.amount, this.currency);
    }
    multiply(factor) {
        return new Money(this.amount * factor, this.currency);
    }
}
exports.Money = Money;
class PaymentTerm {
    constructor(days) {
        this.days = days;
        if (days < 0) {
            throw new Error('INVALID_PAYMENT_TERM: days must be >= 0');
        }
    }
    equals(other) {
        return this.days === other.days;
    }
}
exports.PaymentTerm = PaymentTerm;
class PaymentTermsSet {
    constructor(customerTerms, supplierTerms) {
        this.customerTerms = customerTerms;
        this.supplierTerms = supplierTerms;
    }
    equals(other) {
        return (this.customerTerms.equals(other.customerTerms) &&
            this.supplierTerms.equals(other.supplierTerms));
    }
}
exports.PaymentTermsSet = PaymentTermsSet;
//# sourceMappingURL=value-objects.js.map