"use strict";
/**
 * Aggregate Root - BudgetObjectif
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 3
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetObjectifAggregate = void 0;
class BudgetObjectifAggregate {
    constructor(state) {
        this.state = state;
    }
    static create(params) {
        const now = new Date();
        const state = {
            id: params.id,
            tenantId: params.tenantId,
            period: params.period,
            status: 'DRAFT',
            objectives: params.objectives,
            salesCapacities: [],
            costStructures: [],
            paymentTerms: null,
            createdAt: now,
            updatedAt: now,
            createdBy: params.createdBy,
            updatedBy: params.createdBy,
            version: 1,
        };
        return new BudgetObjectifAggregate(state);
    }
    static fromState(state) {
        return new BudgetObjectifAggregate(state);
    }
    getState() {
        return { ...this.state };
    }
    updateObjectives(objectives, updatedBy) {
        if (this.state.status !== 'DRAFT') {
            throw new Error('CANNOT_UPDATE_VALIDATED_BUDGET');
        }
        this.state.objectives = objectives;
        this.state.updatedBy = updatedBy;
        this.state.updatedAt = new Date();
        this.state.version += 1;
    }
    attachCostStructure(costStructures, attachedBy) {
        if (this.state.status !== 'DRAFT') {
            throw new Error('CANNOT_UPDATE_VALIDATED_BUDGET');
        }
        this.state.costStructures = costStructures;
        this.state.updatedBy = attachedBy;
        this.state.updatedAt = new Date();
        this.state.version += 1;
    }
    defineSalesCapacity(salesCapacities, definedBy) {
        if (this.state.status !== 'DRAFT') {
            throw new Error('CANNOT_UPDATE_VALIDATED_BUDGET');
        }
        this.state.salesCapacities = salesCapacities;
        this.state.updatedBy = definedBy;
        this.state.updatedAt = new Date();
        this.state.version += 1;
    }
    definePaymentTerms(paymentTerms, definedBy) {
        if (this.state.status !== 'DRAFT') {
            throw new Error('CANNOT_UPDATE_VALIDATED_BUDGET');
        }
        this.state.paymentTerms = paymentTerms;
        this.state.updatedBy = definedBy;
        this.state.updatedAt = new Date();
        this.state.version += 1;
    }
    validate(validatedBy) {
        if (this.state.status !== 'DRAFT') {
            throw new Error('INVALID_STATE_TRANSITION');
        }
        this.state.status = 'VALIDATED';
        this.state.updatedBy = validatedBy;
        this.state.updatedAt = new Date();
        this.state.version += 1;
    }
    close(closedBy) {
        if (this.state.status !== 'VALIDATED') {
            throw new Error('INVALID_STATE_TRANSITION');
        }
        this.state.status = 'CLOSED';
        this.state.updatedBy = closedBy;
        this.state.updatedAt = new Date();
        this.state.version += 1;
    }
}
exports.BudgetObjectifAggregate = BudgetObjectifAggregate;
//# sourceMappingURL=budget.aggregate.js.map