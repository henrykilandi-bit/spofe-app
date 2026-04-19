"use strict";
// src/application/handlers/CloseBudgetHandler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.CloseBudgetHandler = void 0;
class CloseBudgetHandler {
    constructor(guardian) {
        this.guardian = guardian;
    }
    handle(cmd) {
        this.guardian.validate({ tenantId: cmd.tenantId, actorId: cmd.actorId }, {
            commandId: cmd.commandId,
            commandType: 'CLOSE',
            tenantId: cmd.tenantId,
            budgetId: cmd.budgetId,
            status: cmd.currentStatus,
        });
        return {
            type: 'BudgetClosed',
            payload: {
                tenantId: cmd.tenantId,
                budgetId: cmd.budgetId,
                occurredAt: new Date().toISOString(),
            },
        };
    }
}
exports.CloseBudgetHandler = CloseBudgetHandler;
//# sourceMappingURL=CloseBudgetHandler.js.map