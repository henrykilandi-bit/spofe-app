"use strict";
// src/read-models/projections/BudgetProjection.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetProjection = void 0;
class BudgetProjection {
    constructor() {
        this.objectives = [];
        this.cashflows = [];
        this.variances = [];
        this.timelines = [];
        this.alerts = [];
    }
    apply(event) {
        switch (event.type) {
            case 'BudgetLineProjected': {
                const p = event.payload;
                this.objectives.push({
                    tenantId: p.tenantId,
                    budgetId: p.budgetId,
                    targetType: p.targetType,
                    targetId: p.targetId,
                    period: p.period,
                    amount: p.amount,
                });
                this.timelines.push({
                    tenantId: p.tenantId,
                    budgetId: p.budgetId,
                    period: p.period,
                    projectedAmount: p.amount,
                });
                break;
            }
            case 'BudgetCashflowProjected': {
                const p = event.payload;
                this.cashflows.push({
                    tenantId: p.tenantId,
                    budgetId: p.budgetId,
                    period: p.period,
                    inflow: p.inflow,
                    outflow: p.outflow,
                    net: p.inflow - p.outflow,
                });
                break;
            }
            case 'BudgetVarianceComputed': {
                const p = event.payload;
                this.variances.push({
                    tenantId: p.tenantId,
                    budgetId: p.budgetId,
                    period: p.period,
                    variance: p.variance,
                });
                break;
            }
            case 'BudgetAlertRaised': {
                const p = event.payload;
                this.alerts.push({
                    tenantId: p.tenantId,
                    budgetId: p.budgetId,
                    period: p.period,
                    level: p.level,
                    message: p.message,
                });
                break;
            }
        }
    }
    snapshotObjectives() {
        return [...this.objectives];
    }
    snapshotCashflows() {
        return [...this.cashflows];
    }
    snapshotVariances() {
        return [...this.variances];
    }
    snapshotTimelines() {
        return [...this.timelines];
    }
    snapshotAlerts() {
        return [...this.alerts];
    }
}
exports.BudgetProjection = BudgetProjection;
//# sourceMappingURL=BudgetProjection.js.map