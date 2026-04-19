"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SubmitForValidationHandler = void 0;
class SubmitForValidationHandler {
    constructor(guardian) {
        this.guardian = guardian;
    }
    handle(cmd) {
        this.guardian.validate({ tenantId: cmd.tenantId, actorId: cmd.actorId }, {
            commandId: cmd.commandId,
            commandType: 'SUBMIT_FOR_VALIDATION',
            tenantId: cmd.tenantId,
            documentId: cmd.documentId,
            status: cmd.currentStatus,
        });
        return {
            type: 'DocumentSubmitted',
            payload: {
                tenantId: cmd.tenantId,
                documentId: cmd.documentId,
                occurredAt: new Date().toISOString(),
            },
        };
    }
}
exports.SubmitForValidationHandler = SubmitForValidationHandler;
//# sourceMappingURL=SubmitForValidationHandler.js.map