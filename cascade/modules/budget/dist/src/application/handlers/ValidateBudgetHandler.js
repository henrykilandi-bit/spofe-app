"use strict";
// src/application/handlers/ValidateBudgetHandler.ts
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateBudgetHandler = void 0;
class ValidateBudgetHandler {
    constructor(guardian) {
        this.guardian = guardian;
    }
    handle(cmd) {
        this.guardian.validate({ tenantId: cmd.tenantId, actorId: cmd.actorId }, {
            commandId: cmd.commandId,
            commandType: 'VALIDATE',
            tenantId: cmd.tenantId,
            budgetId: cmd.budgetId,
            status: cmd.currentStatus,
        });
        return {
            type: 'BudgetValidated',
            payload: {
                tenantId: cmd.tenantId,
                budgetId: cmd.budgetId,
                occurredAt: new Date().toISOString(),
            },
        };
    }
}
exports.ValidateBudgetHandler = ValidateBudgetHandler;
//# sourceMappingURL=ValidateBudgetHandler.js.map