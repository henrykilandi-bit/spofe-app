/**
 * Test d'intégration — Multi-Tenant Isolation
 * Module Immobilisation v1.0.0
 * 
 * SPOFE Compliance:
 * ✅ Guardian réel
 * ✅ Repository PostgreSQL réel
 * ✅ Validation isolation tenant
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestContext, teardownTestContext, cleanDatabase, generateTestId, TestContext } from './setup'
import { CreateAssetHandler } from '../../write/handlers/create-asset.handler';
import { CreateAssetCommand } from '../../write/commands/create-asset.command';
import { ImmobilisationGuardian } from '../../guardian/immobilisation.guardian';

describe('Multi-Tenant — Integration Tests', () => {
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

  it('should isolate assets by tenant', async () => {
    const tenantA = 'tenant-A-test';
    const tenantB = 'tenant-B-test';
    const assetIdA = generateTestId();
    const assetIdB = generateTestId();

    // Créer asset pour tenant A
    await handler.execute(new CreateAssetCommand(
      tenantA,
      assetIdA,
      'Asset A',
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
    ));

    // Créer asset pour tenant B
    await handler.execute(new CreateAssetCommand(
      tenantB,
      assetIdB,
      'Asset B',
      null,
      'EQUIPMENT',
      50000,
      'EUR',
      '2024-01-01',
      '2024-01-01',
      60,
      'LINEAR',
      5000,
      null,
      null,
      'actor-1'
    ));

    // Vérifier isolation
    const assetA_forA = await ctx.repository.getAssetById(tenantA, assetIdA);
    const assetA_forB = await ctx.repository.getAssetById(tenantB, assetIdA);
    const assetB_forB = await ctx.repository.getAssetById(tenantB, assetIdB);

    expect(assetA_forA).toBeDefined();
    expect(assetA_forA?.acquisitionCost).toBe(100000);
    expect(assetA_forB).toBeNull(); // Tenant B ne voit pas l'asset de A
    expect(assetB_forB).toBeDefined();
    expect(assetB_forB?.acquisitionCost).toBe(50000);
  });

  it('should reject command with missing tenantId', async () => {
    const guardian = new ImmobilisationGuardian();

    const command = new CreateAssetCommand(
      '', // ❌ tenantId manquant
      generateTestId(),
      'Invalid Asset',
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

    const state = {
      tenantId: '',
      now: new Date(),
    };

    expect(() => guardian.validate(command as any, state)).toThrow('TENANT_ID_REQUIRED');
  });

  it('should reject command accessing asset from different tenant', async () => {
    const tenantA = 'tenant-A-test';
    const tenantB = 'tenant-B-test';
    const assetId = generateTestId();

    // Créer asset pour tenant A
    await handler.execute(new CreateAssetCommand(
      tenantA,
      assetId,
      'Asset A',
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
    ));

    // Essayer d'accéder avec tenant B
    const asset = await ctx.repository.getAssetById(tenantB, assetId);
    expect(asset).toBeNull();
  });

  it('should isolate events by tenant', async () => {
    const tenantA = 'tenant-A-events';
    const tenantB = 'tenant-B-events';

    await handler.execute(new CreateAssetCommand(
      tenantA,
      generateTestId(),
      'Asset A',
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
    ));

    await handler.execute(new CreateAssetCommand(
      tenantB,
      generateTestId(),
      'Asset B',
      null,
      'EQUIPMENT',
      50000,
      'EUR',
      '2024-01-01',
      '2024-01-01',
      60,
      'LINEAR',
      5000,
      null,
      null,
      'actor-1'
    ));

    const eventsA = await ctx.pool.query(
      'SELECT COUNT(*) FROM immobilisation.events WHERE tenant_id = $1',
      [tenantA]
    );
    const eventsB = await ctx.pool.query(
      'SELECT COUNT(*) FROM immobilisation.events WHERE tenant_id = $1',
      [tenantB]
    );

    expect(eventsA.rows[0].count).toBe('1');
    expect(eventsB.rows[0].count).toBe('1');
  });
});
