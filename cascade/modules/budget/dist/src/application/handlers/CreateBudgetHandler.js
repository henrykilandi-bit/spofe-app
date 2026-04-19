"use strict";
// src/application/handlers/CreateBudgetHandler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateBudgetHandler = void 0;
class CreateBudgetHandler {
    constructor(guardian) {
        this.guardian = guardian;
    }
    handle(cmd) {
        this.guardian.validate({ tenantId: cmd.tenantId, actorId: cmd.actorId }, {
            commandId: cmd.commandId,
            commandType: 'CREATE',
            tenantId: cmd.tenantId,
            budgetId: cmd.budgetId,
            budgetType: cmd.budgetType,
            status: 'DRAFT',
            periodFrom: cmd.periodFrom,
            periodTo: cmd.periodTo,
            hypotheses: cmd.hypotheses,
            lines: cmd.lines,
        });
        return {
            type: 'BudgetCreated',
            payload: {
                tenantId: cmd.tenantId,
                budgetId: cmd.budgetId,
                budgetType: cmd.budgetType,
                periodFrom: cmd.periodFrom,
                periodTo: cmd.periodTo,
                occurredAt: new Date().toISOString(),
            },
        };
    }
}
exports.CreateBudgetHandler = CreateBudgetHandler;
//# sourceMappingURL=CreateBudgetHandler.js.map