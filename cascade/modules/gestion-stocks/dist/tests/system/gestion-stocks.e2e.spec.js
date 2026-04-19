"use strict";
// tests/system/gestion-stocks.e2e.spec.ts
// GESTION-STOCKS — Tests Système E2E (SPOFE P0)
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const StockGuardian_1 = require("../../src/guardian/StockGuardian");
const GuardianError_1 = require("../../src/guardian/GuardianError");
const StockApiWiring_1 = require("../../src/api/StockApiWiring");
(0, vitest_1.describe)('SYSTÈME E2E — gestion-stocks', () => {
    (0, vitest_1.it)('E2E-01 — flux complet entrée + lecture', async () => {
        const guardian = new StockGuardian_1.StockGuardian();
        const ctx = {
            tenantId: 'TENANT_A',
            actorId: 'USER_1',
        };
        const fact = {
            movementId: 'MOV_001',
            tenantId: 'TENANT_A',
            productId: 'PROD_100',
            category: 'MARCHANDISES',
            quantity: 50,
            depotId: 'DEPOT_1',
            movementType: 'ENTRY',
            documentId: 'DOC_001',
            documentStatus: 'VALIDATED',
            resultingStock: 50,
        };
        // Guardian valide
        (0, vitest_1.expect)(() => guardian.validate(ctx, fact)).not.toThrow();
        // Projection + API
        const events = [
            {
                type: 'StockEntered',
                payload: {
                    ...fact,
                    occurredAt: new Date().toISOString(),
                },
            },
        ];
        const api = (0, StockApiWiring_1.createStockReadApi)(events);
        // Lecture mouvements
        const movementsResp = await api.getMovements({
            tenantId: 'TENANT_A',
        });
        (0, vitest_1.expect)(movementsResp.status).toBe(200);
        (0, vitest_1.expect)(movementsResp.body).toHaveLength(1);
        (0, vitest_1.expect)(movementsResp.body[0].productId).toBe('PROD_100');
        // Lecture stock par dépôt
        const depotResp = await api.getStockByDepot({
            tenantId: 'TENANT_A',
        });
        (0, vitest_1.expect)(depotResp.status).toBe(200);
        (0, vitest_1.expect)(depotResp.body).toHaveLength(1);
        (0, vitest_1.expect)(depotResp.body[0].quantity).toBe(50);
    });
    (0, vitest_1.it)('E2E-02 — isolation tenant stricte', async () => {
        const events = [
            {
                type: 'StockEntered',
                payload: {
                    movementId: 'MOV_T1',
                    tenantId: 'TENANT_A',
                    productId: 'PROD_1',
                    category: 'MARCHANDISES',
                    quantity: 10,
                    depotId: 'DEPOT_1',
                    movementType: 'ENTRY',
                    documentId: 'DOC_1',
                    occurredAt: new Date().toISOString(),
                },
            },
            {
                type: 'StockEntered',
                payload: {
                    movementId: 'MOV_T2',
                    tenantId: 'TENANT_B',
                    productId: 'PROD_1',
                    category: 'MARCHANDISES',
                    quantity: 20,
                    depotId: 'DEPOT_1',
                    movementType: 'ENTRY',
                    documentId: 'DOC_2',
                    occurredAt: new Date().toISOString(),
                },
            },
        ];
        const api = (0, StockApiWiring_1.createStockReadApi)(events);
        const respA = await api.getMovements({ tenantId: 'TENANT_A' });
        const respB = await api.getMovements({ tenantId: 'TENANT_B' });
        (0, vitest_1.expect)(respA.body).toHaveLength(1);
        (0, vitest_1.expect)(respA.body[0].tenantId).toBe('TENANT_A');
        (0, vitest_1.expect)(respB.body).toHaveLength(1);
        (0, vitest_1.expect)(respB.body[0].tenantId).toBe('TENANT_B');
    });
    (0, vitest_1.it)('E2E-03 — entrée + sortie = stock correct', async () => {
        const events = [
            {
                type: 'StockEntered',
                payload: {
                    movementId: 'MOV_E1',
                    tenantId: 'TENANT_A',
                    productId: 'PROD_X',
                    category: 'PRODUITS_FINIS',
                    quantity: 100,
                    depotId: 'DEPOT_1',
                    movementType: 'ENTRY',
                    documentId: 'DOC_E1',
                    occurredAt: new Date().toISOString(),
                },
            },
            {
                type: 'StockExited',
                payload: {
                    movementId: 'MOV_S1',
                    tenantId: 'TENANT_A',
                    productId: 'PROD_X',
                    category: 'PRODUITS_FINIS',
                    quantity: 30,
                    depotId: 'DEPOT_1',
                    movementType: 'EXIT',
                    documentId: 'DOC_S1',
                    occurredAt: new Date().toISOString(),
                },
            },
        ];
        const api = (0, StockApiWiring_1.createStockReadApi)(events);
        const stockResp = await api.getStockByProduct({
            tenantId: 'TENANT_A',
        });
        (0, vitest_1.expect)(stockResp.body).toHaveLength(1);
        (0, vitest_1.expect)(stockResp.body[0].quantity).toBe(70); // 100 - 30
    });
    (0, vitest_1.it)('E2E-04 — transfert entre dépôts', async () => {
        const guardian = new StockGuardian_1.StockGuardian();
        const ctx = {
            tenantId: 'TENANT_A',
            actorId: 'USER_1',
        };
        const transferFact = {
            movementId: 'MOV_TR1',
            tenantId: 'TENANT_A',
            productId: 'PROD_Y',
            category: 'MATIERES_PREMIERES',
            quantity: 25,
            depotId: 'DEPOT_A',
            targetDepotId: 'DEPOT_B',
            movementType: 'TRANSFER',
            documentId: 'DOC_TR1',
            documentStatus: 'VALIDATED',
            resultingStock: 75, // stock source après transfert
        };
        // Guardian valide le transfert
        (0, vitest_1.expect)(() => guardian.validate(ctx, transferFact)).not.toThrow();
        const events = [
            {
                type: 'StockEntered',
                payload: {
                    movementId: 'MOV_INIT',
                    tenantId: 'TENANT_A',
                    productId: 'PROD_Y',
                    category: 'MATIERES_PREMIERES',
                    quantity: 100,
                    depotId: 'DEPOT_A',
                    movementType: 'ENTRY',
                    documentId: 'DOC_INIT',
                    occurredAt: new Date().toISOString(),
                },
            },
            {
                type: 'StockTransferred',
                payload: {
                    ...transferFact,
                    occurredAt: new Date().toISOString(),
                },
            },
        ];
        const api = (0, StockApiWiring_1.createStockReadApi)(events);
        const stockResp = await api.getStockByDepot({
            tenantId: 'TENANT_A',
        });
        // Dépôt source: 75 (100 - 25)
        const depotA = stockResp.body.find((s) => s.depotId === 'DEPOT_A');
        (0, vitest_1.expect)(depotA?.quantity).toBe(75);
        // Dépôt cible: 25
        const depotB = stockResp.body.find((s) => s.depotId === 'DEPOT_B');
        (0, vitest_1.expect)(depotB?.quantity).toBe(25);
    });
    (0, vitest_1.it)('E2E-05 — ajustement de stock', async () => {
        const events = [
            {
                type: 'StockEntered',
                payload: {
                    movementId: 'MOV_E1',
                    tenantId: 'TENANT_A',
                    productId: 'PROD_Z',
                    category: 'EMBALLAGES_PERDUS',
                    quantity: 50,
                    depotId: 'DEPOT_1',
                    movementType: 'ENTRY',
                    documentId: 'DOC_E1',
                    occurredAt: new Date().toISOString(),
                },
            },
            {
                type: 'StockAdjusted',
                payload: {
                    movementId: 'MOV_ADJ1',
                    tenantId: 'TENANT_A',
                    productId: 'PROD_Z',
                    category: 'EMBALLAGES_PERDUS',
                    quantity: 5,
                    depotId: 'DEPOT_1',
                    movementType: 'ADJUSTMENT',
                    documentId: 'DOC_ADJ1',
                    occurredAt: new Date().toISOString(),
                },
            },
        ];
        const api = (0, StockApiWiring_1.createStockReadApi)(events);
        const stockResp = await api.getStockByCategory({
            tenantId: 'TENANT_A',
        });
        (0, vitest_1.expect)(stockResp.body).toHaveLength(1);
        (0, vitest_1.expect)(stockResp.body[0].quantity).toBe(55); // 50 + 5
    });
    (0, vitest_1.it)('E2E-06 — API getStockByProduct retourne plusieurs dépôts', async () => {
        const events = [
            {
                type: 'StockEntered',
                payload: {
                    movementId: 'MOV_1',
                    tenantId: 'TENANT_A',
                    productId: 'PROD_MULTI',
                    category: 'MARCHANDISES',
                    quantity: 30,
                    depotId: 'DEPOT_1',
                    movementType: 'ENTRY',
                    documentId: 'DOC_1',
                    occurredAt: new Date().toISOString(),
                },
            },
            {
                type: 'StockEntered',
                payload: {
                    movementId: 'MOV_2',
                    tenantId: 'TENANT_A',
                    productId: 'PROD_MULTI',
                    category: 'MARCHANDISES',
                    quantity: 70,
                    depotId: 'DEPOT_2',
                    movementType: 'ENTRY',
                    documentId: 'DOC_2',
                    occurredAt: new Date().toISOString(),
                },
            },
        ];
        const api = (0, StockApiWiring_1.createStockReadApi)(events);
        const stockResp = await api.getStockByProduct({
            tenantId: 'TENANT_A',
        });
        (0, vitest_1.expect)(stockResp.body).toHaveLength(2);
        const depot1 = stockResp.body.find((s) => s.depotId === 'DEPOT_1');
        const depot2 = stockResp.body.find((s) => s.depotId === 'DEPOT_2');
        (0, vitest_1.expect)(depot1?.quantity).toBe(30);
        (0, vitest_1.expect)(depot2?.quantity).toBe(70);
    });
    (0, vitest_1.it)('E2E-07 — rejet Guardian bloque toute la chaîne', () => {
        const guardian = new StockGuardian_1.StockGuardian();
        const ctx = {
            tenantId: 'TENANT_A',
            actorId: 'USER_1',
        };
        const invalidFact = {
            movementId: 'MOV_INVALID',
            tenantId: 'TENANT_A',
            productId: 'PROD_X',
            category: 'MARCHANDISES',
            quantity: 10,
            depotId: 'DEPOT_1',
            movementType: 'ENTRY',
            documentId: 'DOC_1',
            documentStatus: 'VALIDATED',
            resultingStock: -5, // INVALIDE: stock négatif (GS-05)
        };
        // Guardian rejette
        (0, vitest_1.expect)(() => guardian.validate(ctx, invalidFact)).toThrow(GuardianError_1.GuardianError);
        // Aucun événement n'est produit
        const events = [];
        const api = (0, StockApiWiring_1.createStockReadApi)(events);
        // API retourne vide (aucun mouvement)
        const resp = api.getMovements({ tenantId: 'TENANT_A' });
        (0, vitest_1.expect)(resp).resolves.toMatchObject({
            status: 200,
            body: [],
        });
    });
});
//# sourceMappingURL=gestion-stocks.e2e.spec.js.map