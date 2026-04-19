/**
 * Budget Repository - PostgreSQL
 * Conformité: MODULE_BUDGET_CONTRACT.md Section 2
 * Principe: Append-only, aucun UPDATE/DELETE
 */

import { Pool, PoolClient } from 'pg';
import { BudgetObjectif } from '../domain/budget.aggregate';
import { Period } from '../domain/value-objects';

export interface BudgetRepository {
  save(budget: BudgetObjectif, client?: PoolClient): Promise<void>;
  findById(id: string, tenantId: string, client?: PoolClient): Promise<BudgetObjectif | null>;
  findByPeriod(period: Period, tenantId: string, client?: PoolClient): Promise<BudgetObjectif[]>;
  findAll(tenantId: string, client?: PoolClient): Promise<BudgetObjectif[]>;
}

export class PostgresBudgetRepository implements BudgetRepository {
  constructor(private readonly pool: Pool) {}

  async save(budget: BudgetObjectif, client?: PoolClient): Promise<void> {
    const conn = client || this.pool;

    const query = `
      INSERT INTO budget_objectif (
        id, tenant_id, period_start, period_end, period_granularity,
        status, objectives, sales_capacities, cost_structures, payment_terms,
        created_at, updated_at, created_by, updated_by, version
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
      ON CONFLICT (id, tenant_id) DO UPDATE SET
        status = EXCLUDED.status,
        objectives = EXCLUDED.objectives,
        sales_capacities = EXCLUDED.sales_capacities,
        cost_structures = EXCLUDED.cost_structures,
        payment_terms = EXCLUDED.payment_terms,
        updated_at = EXCLUDED.updated_at,
        updated_by = EXCLUDED.updated_by,
        version = EXCLUDED.version
    `;

    const values = [
      budget.id,
      budget.tenantId,
      budget.period.startDate,
      budget.period.endDate,
      budget.period.granularity,
      budget.status,
      JSON.stringify(budget.objectives),
      JSON.stringify(budget.salesCapacities),
      JSON.stringify(budget.costStructures),
      budget.paymentTerms ? JSON.stringify(budget.paymentTerms) : null,
      budget.createdAt,
      budget.updatedAt,
      budget.createdBy,
      budget.updatedBy,
      budget.version,
    ];

    await conn.query(query, values);
  }

  async findById(id: string, tenantId: string, client?: PoolClient): Promise<BudgetObjectif | null> {
    const conn = client || this.pool;

    const query = `
      SELECT * FROM budget_objectif
      WHERE id = $1 AND tenant_id = $2 AND deleted_at IS NULL
    `;

    const result = await conn.query(query, [id, tenantId]);

    if (result.rows.length === 0) {
      return null;
    }

    return this.mapRowToBudget(result.rows[0]);
  }

  async findByPeriod(period: Period, tenantId: string, client?: PoolClient): Promise<BudgetObjectif[]> {
    const conn = client || this.pool;

    const query = `
      SELECT * FROM budget_objectif
      WHERE tenant_id = $1
        AND period_start < $2
        AND period_end > $3
        AND deleted_at IS NULL
      ORDER BY period_start DESC
    `;

    const result = await conn.query(query, [tenantId, period.endDate, period.startDate]);

    return result.rows.map((row) => this.mapRowToBudget(row));
  }

  async findAll(tenantId: string, client?: PoolClient): Promise<BudgetObjectif[]> {
    const conn = client || this.pool;

    const query = `
      SELECT * FROM budget_objectif
      WHERE tenant_id = $1 AND deleted_at IS NULL
      ORDER BY created_at DESC
    `;

    const result = await conn.query(query, [tenantId]);

    return result.rows.map((row) => this.mapRowToBudget(row));
  }

  private mapRowToBudget(row: any): BudgetObjectif {
    return {
      id: row.id,
      tenantId: row.tenant_id,
      period: new Period(
        new Date(row.period_start),
        new Date(row.period_end),
        row.period_granularity
      ),
      status: row.status,
      objectives: JSON.parse(row.objectives),
      salesCapacities: JSON.parse(row.sales_capacities),
      costStructures: JSON.parse(row.cost_structures),
      paymentTerms: row.payment_terms ? JSON.parse(row.payment_terms) : null,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
      createdBy: row.created_by,
      updatedBy: row.updated_by,
      version: row.version,
    };
  }
}
