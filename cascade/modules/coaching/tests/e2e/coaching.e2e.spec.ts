import { describe, it, expect } from '@jest/globals';
import { createTestApp } from './testHarness';

describe('E2E — Module Coaching', () => {
  const tenantId = 'TENANT_1';
  const actorId = 'ACTOR_1';

  it('E2E — create action → visible in read-model', () => {
    const ctx = createTestApp();

    ctx.commands.createAction({
      commandId: 'CMD1',
      tenantId,
      actorId,
      actionId: 'ACTION_1',
      description: 'Réduire charges',
      responsibleActorId: actorId,
      dueDate: '2024-12-31',
    });

    expect(ctx.stores.actions.length).toBe(1);
    expect(ctx.stores.actions[0].description).toBe('Réduire charges');
  });

  it('E2E — plan session → exchange allowed only when active', () => {
    const ctx = createTestApp();

    ctx.commands.planSession({
      commandId: 'CMD2',
      tenantId,
      actorId,
      sessionId: 'SESSION_1',
      plannedDate: '2024-06-01',
      relatedActionIds: [],
    });

    expect(ctx.stores.sessions.length).toBe(1);

    ctx.commands.addExchange({
      commandId: 'CMD3',
      tenantId,
      actorId,
      sessionId: 'SESSION_1',
      exchangeId: 'EX1',
      type: 'TEXT',
      contentReference: 'note',
      sessionPlanned: true,
      sessionActive: true,
    });

    expect(ctx.stores.exchanges.length).toBe(1);
  });

  it('E2E — journal entry appears in read-model', () => {
    const ctx = createTestApp();

    ctx.commands.addJournal({
      commandId: 'CMD4',
      tenantId,
      actorId,
      entryId: 'J1',
      moduleSource: 'Budget',
      subject: 'Écart détecté',
      comment: 'Dépenses énergie',
    });

    expect(ctx.stores.journal.length).toBe(1);
    expect(ctx.stores.journal[0].moduleSource).toBe('Budget');
  });

  it('E2E — API exposes read-models (GET only)', async () => {
    const ctx = createTestApp();

    const res = await ctx
      .request(ctx.app)
      .get('/coaching/journal')
      .set('tenant-id', tenantId);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});
