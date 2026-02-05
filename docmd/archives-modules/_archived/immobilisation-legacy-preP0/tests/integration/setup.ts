/**
 * Setup commun pour tests d'intégration write-side
 * Module Immobilisation v1.0.0
 * 
 * SPOFE Compliance:
 * ✅ PostgreSQL réel
 * ✅ Guardian réel
 * ✅ Repository réel
 * ❌ Aucun mock métier
 */

import { Pool } from 'pg';
import { ImmobilisationGuardian } from '../../guardian/immobilisation.guardian';
import { AssetPgRepository } from '../../write/repository/asset.pg.repository';

export interface TestContext {
  pool: Pool;
  guardian: ImmobilisationGuardian;
  repository: AssetPgRepository;
}

export async function setupTestContext(): Promise<TestContext> {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL || 'postgres://spofe:spofe@localhost:5432/spofe_test',
  });

  const guardian = new ImmobilisationGuardian();
  const repository = new AssetPgRepository(pool);

  return { pool, guardian, repository };
}

export async function teardownTestContext(ctx: TestContext): Promise<void> {
  await ctx.pool.end();
}

export async function cleanDatabase(pool: Pool): Promise<void> {
  await pool.query(`
    DELETE FROM immobilisation.events 
    WHERE tenant_id LIKE 'test-%' OR tenant_id LIKE 'tenant-%'
  `);
  await pool.query(`
    DELETE FROM immobilisation.assets 
    WHERE tenant_id LIKE 'test-%' OR tenant_id LIKE 'tenant-%'
  `);
  await pool.query(`
    DELETE FROM immobilisation.allocations 
    WHERE tenant_id LIKE 'test-%' OR tenant_id LIKE 'tenant-%'
  `);
  await pool.query(`
    DELETE FROM immobilisation.depreciations 
    WHERE tenant_id LIKE 'test-%' OR tenant_id LIKE 'tenant-%'
  `);
  await pool.query(`
    DELETE FROM immobilisation.maintenances 
    WHERE tenant_id LIKE 'test-%' OR tenant_id LIKE 'tenant-%'
  `);
}

export function generateTestId(): string {
  return `test-${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
}

export function generateTenantId(): string {
  return `tenant-${Math.random().toString(36).substring(2, 9)}`;
}
