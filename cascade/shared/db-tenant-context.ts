/**
 * DB Tenant Context - Injection du tenant dans PostgreSQL
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 4
 * Principe: Aucune requête sans tenant_id
 */

import { PoolClient } from 'pg';

/**
 * Exécute une fonction dans le contexte d'un tenant
 * SET LOCAL app.tenant_id garantit l'isolation RLS
 */
export async function withTenant<T>(
  client: PoolClient,
  tenantId: string,
  fn: () => Promise<T>
): Promise<T> {
  if (!tenantId) {
    throw new Error('TENANT_ID_REQUIRED: Cannot execute query without tenant context');
  }

  await client.query('SET LOCAL app.tenant_id = $1', [tenantId]);
  return fn();
}

/**
 * Exécute une transaction avec contexte tenant
 */
export async function executeInTenantTransaction<T>(
  pool: any,
  tenantId: string,
  fn: (client: PoolClient) => Promise<T>
): Promise<T> {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    const result = await withTenant(client, tenantId, () => fn(client));
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}
