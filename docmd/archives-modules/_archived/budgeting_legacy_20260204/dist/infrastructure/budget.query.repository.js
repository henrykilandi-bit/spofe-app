"use strict";
/**
 * Budget Query Repository - Read-only SQL
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 * Principe: SQL only, aucune logique métier
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetQueryRepository = void 0;
const common_1 = require("@nestjs/common");
const pg_1 = require("pg");
let BudgetQueryRepository = class BudgetQueryRepository {
    constructor(db) {
        this.db = db;
    }
    async projection(tenantId) {
        const result = await this.db.query(`SELECT 
        tenant_id AS "tenantId",
        budget_id AS "budgetId",
        product_id AS "productId",
        period_date AS "periodDate",
        projected_amount AS "projectedAmount"
       FROM rm_cashflow_projection 
       WHERE tenant_id = $1
       ORDER BY period_date DESC`, [tenantId]);
        return result.rows;
    }
    async execution(tenantId) {
        const result = await this.db.query(`SELECT 
        tenant_id AS "tenantId",
        product_id AS "productId",
        period_date AS "periodDate",
        actual_amount AS "actualAmount"
       FROM rm_cashflow_execution 
       WHERE tenant_id = $1
       ORDER BY period_date DESC`, [tenantId]);
        return result.rows;
    }
    async variance(tenantId) {
        const result = await this.db.query(`SELECT 
        tenant_id AS "tenantId",
        budget_id AS "budgetId",
        product_id AS "productId",
        period_date AS "periodDate",
        projected_amount AS "projectedAmount",
        actual_amount AS "actualAmount",
        variance,
        variance_percentage AS "variancePercentage"
       FROM rm_cashflow_variance 
       WHERE tenant_id = $1
       ORDER BY period_date DESC`, [tenantId]);
        return result.rows;
    }
    async cumulative(tenantId) {
        const result = await this.db.query(`SELECT 
        tenant_id AS "tenantId",
        budget_id AS "budgetId",
        product_id AS "productId",
        period_date AS "periodDate",
        projected_amount AS "projectedAmount",
        cumulative_projected_amount AS "cumulativeProjectedAmount"
       FROM rm_cashflow_cumulative 
       WHERE tenant_id = $1
       ORDER BY period_date DESC`, [tenantId]);
        return result.rows;
    }
    async alerts(tenantId) {
        const result = await this.db.query(`SELECT 
        tenant_id AS "tenantId",
        budget_id AS "budgetId",
        period_date AS "periodDate",
        projected_total AS "projectedTotal",
        alert_level AS "alertLevel",
        alert_message AS "alertMessage"
       FROM rm_liquidity_alerts 
       WHERE tenant_id = $1
       ORDER BY period_date DESC`, [tenantId]);
        return result.rows;
    }
};
exports.BudgetQueryRepository = BudgetQueryRepository;
exports.BudgetQueryRepository = BudgetQueryRepository = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [pg_1.Pool])
], BudgetQueryRepository);
//# sourceMappingURL=budget.query.repository.js.map