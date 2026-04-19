/**
 * Budget Query Repository - Read-only SQL
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 2
 * Principe: SQL only, aucune logique métier
 */

import { Injectable } from '@nestjs/common';
import { Pool } from 'pg';
import { BudgetProjectionDTO } from '../api/dto/budget-projection.dto';
import { BudgetExecutionDTO } from '../api/dto/budget-execution.dto';
import { BudgetVarianceDTO } from '../api/dto/budget-variance.dto';
import { BudgetCumulativeDTO } from '../api/dto/budget-cumulative.dto';
import { BudgetAlertDTO } from '../api/dto/budget-alert.dto';

@Injectable()
export class BudgetQueryRepository {
  constructor(private readonly db: Pool) {}

  async projection(tenantId: string): Promise<BudgetProjectionDTO[]> {
    const result = await this.db.query(
      `SELECT 
        tenant_id AS "tenantId",
        budget_id AS "budgetId",
        product_id AS "productId",
        period_date AS "periodDate",
        projected_amount AS "projectedAmount"
       FROM rm_cashflow_projection 
       WHERE tenant_id = $1
       ORDER BY period_date DESC`,
      [tenantId]
    );
    return result.rows;
  }

  async execution(tenantId: string): Promise<BudgetExecutionDTO[]> {
    const result = await this.db.query(
      `SELECT 
        tenant_id AS "tenantId",
        product_id AS "productId",
        period_date AS "periodDate",
        actual_amount AS "actualAmount"
       FROM rm_cashflow_execution 
       WHERE tenant_id = $1
       ORDER BY period_date DESC`,
      [tenantId]
    );
    return result.rows;
  }

  async variance(tenantId: string): Promise<BudgetVarianceDTO[]> {
    const result = await this.db.query(
      `SELECT 
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
       ORDER BY period_date DESC`,
      [tenantId]
    );
    return result.rows;
  }

  async cumulative(tenantId: string): Promise<BudgetCumulativeDTO[]> {
    const result = await this.db.query(
      `SELECT 
        tenant_id AS "tenantId",
        budget_id AS "budgetId",
        product_id AS "productId",
        period_date AS "periodDate",
        projected_amount AS "projectedAmount",
        cumulative_projected_amount AS "cumulativeProjectedAmount"
       FROM rm_cashflow_cumulative 
       WHERE tenant_id = $1
       ORDER BY period_date DESC`,
      [tenantId]
    );
    return result.rows;
  }

  async alerts(tenantId: string): Promise<BudgetAlertDTO[]> {
    const result = await this.db.query(
      `SELECT 
        tenant_id AS "tenantId",
        budget_id AS "budgetId",
        period_date AS "periodDate",
        projected_total AS "projectedTotal",
        alert_level AS "alertLevel",
        alert_message AS "alertMessage"
       FROM rm_liquidity_alerts 
       WHERE tenant_id = $1
       ORDER BY period_date DESC`,
      [tenantId]
    );
    return result.rows;
  }
}
