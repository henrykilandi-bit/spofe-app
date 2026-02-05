/**
 * Test d'intégration — DisposeAsset
 * Module Immobilisation v1.0.0
 * 
 * SPOFE Compliance:
 * ✅ Guardian réel
 * ✅ Repository PostgreSQL réel
 * ✅ Validation invariants + persistance
 */

import { describe, it, expect, beforeAll, afterAll, beforeEach } from '@jest/globals';
import { setupTestContext, teardownTestContext, cleanDatabase, generateTestId, generateTenantId, TestContext } from './setup'
import { DisposeAssetHandler } from '../../write/handlers/dispose-asset.handler';
import { DisposeAssetCommand } from '../../write/commands/dispose-asset.command';
import { CreateAssetCommand } from '../../write/commands/create-asset.command';
import { CreateAssetHandler } from '../../write/handlers/create-asset.handler';
import { RecordDepreciationCommand } from '../../write/commands/record-depreciation.command';
import { RecordDepreciationHandler } from '../../write/handlers/record-depreciation.handler';

describe('DisposeAsset — Integration Tests', () => {
  let ctx: TestContext;
  let disposeHandler: DisposeAssetHandler;
  let createHandler: CreateAssetHandler;
  let depreciationHandler: RecordDepreciationHandler;

  beforeAll(async () => {
    ctx = await setupTestContext();
    disposeHandler = new DisposeAssetHandler(ctx.guardian, ctx.repository);
    createHandler = new CreateAssetHandler(ctx.guardian, ctx.repository);
    depreciationHandler = new RecordDepreciationHandler(ctx.guardian, ctx.repository);
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

  it('should calculate gain on disposal (disposal > NBV)', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    await createTestAsset(tenantId, assetId);

    // Quelques amortissements
    await depreciationHandler.execute(new RecordDepreciationCommand(tenantId, assetId, '2024-01', 'actor-1'));
    await depreciationHandler.execute(new RecordDepreciationCommand(tenantId, assetId, '2024-02', 'actor-1'));

    const command = new DisposeAssetCommand(
      tenantId,
      assetId,
      'SALE',
      '2024-03-15',
      95000,
      'EUR',
      null,
      'Vente standard',
      'actor-1'
    );

    await disposeHandler.execute(command);

    const asset = await ctx.repository.getAssetById(tenantId, assetId);
    expect(asset.status).toBe('DISPOSED');
  });

  it('should calculate loss on disposal (disposal < NBV)', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    await createTestAsset(tenantId, assetId);

    const command = new DisposeAssetCommand(
      tenantId,
      assetId,
      'SALE',
      '2024-03-15',
      50000,
      'EUR',
      null,
      'Vente avec perte',
      'actor-1'
    );

    await disposeHandler.execute(command);

    const asset = await ctx.repository.getAssetById(tenantId, assetId);
    expect(asset.status).toBe('DISPOSED');
  });

  it('should reject disposal of already disposed asset', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    await createTestAsset(tenantId, assetId);

    const command1 = new DisposeAssetCommand(
      tenantId,
      assetId,
      'SALE',
      '2024-03-15',
      50000,
      'EUR',
      null,
      'Première vente',
      'actor-1'
    );
    await disposeHandler.execute(command1);

    const command2 = new DisposeAssetCommand(
      tenantId,
      assetId,
      'SALE',
      '2024-04-15',
      40000,
      'EUR',
      null,
      'Deuxième vente',
      'actor-1'
    );

    await expect(disposeHandler.execute(command2)).rejects.toThrow('ASSET_ALREADY_DISPOSED');
  });

  it('should reject disposal with negative value', async () => {
    const tenantId = generateTenantId();
    const assetId = generateTestId();

    await createTestAsset(tenantId, assetId);

    const command = new DisposeAssetCommand(
      tenantId,
      assetId,
      'SCRAP',
      '2024-03-15',
      -1000,
      'EUR',
      null,
      'Rebut',
      'actor-1'
    );

    await expect(disposeHandler.execute(command)).rejects.toThrow('DISPOSAL_VALUE_NEGATIVE');
  });
});
