"use strict";
// src/application/handlers/UpdateBudgetHandler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBudgetHandler = void 0;
class UpdateBudgetHandler {
    constructor(guardian) {
        this.guardian = guardian;
    }
    handle(cmd) {
        this.guardian.validate({ tenantId: cmd.tenantId, actorId: cmd.actorId }, {
            commandId: cmd.commandId,
            commandType: 'UPDATE',
            tenantId: cmd.tenantId,
            budgetId: cmd.budgetId,
        });
        return {
            type: 'BudgetUpdated',
            payload: {
                tenantId: cmd.tenantId,
                budgetId: cmd.budgetId,
                occurredAt: new Date().toISOString(),
            },
        };
    }
}
exports.UpdateBudgetHandler = UpdateBudgetHandler;
//# sourceMappingURL=UpdateBudgetHandler.js.map