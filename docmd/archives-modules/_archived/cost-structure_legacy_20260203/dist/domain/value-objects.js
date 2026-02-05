"use strict";
/**
 * Cost-Structure Module - Value Objects
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Principe: Immutables, validés à la construction
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.SimulationMetrics = exports.EconomicAssumptions = exports.CostLine = exports.EconomicScenarios = exports.Quantity = exports.Money = void 0;
/**
 * Money - Montant monétaire positif
 */
class Money {
    constructor(amount, currency = 'XAF') {
        this.amount = amount;
        this.currency = currency;
        if (amount < 0) {
            throw new Error('MONEY_NEGATIVE: Amount must be >= 0');
        }
        if (!isFinite(amount)) {
            throw new Error('MONEY_INVALID: Amount must be finite');
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
    multiply(factor) {
        return new Money(this.amount * factor, this.currency);
    }
}
exports.Money = Money;
/**
 * Quantity - Quantité positive
 */
class Quantity {
    constructor(value) {
        this.value = value;
        if (value < 0) {
            throw new Error('QUANTITY_NEGATIVE: Value must be >= 0');
        }
        if (!isFinite(value)) {
            throw new Error('QUANTITY_INVALID: Value must be finite');
        }
    }
    equals(other) {
        return this.value === other.value;
    }
}
exports.Quantity = Quantity;
/**
 * EconomicScenarios - Scénarios économiques (pessimiste, réaliste, optimiste)
 */
class EconomicScenarios {
    constructor(pessimistic, realistic, optimistic) {
        this.pessimistic = pessimistic;
        this.realistic = realistic;
        this.optimistic = optimistic;
        if (pessimistic < 0 || realistic < 0 || optimistic < 0) {
            throw new Error('SCENARIOS_NEGATIVE: All scenarios must be >= 0');
        }
        if (pessimistic > realistic || realistic > optimistic) {
            throw new Error('SCENARIOS_INVALID_ORDER: Must be pessimistic <= realistic <= optimistic');
        }
    }
    equals(other) {
        return (this.pessimistic === other.pessimistic &&
            this.realistic === other.realistic &&
            this.optimistic === other.optimistic);
    }
}
exports.EconomicScenarios = EconomicScenarios;
/**
 * CostLine - Ligne de coût
 */
class CostLine {
    constructor(category, label, amount, allocationRule) {
        this.category = category;
        this.label = label;
        this.amount = amount;
        this.allocationRule = allocationRule;
        if (!label || label.trim().length === 0) {
            throw new Error('COST_LINE_EMPTY_LABEL');
        }
    }
    equals(other) {
        return (this.category === other.category &&
            this.label === other.label &&
            this.amount.equals(other.amount) &&
            this.allocationRule === other.allocationRule);
    }
}
exports.CostLine = CostLine;
/**
 * EconomicAssumptions - Hypothèses économiques
 */
class EconomicAssumptions {
    constructor(priceTarget, expectedVolume, capacityMax, scenarios) {
        this.priceTarget = priceTarget;
        this.expectedVolume = expectedVolume;
        this.capacityMax = capacityMax;
        this.scenarios = scenarios;
        if (expectedVolume.value > capacityMax.value) {
            throw new Error('ASSUMPTIONS_VOLUME_EXCEEDS_CAPACITY');
        }
    }
    equals(other) {
        return (this.priceTarget.equals(other.priceTarget) &&
            this.expectedVolume.equals(other.expectedVolume) &&
            this.capacityMax.equals(other.capacityMax) &&
            this.scenarios.equals(other.scenarios));
    }
}
exports.EconomicAssumptions = EconomicAssumptions;
/**
 * SimulationMetrics - Résultats de simulation
 */
class SimulationMetrics {
    constructor(unitCost, totalCost, grossMargin, netMargin, marginAt70, viableAt70) {
        this.unitCost = unitCost;
        this.totalCost = totalCost;
        this.grossMargin = grossMargin;
        this.netMargin = netMargin;
        this.marginAt70 = marginAt70;
        this.viableAt70 = viableAt70;
        if (!isFinite(grossMargin) || !isFinite(netMargin) || !isFinite(marginAt70)) {
            throw new Error('METRICS_INVALID: Margins must be finite');
        }
    }
}
exports.SimulationMetrics = SimulationMetrics;
//# sourceMappingURL=value-objects.js.map