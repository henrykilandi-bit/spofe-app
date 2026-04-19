"use strict";
// src/guardian/BudgetGuardian.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.BudgetGuardian = void 0;
const GuardianError_1 = require("./GuardianError");
class BudgetGuardian {
    validate(ctx, cmd) {
        this.assertTenantIsolation(ctx, cmd); // B-01
        this.assertActor(ctx); // B-02
        this.assertPeriods(cmd); // B-12
        this.assertCompleteness(cmd); // B-03
        this.assertHypotheses(cmd); // B-04
        this.assertAppendOnly(cmd); // B-05
        this.assertStatusTransitions(cmd); // B-06
        this.assertCertifiedSources(cmd); // B-07
        this.assertNoForbiddenLogic(cmd); // B-08..B-11
    }
    // ---------------- Invariants ----------------
    assertTenantIsolation(ctx, cmd) {
        if (ctx.tenantId !== cmd.tenantId) {
            throw new GuardianError_1.GuardianError('B-01: Cross-tenant command rejected');
        }
    }
    assertActor(ctx) {
        if (!ctx.actorId) {
            throw new GuardianError_1.GuardianError('B-02: actorId is mandatory');
        }
    }
    assertPeriods(cmd) {
        if (cmd.commandType === 'CREATE' || cmd.commandType === 'UPDATE') {
            if (!cmd.periodFrom || !cmd.periodTo) {
                throw new GuardianError_1.GuardianError('B-12: Budget period is mandatory');
            }
            if (cmd.periodFrom > cmd.periodTo) {
                throw new GuardianError_1.GuardianError('B-12: Invalid budget period range');
            }
        }
    }
    assertCompleteness(cmd) {
        if (!cmd.budgetId) {
            throw new GuardianError_1.GuardianError('B-03: BudgetId is mandatory');
        }
        if (cmd.commandType === 'CREATE') {
            if (!cmd.budgetType || !cmd.periodFrom || !cmd.periodTo) {
                throw new GuardianError_1.GuardianError('B-03: BudgetType and periods are required on creation');
            }
            if (!cmd.hypotheses || cmd.hypotheses.length === 0) {
                throw new GuardianError_1.GuardianError('B-03: Hypotheses required on creation');
            }
            if (!cmd.lines || cmd.lines.length === 0) {
                throw new GuardianError_1.GuardianError('B-03: Budget lines required on creation');
            }
        }
    }
    assertHypotheses(cmd) {
        if (!cmd.hypotheses)
            return;
        cmd.hypotheses.forEach((h) => {
            if (!h.key || h.value === undefined) {
                throw new GuardianError_1.GuardianError('B-04: Invalid hypothesis');
            }
        });
    }
    assertAppendOnly(cmd) {
        if ((cmd.commandType === 'UPDATE' ||
            cmd.commandType === 'VALIDATE' ||
            cmd.commandType === 'CLOSE') &&
            !cmd.commandId) {
            throw new GuardianError_1.GuardianError('B-05: Append-only commandId required');
        }
    }
    assertStatusTransitions(cmd) {
        if (cmd.commandType === 'VALIDATE' && cmd.status !== 'DRAFT') {
            throw new GuardianError_1.GuardianError('B-06: Only DRAFT budget can be validated');
        }
        if (cmd.commandType === 'CLOSE' && cmd.status !== 'VALIDATED') {
            throw new GuardianError_1.GuardianError('B-06: Only VALIDATED budget can be closed');
        }
    }
    assertCertifiedSources(cmd) {
        if (!cmd.hypotheses)
            return;
        cmd.hypotheses.forEach(h => {
            if (h.sourceModule &&
                !['COST_STRUCTURE', 'AMORTIZATION', 'STOCK', 'SALES'].includes(h.sourceModule)) {
                throw new GuardianError_1.GuardianError('B-07: Hypothesis source module not certified');
            }
        });
    }
    assertNoForbiddenLogic(cmd) {
        const forbidden = [
            'unitCost',
            'quantity',
            'accountingEntry',
            'taxImpact',
            'decision',
            'arbitration',
        ];
        forbidden.forEach(f => {
            if (cmd[f] !== undefined) {
                throw new GuardianError_1.GuardianError('B-08..B-11: Forbidden logic detected in Budget');
            }
        });
        if (cmd.lines) {
            cmd.lines.forEach((l) => {
                if (l.amount < 0) {
                    throw new GuardianError_1.GuardianError('B-03: Budget line amount must be >= 0');
                }
            });
        }
    }
}
exports.BudgetGuardian = BudgetGuardian;
//# sourceMappingURL=BudgetGuardian.js.map