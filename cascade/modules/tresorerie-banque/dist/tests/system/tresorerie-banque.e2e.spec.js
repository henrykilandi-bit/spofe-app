"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const handlers_1 = require("../../src/application/handlers");
const BankGuardian_1 = require("../../src/domain/guardian/BankGuardian");
const read_models_1 = require("../../src/read-models");
const api_1 = require("../../src/api");
/**
 * 🧪 TESTS SYSTÈME — TRÉSORERIE BANQUE v1.0.0
 * SPOFE P0 — E2E inter-couches uniquement
 *
 * Règles P0 :
 * ✅ traversent plusieurs couches
 * ❌ ne testent aucun invariant Guardian (déjà gelé)
 * ❌ ne testent aucune règle métier fine
 * ✅ valident la cohérence globale :
 *    Commande → Handler → Event → Projection → API
 *
 * Périmètre testé :
 * - enchaînement Application → EventStore → Read-Models → API
 * - respect du document-first
 * - isolation tenant / banque / compte
 * - exposition read-only conforme
 */
(0, vitest_1.describe)("SYSTEM E2E — Trésorerie Banque (SPOFE P0)", () => {
    /**
     * S-TB-01 — Cycle bancaire minimal
     *
     * 1. Création d'un compte bancaire
     * 2. Enregistrement d'un document bancaire
     * 3. Constat d'un débit bancaire
     * 4. Projection des read-models
     * 5. Lecture via API read-only
     *
     * Résultat attendu :
     * Les vues exposées reflètent exactement les événements émis.
     */
    (0, vitest_1.it)("S-TB-01 — cycle bancaire minimal end-to-end", async () => {
        /* ---------------- Infra in-memory ---------------- */
        const events = [];
        const eventStore = {
            append: async (event) => {
                events.push(event);
            }
        };
        const repo = {
            bankExists: async () => true,
            bankAccountExists: async () => true,
            documentExists: async () => true
        };
        /* ---------------- Guardian ---------------- */
        const guardian = new BankGuardian_1.BankGuardian();
        /* ---------------- Handlers ---------------- */
        const registerAccount = new handlers_1.RegisterBankAccountHandler(guardian, repo, eventStore);
        const registerDocument = new handlers_1.RegisterBankDocumentHandler(guardian, repo, eventStore);
        const recordDebit = new handlers_1.RecordBankDebitHandler(guardian, repo, eventStore);
        /* ---------------- Commands ---------------- */
        await registerAccount.execute({
            tenantId: "TENANT_1",
            bankId: "BANK_A",
            bankAccountId: "ACC_1",
            currency: "XOF",
            actorId: "SYS"
        });
        await registerDocument.execute({
            tenantId: "TENANT_1",
            bankId: "BANK_A",
            bankAccountId: "ACC_1",
            documentId: "DOC_1",
            documentType: "STATEMENT",
            documentDate: "2024-01-01",
            actorId: "SYS"
        });
        await recordDebit.execute({
            tenantId: "TENANT_1",
            bankId: "BANK_A",
            bankAccountId: "ACC_1",
            documentId: "DOC_1",
            amount: 10000,
            bankDate: "2024-01-02",
            actorId: "SYS"
        });
        /* ---------------- Projections ---------------- */
        const stateProjection = new read_models_1.BankAccountStateProjection();
        const journalProjection = new read_models_1.BankJournalProjection();
        const movementProjection = new read_models_1.BankMovementProjection();
        let accountState = null;
        const journal = [];
        const movements = [];
        for (const event of events) {
            accountState = stateProjection.project(accountState, event);
            const journalEntry = journalProjection.project(event);
            if (journalEntry)
                journal.push(journalEntry);
            const movement = movementProjection.project(event);
            if (movement)
                movements.push(movement);
        }
        /* ---------------- Read repo ---------------- */
        const readRepo = {
            getAccounts: async () => [accountState],
            getAccountState: async () => accountState,
            getJournal: async () => journal,
            getMovements: async () => movements,
            getDocuments: async () => [],
            getBalances: async () => []
        };
        /* ---------------- API ---------------- */
        const stateApi = new api_1.BankAccountStateController(readRepo);
        const journalApi = new api_1.BankJournalController(readRepo);
        const movementsApi = new api_1.BankMovementsController(readRepo);
        const state = await stateApi.getState({
            tenantId: "TENANT_1",
            bankId: "BANK_A",
            bankAccountId: "ACC_1"
        });
        const journalResult = await journalApi.getJournal({
            tenantId: "TENANT_1",
            bankId: "BANK_A",
            bankAccountId: "ACC_1"
        });
        const movementsResult = await movementsApi.getMovements({
            tenantId: "TENANT_1",
            bankId: "BANK_A",
            bankAccountId: "ACC_1"
        });
        /* ---------------- Assertions système ---------------- */
        // S-01 : État du compte projeté
        (0, vitest_1.expect)(state).not.toBeNull();
        (0, vitest_1.expect)(state.bankAccountId).toBe("ACC_1");
        (0, vitest_1.expect)(state.currency).toBe("XOF");
        (0, vitest_1.expect)(state.status).toBe("ACTIVE");
        // S-02 : Journal alimenté par événements
        (0, vitest_1.expect)(journalResult.length).toBeGreaterThan(0);
        // S-03 : Mouvements correctement projetés
        (0, vitest_1.expect)(movementsResult.length).toBe(1);
        (0, vitest_1.expect)(movementsResult[0].amount).toBe(10000);
        (0, vitest_1.expect)(movementsResult[0].type).toBe("DEBIT");
        (0, vitest_1.expect)(movementsResult[0].bankAccountId).toBe("ACC_1");
        // S-04 : Isolation tenant respectée
        (0, vitest_1.expect)(movementsResult[0].tenantId).toBe("TENANT_1");
        (0, vitest_1.expect)(movementsResult[0].bankId).toBe("BANK_A");
    });
    /**
     * S-TB-02 — Cycle crédit bancaire
     */
    (0, vitest_1.it)("S-TB-02 — cycle crédit bancaire end-to-end", async () => {
        const events = [];
        const eventStore = {
            append: async (e) => { events.push(e); }
        };
        const repo = {
            bankExists: async () => true,
            bankAccountExists: async () => true,
            documentExists: async () => true
        };
        const guardian = new BankGuardian_1.BankGuardian();
        const registerAccount = new handlers_1.RegisterBankAccountHandler(guardian, repo, eventStore);
        const recordCredit = new handlers_1.RecordBankCreditHandler(guardian, repo, eventStore);
        await registerAccount.execute({
            tenantId: "TENANT_2",
            bankId: "BANK_B",
            bankAccountId: "ACC_2",
            currency: "EUR",
            actorId: "SYS"
        });
        await recordCredit.execute({
            tenantId: "TENANT_2",
            bankId: "BANK_B",
            bankAccountId: "ACC_2",
            documentId: "DOC_CREDIT",
            amount: 50000,
            bankDate: "2024-02-15",
            actorId: "SYS"
        });
        const movementProjection = new read_models_1.BankMovementProjection();
        const movements = [];
        for (const event of events) {
            const movement = movementProjection.project(event);
            if (movement)
                movements.push(movement);
        }
        (0, vitest_1.expect)(movements.length).toBe(1);
        (0, vitest_1.expect)(movements[0].type).toBe("CREDIT");
        (0, vitest_1.expect)(movements[0].amount).toBe(50000);
    });
    /**
     * S-TB-03 — Multi-mouvements sur même compte
     */
    (0, vitest_1.it)("S-TB-03 — multi-mouvements sur même compte", async () => {
        const events = [];
        const eventStore = {
            append: async (e) => { events.push(e); }
        };
        const repo = {
            bankExists: async () => true,
            bankAccountExists: async () => true,
            documentExists: async () => true
        };
        const guardian = new BankGuardian_1.BankGuardian();
        const registerAccount = new handlers_1.RegisterBankAccountHandler(guardian, repo, eventStore);
        const recordDebit = new handlers_1.RecordBankDebitHandler(guardian, repo, eventStore);
        const recordCredit = new handlers_1.RecordBankCreditHandler(guardian, repo, eventStore);
        await registerAccount.execute({
            tenantId: "TENANT_3",
            bankId: "BANK_C",
            bankAccountId: "ACC_3",
            currency: "XOF",
            actorId: "SYS"
        });
        await recordCredit.execute({
            tenantId: "TENANT_3",
            bankId: "BANK_C",
            bankAccountId: "ACC_3",
            documentId: "DOC_C1",
            amount: 100000,
            bankDate: "2024-03-01",
            actorId: "SYS"
        });
        await recordDebit.execute({
            tenantId: "TENANT_3",
            bankId: "BANK_C",
            bankAccountId: "ACC_3",
            documentId: "DOC_D1",
            amount: 25000,
            bankDate: "2024-03-02",
            actorId: "SYS"
        });
        await recordDebit.execute({
            tenantId: "TENANT_3",
            bankId: "BANK_C",
            bankAccountId: "ACC_3",
            documentId: "DOC_D2",
            amount: 15000,
            bankDate: "2024-03-03",
            actorId: "SYS"
        });
        const movementProjection = new read_models_1.BankMovementProjection();
        const movements = [];
        for (const event of events) {
            const movement = movementProjection.project(event);
            if (movement)
                movements.push(movement);
        }
        (0, vitest_1.expect)(movements.length).toBe(3);
        const credits = movements.filter(m => m.type === "CREDIT");
        const debits = movements.filter(m => m.type === "DEBIT");
        (0, vitest_1.expect)(credits.length).toBe(1);
        (0, vitest_1.expect)(debits.length).toBe(2);
    });
});
//# sourceMappingURL=tresorerie-banque.e2e.spec.js.map