"use strict";
// tests/system/precomptabilite.e2e.spec.ts
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const PrecomptabiliteGuardian_1 = require("../../src/guardian/PrecomptabiliteGuardian");
const CreateDocumentHandler_1 = require("../../src/application/handlers/CreateDocumentHandler");
const UpdateDocumentMetadataHandler_1 = require("../../src/application/handlers/UpdateDocumentMetadataHandler");
const SubmitForValidationHandler_1 = require("../../src/application/handlers/SubmitForValidationHandler");
const ValidateDocumentHandler_1 = require("../../src/application/handlers/ValidateDocumentHandler");
const PrecomptabiliteProjection_1 = require("../../src/read-models/projections/PrecomptabiliteProjection");
const InMemoryPrecomptabiliteReadRepository_1 = require("../../src/read-models/repositories/InMemoryPrecomptabiliteReadRepository");
const PrecomptabiliteReadController_1 = require("../../src/api/PrecomptabiliteReadController");
(0, vitest_1.describe)('SYSTEM E2E — precomptabilite', () => {
    let controller;
    (0, vitest_1.beforeEach)(() => {
        const guardian = new PrecomptabiliteGuardian_1.PrecomptabiliteGuardian();
        const createHandler = new CreateDocumentHandler_1.CreateDocumentHandler(guardian);
        const updateHandler = new UpdateDocumentMetadataHandler_1.UpdateDocumentMetadataHandler(guardian);
        const submitHandler = new SubmitForValidationHandler_1.SubmitForValidationHandler(guardian);
        const validateHandler = new ValidateDocumentHandler_1.ValidateDocumentHandler(guardian);
        const projection = new PrecomptabiliteProjection_1.PrecomptabiliteProjection();
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
        projection.apply(created);
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
        projection.apply(updated);
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
        projection.apply(submitted);
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
        projection.apply(validated);
        // ----------------------
        // READ SIDE
        // ----------------------
        const repo = new InMemoryPrecomptabiliteReadRepository_1.InMemoryPrecomptabiliteReadRepository(projection.snapshotDocuments(), projection.snapshotStatuses(), projection.snapshotAnalytics(), projection.snapshotExposure());
        controller = new PrecomptabiliteReadController_1.PrecomptabiliteReadController(repo);
    });
    (0, vitest_1.it)('GET /precomptabilite/documents — returns document', async () => {
        const res = await controller.getDocuments({
            tenantId: 'TENANT_1',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.length).toBe(1);
        (0, vitest_1.expect)(res.body[0].documentId).toBe('DOC_1');
        (0, vitest_1.expect)(res.body[0].amount).toBe(850);
    });
    (0, vitest_1.it)('GET /precomptabilite/exposure — exposes only VALIDATED documents', async () => {
        const res = await controller.getExposure({
            tenantId: 'TENANT_1',
        });
        (0, vitest_1.expect)(res.status).toBe(200);
        (0, vitest_1.expect)(res.body.length).toBe(1);
        (0, vitest_1.expect)(res.body[0].status).toBe('VALIDATED');
        (0, vitest_1.expect)(res.body[0].amount).toBe(850);
    });
    (0, vitest_1.it)('SYSTEM — tenant isolation enforced', async () => {
        const res = await controller.getDocuments({
            tenantId: 'TENANT_X',
        });
        (0, vitest_1.expect)(res.body.length).toBe(0);
    });
    (0, vitest_1.it)('SYSTEM — forbidden fields are not exposed', async () => {
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
            (0, vitest_1.expect)(res.body[0][field]).toBeUndefined();
        });
    });
});
//# sourceMappingURL=precomptabilite.e2e.spec.js.map