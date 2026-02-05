/**
 * Test d'intégration — CreateAsset
 * Module Immobilisation v1.0.0
 * 
 * SPOFE Compliance:
 * ✅ Guardian réel
 * ✅ Repository PostgreSQL réel
 * ✅ Validation invariants + persistance
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestContext, teardownTestContext, cleanDatabase, generateTestId, generateTenantId, TestContext } from './setup'
import { CreateAssetHandler } from '../../write/handlers/create-asset.handler';
import { CreateAssetCommand } from '../../write/commands/create-asset.command';

describe('CreateAsset — Integration Tests', () => {
  let ctx: TestContext;
  let handler: CreateAssetHandler;

  beforeAll(async () => {
    ctx = await setupTestContext();
    handler = new CreateAssetHandler(ctx.guardian, ctx.repository);
  });

  afterAll(async () => {
    await teardownTestContext(ctx);
  });

  beforeEach(async () => {
    await cleanDatabase(ctx.pool);
  });

  it('should persist asset when Guardian validates', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

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

    await handler.execute(command);

    const asset = await ctx.repository.getAssetById(tenantId, assetId);
    expect(asset).toBeDefined();
    expect(asset.acquisitionCost).toBe(100000);
    expect(asset.status).toBe('IN_SERVICE');
  });

  it('should reject asset with invalid acquisition cost', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    const command = new CreateAssetCommand(
      tenantId,
      assetId,
      'Invalid Asset',
      null,
      'EQUIPMENT',
      -5000, // ❌ invalide
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

    await expect(handler.execute(command)).rejects.toThrow('ACQUISITION_COST_INVALID');

    // Vérifier qu'aucun asset n'a été créé
    const asset = await ctx.repository.getAssetById(tenantId, assetId);
    expect(asset).toBeNull();
  });

  it('should reject asset with service start date before acquisition date', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    const command = new CreateAssetCommand(
      tenantId,
      assetId,
      'Invalid Asset',
      null,
      'EQUIPMENT',
      50000,
      'EUR',
      '2024-06-01',
      '2024-01-01', // ❌ avant acquisition
      120,
      'LINEAR',
      10000,
      null,
      null,
      'actor-1'
    );

    await expect(handler.execute(command)).rejects.toThrow('SERVICE_START_BEFORE_ACQUISITION');

    const asset = await ctx.repository.getAssetById(tenantId, assetId);
    expect(asset).toBeNull();
  });

  it('should reject asset with residual value >= acquisition cost', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    const command = new CreateAssetCommand(
      tenantId,
      assetId,
      'Invalid Asset',
      null,
      'EQUIPMENT',
      50000,
      'EUR',
      '2024-01-01',
      '2024-01-01',
      120,
      'LINEAR',
      50000, // ❌ égal au coût
      null,
      null,
      'actor-1'
    );

    await expect(handler.execute(command)).rejects.toThrow('RESIDUAL_VALUE_INVALID');

    const asset = await ctx.repository.getAssetById(tenantId, assetId);
    expect(asset).toBeNull();
  });

  it('should create event in database', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    const command = new CreateAssetCommand(
      tenantId,
      assetId,
      'Event Test Asset',
      null,
      'EQUIPMENT',
      75000,
      'EUR',
      '2024-01-01',
      '2024-01-01',
      60,
      'LINEAR',
      5000,
      null,
      null,
      'actor-1'
    );

    await handler.execute(command);

    const result = await ctx.pool.query(
      'SELECT * FROM immobilisation.events WHERE tenant_id = $1 AND payload->>\'assetId\' = $2',
      [tenantId, assetId]
    );

    expect(result.rows.length).toBeGreaterThan(0);
    expect(result.rows[0].event_type).toBe('AssetCreated');
  });
});
