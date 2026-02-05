/**
 * Test d'intégration — RecordDepreciation
 * Module Immobilisation v1.0.0
 * 
 * SPOFE Compliance:
 * ✅ Guardian réel
 * ✅ Repository PostgreSQL réel
 * ✅ Validation invariants + persistance
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestContext, teardownTestContext, cleanDatabase, generateTestId, generateTenantId, TestContext } from './setup'
import { RecordDepreciationHandler } from '../../write/handlers/record-depreciation.handler';
import { RecordDepreciationCommand } from '../../write/commands/record-depreciation.command';
import { CreateAssetCommand } from '../../write/commands/create-asset.command';
import { CreateAssetHandler } from '../../write/handlers/create-asset.handler';

describe('RecordDepreciation — Integration Tests', () => {
  let ctx: TestContext;
  let recordHandler: RecordDepreciationHandler;
  let createHandler: CreateAssetHandler;

  beforeAll(async () => {
    ctx = await setupTestContext();
    recordHandler = new RecordDepreciationHandler(ctx.guardian, ctx.repository);
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
      120000,
      'EUR',
      '2024-01-01',
      '2024-01-01',
      120,
      'LINEAR',
      20000,
      null,
      null,
      'actor-1'
    );
    await createHandler.execute(command);
  }

  it('should record depreciation for active asset', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    await createTestAsset(tenantId, assetId);

    const command = new RecordDepreciationCommand(
      tenantId,
      assetId,
      '2024-01',
      'actor-1'
    );

    await recordHandler.execute(command);

    const state = await ctx.repository.getDepreciationState(tenantId, assetId);
    expect(state.depreciatedPeriods).toContain('2024-01');
    expect(state.accumulatedDepreciation).toBeGreaterThan(0);
  });

  it('should reject depreciation for already depreciated period', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    await createTestAsset(tenantId, assetId);

    const command1 = new RecordDepreciationCommand(
      tenantId,
      assetId,
      '2024-01',
      'actor-1'
    );
    await recordHandler.execute(command1);

    const command2 = new RecordDepreciationCommand(
      tenantId,
      assetId,
      '2024-01', // ❌ même période
      'actor-1'
    );

    await expect(recordHandler.execute(command2)).rejects.toThrow('PERIOD_ALREADY_DEPRECIATED');
  });

  it('should reject depreciation for disposed asset', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    await createTestAsset(tenantId, assetId);

    // Marquer l'asset comme DISPOSED
    await ctx.pool.query(
      `UPDATE immobilisation.assets SET status = 'DISPOSED' 
       WHERE tenant_id = $1 AND asset_id = $2`,
      [tenantId, assetId]
    );

    const command = new RecordDepreciationCommand(
      tenantId,
      assetId,
      '2024-02',
      'actor-1'
    );

    await expect(recordHandler.execute(command)).rejects.toThrow('ASSET_NOT_IN_SERVICE');
  });

  it('should calculate correct monthly depreciation (linear)', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    await createTestAsset(tenantId, assetId);
    // Cost: 120000, Residual: 20000, Life: 120 months
    // Monthly: (120000 - 20000) / 120 = 833.33

    const command = new RecordDepreciationCommand(
      tenantId,
      assetId,
      '2024-01',
      'actor-1'
    );

    await recordHandler.execute(command);

    const state = await ctx.repository.getDepreciationState(tenantId, assetId);
    expect(state.accumulatedDepreciation).toBeCloseTo(833.33, 2);
    expect(state.netBookValue).toBeCloseTo(119166.67, 2);
  });
});
