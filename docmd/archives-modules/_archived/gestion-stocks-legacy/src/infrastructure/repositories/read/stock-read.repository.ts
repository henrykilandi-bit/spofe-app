import { Pool } from 'pg';

export class StockReadRepository {
  constructor(private readonly db: Pool) {}

  async getStockByDepot(tenantId: string, depotId: string) {
    const { rows } = await this.db.query(
      `
      SELECT product_id, category, total_quantity
      FROM view_stock_by_depot
      WHERE tenant_id = $1 AND depot_id = $2
      `,
      [tenantId, depotId]
    );
    return rows;
  }

  async getStockByCategory(tenantId: string, category: string) {
    const { rows } = await this.db.query(
      `
      SELECT product_id, total_quantity
      FROM view_stock_by_category
      WHERE tenant_id = $1 AND category = $2
      `,
      [tenantId, category]
    );
    return rows;
  }

  async getStockByProduct(tenantId: string, productId: string) {
    const { rows } = await this.db.query(
      `
      SELECT total_quantity
      FROM view_stock_by_product
      WHERE tenant_id = $1 AND product_id = $2
      `,
      [tenantId, productId]
    );
    return rows[0] ?? null;
  }

  async getMovements(
    tenantId: string,
    filters: {
      depotId?: string;
      productId?: string;
      category?: string;
      movementType?: string;
      dateFrom?: string;
      dateTo?: string;
    }
  ) {
    const conditions: string[] = ['tenant_id = $1'];
    const values: any[] = [tenantId];
    let idx = 2;

    for (const [key, value] of Object.entries(filters)) {
      if (!value) continue;
      conditions.push(`${key} = $${idx++}`);
      values.push(value);
    }

    const { rows } = await this.db.query(
      `
      SELECT *
      FROM view_stock_movements
      WHERE ${conditions.join(' AND ')}
      ORDER BY occurred_at ASC
      `,
      values
    );

    return rows;
  }
}