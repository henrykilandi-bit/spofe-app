/**
 * Test d'intégration — RecordMaintenance
 * Module Immobilisation v1.0.0
 * 
 * SPOFE Compliance:
 * ✅ Guardian réel
 * ✅ Repository PostgreSQL réel
 * ✅ Validation invariants + persistance
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestContext, teardownTestContext, cleanDatabase, generateTestId, generateTenantId, TestContext } from './setup'
import { RecordMaintenanceHandler } from '../../write/handlers/record-maintenance.handler';
import { RecordMaintenanceCommand } from '../../write/commands/record-maintenance.command';
import { CreateAssetCommand } from '../../write/commands/create-asset.command';
import { CreateAssetHandler } from '../../write/handlers/create-asset.handler';

describe('RecordMaintenance — Integration Tests', () => {
  let ctx: TestContext;
  let maintenanceHandler: RecordMaintenanceHandler;
  let createHandler: CreateAssetHandler;

  beforeAll(async () => {
    ctx = await setupTestContext();
    maintenanceHandler = new RecordMaintenanceHandler(ctx.guardian, ctx.repository);
    createHandler = new CreateAssetHandler(ctx.guardian, ctx.repository);
  });

  afterAll(async () => {
    await teardownTestContext(ctx);
  });

  beforeEach(async () => {
    await cleanDatabase(ctx.pool);
  });

  async function createTestAsset(tenantId: string, assetId: string): Promise<void> {
    const command = new CreateAssetCommand(
      tenantId,
      assetId,
      'Test Asset',
      null,
      'EQUIPMENT',
      100000,
      'EUR',
      '2024-01-01',
      '2024-01-01',
      120,
      'LINEAR',
      10000,
      null,
      null,
      'actor-1'
    );
    await createHandler.execute(command);
  }

  it('should record maintenance for active asset', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    await createTestAsset(tenantId, assetId);

    const command = new RecordMaintenanceCommand(
      tenantId,
      generateTestId(), // maintenanceId
      assetId,
      'CORRECTIVE', // maintenanceType
      'Révision annuelle',
      2500,
      'EUR',
      '2024-06-15',
      null,
      'actor-1'
    );

    await maintenanceHandler.execute(command);

    // Vérifier que l'événement est créé
    const result = await ctx.pool.query(
      `SELECT * FROM immobilisation.events 
       WHERE tenant_id = $1 AND event_type = 'MaintenanceRecorded'`,
      [tenantId]
    );

    expect(result.rows.length).toBe(1);
    expect(result.rows[0].payload.cost).toBe(2500);
  });

  it('should reject maintenance for disposed asset', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    await createTestAsset(tenantId, assetId);

    // Marquer l'asset comme DISPOSED
    await ctx.pool.query(
      `UPDATE immobilisation.assets SET status = 'DISPOSED' 
       WHERE tenant_id = $1 AND asset_id = $2`,
      [tenantId, assetId]
    );

    const command = new RecordMaintenanceCommand(
      tenantId,
      generateTestId(),
      assetId,
      'CORRECTIVE',
      'Réparation',
      1500,
      'EUR',
      '2024-06-15',
      null,
      'actor-1'
    );

    await expect(maintenanceHandler.execute(command)).rejects.toThrow('ASSET_NOT_IN_SERVICE');
  });

  it('should accumulate maintenance costs', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    await createTestAsset(tenantId, assetId);

    const command1 = new RecordMaintenanceCommand(
      tenantId,
      generateTestId(),
      assetId,
      'PREVENTIVE',
      'Maintenance 1',
      1000,
      'EUR',
      '2024-03-15',
      null,
      'actor-1'
    );
    await maintenanceHandler.execute(command1);

    const command2 = new RecordMaintenanceCommand(
      tenantId,
      generateTestId(),
      assetId,
      'CORRECTIVE',
      'Maintenance 2',
      2000,
      'EUR',
      '2024-06-15',
      null,
      'actor-1'
    );
    await maintenanceHandler.execute(command2);

    const result = await ctx.pool.query(
      `SELECT * FROM immobilisation.events 
       WHERE tenant_id = $1 AND event_type = 'MaintenanceRecorded'`,
      [tenantId]
    );

    expect(result.rows.length).toBe(2);
    const totalCost = result.rows.reduce((sum, row) => sum + row.payload.cost, 0);
    expect(totalCost).toBe(3000);
  });
});
