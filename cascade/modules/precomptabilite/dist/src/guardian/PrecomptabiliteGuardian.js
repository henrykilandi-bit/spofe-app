"use strict";
// src/guardian/PrecomptabiliteGuardian.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.PrecomptabiliteGuardian = void 0;
const GuardianError_1 = require("./GuardianError");
class PrecomptabiliteGuardian {
    validate(ctx, cmd) {
        this.assertTenantIsolation(ctx, cmd); // P-01
        this.assertActor(ctx); // P-02
        this.assertDocumentIdentity(cmd); // P-03
        this.assertAppendOnly(cmd); // P-04
        this.assertWorkflow(cmd); // P-05, P-06
        this.assertFactOnlyFields(cmd); // P-07
        this.assertNoForbiddenLogic(cmd); // P-08..P-10
        this.assertTraceability(cmd); // P-11
    }
    // ---------------- Invariants ----------------
    assertTenantIsolation(ctx, cmd) {
        if (ctx.tenantId !== cmd.tenantId) {
            throw new GuardianError_1.GuardianError('P-01: Cross-tenant command rejected');
        }
    }
    assertActor(ctx) {
        if (!ctx.actorId) {
            throw new GuardianError_1.GuardianError('P-02: actorId is mandatory');
        }
    }
    assertDocumentIdentity(cmd) {
        if (!cmd.documentId) {
            throw new GuardianError_1.GuardianError('P-03: documentId is mandatory');
        }
        if (cmd.commandType === 'CREATE_DOCUMENT' && !cmd.documentType) {
            throw new GuardianError_1.GuardianError('P-03: documentType is required on creation');
        }
    }
    assertAppendOnly(cmd) {
        if (!cmd.commandId) {
            throw new GuardianError_1.GuardianError('P-04: commandId required (append-only)');
        }
    }
    assertWorkflow(cmd) {
        const status = cmd.status;
        if (cmd.commandType === 'SUBMIT_FOR_VALIDATION' && status !== 'DRAFT') {
            throw new GuardianError_1.GuardianError('P-06: Only DRAFT document can be submitted');
        }
        if (cmd.commandType === 'VALIDATE_DOCUMENT' && status !== 'SUBMITTED') {
            throw new GuardianError_1.GuardianError('P-06: Only SUBMITTED document can be validated');
        }
        if (cmd.commandType === 'REJECT_DOCUMENT' && status !== 'SUBMITTED') {
            throw new GuardianError_1.GuardianError('P-06: Only SUBMITTED document can be rejected');
        }
        if (cmd.commandType === 'SUSPEND_DOCUMENT' && status === 'VALIDATED') {
            throw new GuardianError_1.GuardianError('P-06: VALIDATED document cannot be suspended');
        }
    }
    assertFactOnlyFields(cmd) {
        if (cmd.metadata) {
            if (cmd.metadata.amount !== undefined &&
                cmd.metadata.amount < 0) {
                throw new GuardianError_1.GuardianError('P-07: Document amount must be >= 0');
            }
        }
    }
    assertNoForbiddenLogic(cmd) {
        const forbidden = [
            'accountingEntry',
            'journal',
            'taxCalculation',
            'paymentOrder',
            'decision',
            'autoApproval',
        ];
        forbidden.forEach(f => {
            if (cmd[f] !== undefined) {
                throw new GuardianError_1.GuardianError('P-08..P-10: Forbidden logic detected in Precomptabilite');
            }
        });
    }
    assertTraceability(cmd) {
        if (!cmd.commandType) {
            throw new GuardianError_1.GuardianError('P-11: commandType required');
        }
    }
}
exports.PrecomptabiliteGuardian = PrecomptabiliteGuardian;
//# sourceMappingURL=PrecomptabiliteGuardian.js.map