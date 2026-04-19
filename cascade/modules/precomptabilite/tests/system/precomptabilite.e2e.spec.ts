// tests/system/precomptabilite.e2e.spec.ts

import { describe, it, expect, beforeEach } from '@jest/globals';

import { PrecomptabiliteGuardian } from '../../src/guardian/PrecomptabiliteGuardian';

import { CreateDocumentHandler } from '../../src/application/handlers/CreateDocumentHandler';
import { UpdateDocumentMetadataHandler } from '../../src/application/handlers/UpdateDocumentMetadataHandler';
import { SubmitForValidationHandler } from '../../src/application/handlers/SubmitForValidationHandler';
import { ValidateDocumentHandler } from '../../src/application/handlers/ValidateDocumentHandler';

import { PrecomptabiliteProjection } from '../../src/read-models/projections/PrecomptabiliteProjection';
import { InMemoryPrecomptabiliteReadRepository } from '../../src/read-models/repositories/InMemoryPrecomptabiliteReadRepository';

import { PrecomptabiliteReadController } from '../../src/api/PrecomptabiliteReadController';

describe('SYSTEM E2E — precomptabilite', () => {
  let controller: PrecomptabiliteReadController;

  beforeEach(() => {
    const guardian = new PrecomptabiliteGuardian();

    const createHandler = new CreateDocumentHandler(guardian);
    const updateHandler = new UpdateDocumentMetadataHandler(guardian);
    const submitHandler = new SubmitForValidationHandler(guardian);
    const validateHandler = new ValidateDocumentHandler(guardian);

    const projection = new PrecomptabiliteProjection();

    // ----------------------
    // COMMAND 1 — CREATE
    // ----------------------
    const created = createHandler.handle({
      commandId: 'CMD_1',
      tenantId: 'TENANT_1',
      actorId: 'ACTOR_1',
      documentId: 'DOC_1',
      documentType: 'SUPPLIER_INVOICE',
    });

    projection.apply(created as any);

    // ----------------------
    // COMMAND 2 — METADATA
    // ----------------------
    const updated = updateHandler.handle({
      commandId: 'CMD_2',
      tenantId: 'TENANT_1',
      actorId: 'ACTOR_1',
      documentId: 'DOC_1',
      metadata: {
        amount: 850,
        currency: 'EUR',
        supplierName: 'FOURNISSEUR X',
      },
      analytics: {
        projectId: 'CHANTIER_1',
      },
    });

    projection.apply(updated as any);

    // ----------------------
    // COMMAND 3 — SUBMIT
    // ----------------------
    const submitted = submitHandler.handle({
      commandId: 'CMD_3',
      tenantId: 'TENANT_1',
      actorId: 'ACTOR_1',
      documentId: 'DOC_1',
      currentStatus: 'DRAFT',
    });

    projection.apply(submitted as any);

    // ----------------------
    // COMMAND 4 — VALIDATE
    // ----------------------
    const validated = validateHandler.handle({
      commandId: 'CMD_4',
      tenantId: 'TENANT_1',
      actorId: 'ACTOR_1',
      documentId: 'DOC_1',
      currentStatus: 'SUBMITTED',
    });

    projection.apply(validated as any);

    // ----------------------
    // READ SIDE
    // ----------------------
    const repo = new InMemoryPrecomptabiliteReadRepository(
      projection.snapshotDocuments(),
      projection.snapshotStatuses(),
      projection.snapshotAnalytics(),
      projection.snapshotExposure()
    );

    controller = new PrecomptabiliteReadController(repo);
  });

  it('GET /precomptabilite/documents — returns document', async () => {
    const res = await controller.getDocuments({
      tenantId: 'TENANT_1',
    });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].documentId).toBe('DOC_1');
    expect(res.body[0].amount).toBe(850);
  });

  it('GET /precomptabilite/exposure — exposes only VALIDATED documents', async () => {
    const res = await controller.getExposure({
      tenantId: 'TENANT_1',
    });

    expect(res.status).toBe(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].status).toBe('VALIDATED');
    expect(res.body[0].amount).toBe(850);
  });

  it('SYSTEM — tenant isolation enforced', async () => {
    const res = await controller.getDocuments({
      tenantId: 'TENANT_X',
    });

    expect(res.body.length).toBe(0);
  });

  it('SYSTEM — forbidden fields are not exposed', async () => {
    const res = await controller.getExposure({
      tenantId: 'TENANT_1',
    });

    const forbidden = [
      'accountingEntry',
      'journal',
      'taxCalculation',
      'paymentOrder',
      'decision',
    ];

    forbidden.forEach(field => {
      expect((res.body[0] as any)[field]).toBeUndefined();
    });
  });
});
