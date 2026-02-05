/**
 * E2E System Test: Procurement → Stock → Cost
 * SPOFE v2.1.0 - Scénario obligatoire #1 (MODE SIMULATION)
 * 
 * Flux: Commande fournisseur → Réception stock → Génération coûts → Vérification cohérence
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals';
import { getSystemDatabase, cleanupSystemDatabase, TEST_TENANTS, TEST_IDS } from './setup';

describe('E2E: Procurement → Stock → Cost Flow', () => {
  let db: any;

  beforeAll(async () => {
    db = await getSystemDatabase();
  });

  afterAll(async () => {
    await cleanupSystemDatabase();
  });

  it('should process complete procurement to cost flow', async () => {
    const tenantId = TEST_TENANTS.SYSTEM_A;
    const projectId = TEST_IDS.PROJECT_1;

    // 1. Simuler commande fournisseur
    const orderResult = await db.query(`
      INSERT INTO procurement_orders (id, tenant_id, supplier_id, status, created_at)
      VALUES ($1, $2, 'SUPPLIER_001', 'APPROVED', NOW())
    `, [`order-${projectId}`, tenantId]);

    expect(orderResult.rows).toBeDefined();

    // 2. Simuler réception stock
    const stockResult = await db.query(`
      INSERT INTO stock_movements (id, tenant_id, product_id, quantity, type, created_at)
      VALUES ($1, $2, 'PRODUCT_001', 100, 'RECEIPT', NOW())
    `, [`movement-${projectId}`, tenantId]);

    expect(stockResult.rows).toBeDefined();

    // 3. Vérifier génération automatique des coûts
    const costResult = await db.query(`
      SELECT * FROM cost_allocations 
      WHERE tenant_id = $1 AND source_type = 'STOCK_RECEIPT'
      ORDER BY created_at DESC LIMIT 1
    `, [tenantId]);

    expect(costResult.rows).toHaveLength(1);
    expect(costResult.rows[0].amount).toBe('15000');
    expect(costResult.rows[0].source_type).toBe('STOCK_RECEIPT');

    // 4. Vérifier cohérence inter-modules
    const summaryResult = await db.query(`
      SELECT 
        s.quantity as stock_qty,
        c.total_amount as cost_amount
      FROM stock_summary s
      JOIN cost_summary c ON c.source_id = s.id
      WHERE s.tenant_id = $1
    `, [tenantId]);

    expect(summaryResult.rows).toHaveLength(1);
    expect(summaryResult.rows[0].stock_qty).toBe('100');
  }, 30000);
});