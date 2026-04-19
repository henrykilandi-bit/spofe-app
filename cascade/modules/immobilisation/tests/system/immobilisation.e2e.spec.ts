import { describe, it, expect, beforeEach } from '@jest/globals';

import { ImmobilisationProjection } from '../../src/read-models/ImmobilisationProjection';
import { InMemoryImmobilisationReadRepository } from '../../src/read-models/InMemoryImmobilisationReadRepository';
import { ImmobilisationReadController } from '../../src/api/ImmobilisationReadController';
import { ImmobilisationRM } from '../../src/read-models/types';

const T1 = 'TENANT_1';
const T2 = 'TENANT_2';

function rm(overrides: Partial<ImmobilisationRM>): ImmobilisationRM {
  return {
    immobilisationId: 'IMM_1',
    tenantId: T1,
    category: 'CORPORELLE',
    acquisitionDate: '2026-01-01',
    amount: 1000,
    documentId: 'DOC_1',
    status: 'REGISTERED',
    ...overrides,
  };
}

describe('SYSTEM E2E — Immobilisation (read-only inter-couches)', () => {
  let projection: ImmobilisationProjection;
  let controller: ImmobilisationReadController;

  beforeEach(() => {
    projection = new ImmobilisationProjection();

    projection.apply({
      type: 'ImmobilisationRegistered',
      payload: rm({
        immobilisationId: 'IMM_1',
        tenantId: T1,
        category: 'CORPORELLE',
      }),
    });

    projection.apply({
      type: 'ImmobilisationPutInService',
      payload: rm({
        immobilisationId: 'IMM_1',
        tenantId: T1,
        inServiceDate: '2026-02-01',
      }),
    });

    projection.apply({
      type: 'ImmobilisationRegistered',
      payload: rm({
        immobilisationId: 'IMM_2',
        tenantId: T1,
        category: 'FINANCIERE',
      }),
    });

    projection.apply({
      type: 'ImmobilisationRegistered',
      payload: rm({
        immobilisationId: 'IMM_3',
        tenantId: T2,
        category: 'INCORPORELLE',
      }),
    });

    projection.apply({
      type: 'ImmobilisationDisposed',
      payload: rm({
        immobilisationId: 'IMM_3',
        tenantId: T2,
        disposedDate: '2026-03-01',
      }),
    });

    const repo = new InMemoryImmobilisationReadRepository(
      projection.snapshot()
    );

    controller = new ImmobilisationReadController(repo);
  });

  it('GET /immobilisations — tenant isolation', async () => {
    const res = await controller.getAll({ tenantId: T1 });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(2);
    expect(res.body.every((i) => i.tenantId === T1)).toBe(true);
  });

  it('GET /immobilisations/{id} — 200 or 404', async () => {
    const ok = await controller.getById({
      tenantId: T1,
      params: { id: 'IMM_1' },
    });

    expect(ok.status).toBe(200);
    expect(ok.body?.immobilisationId).toBe('IMM_1');

    const notFound = await controller.getById({
      tenantId: T1,
      params: { id: 'UNKNOWN' },
    });

    expect(notFound.status).toBe(404);
    expect(notFound.body).toBe(null);
  });

  it('GET /immobilisations/{id} — 400 on missing id', async () => {
    const res = await controller.getById({ tenantId: T1 });
    expect(res.status).toBe(400);
    expect(res.body).toBe(null);
  });

  it('GET /immobilisations/en-service — status filter', async () => {
    const res = await controller.getInService({ tenantId: T1 });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe('IN_SERVICE');
  });

  it('GET /immobilisations/disposed — disposed only', async () => {
    const res = await controller.getDisposed({ tenantId: T2 });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe('DISPOSED');
  });

  it('GET /immobilisations?category=CORPORELLE', async () => {
    const res = await controller.getByCategory({
      tenantId: T1,
      query: { category: 'CORPORELLE' },
    });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].category).toBe('CORPORELLE');
  });

  it('GET /immobilisations?category=... — 400 if missing', async () => {
    const res = await controller.getByCategory({ tenantId: T1 });

    expect(res.status).toBe(400);
    expect(res.body.length).toBe(0);
  });
});
