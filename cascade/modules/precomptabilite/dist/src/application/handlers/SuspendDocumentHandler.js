"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SuspendDocumentHandler = void 0;
class SuspendDocumentHandler {
    constructor(guardian) {
        this.guardian = guardian;
    }
    handle(cmd) {
        this.guardian.validate({ tenantId: cmd.tenantId, actorId: cmd.actorId }, {
            commandId: cmd.commandId,
            commandType: 'SUSPEND_DOCUMENT',
            tenantId: cmd.tenantId,
            documentId: cmd.documentId,
            status: cmd.currentStatus,
        });
        return {
            type: 'DocumentSuspended',
            payload: {
                tenantId: cmd.tenantId,
                documentId: cmd.documentId,
                reason: cmd.reason,
                occurredAt: new Date().toISOString(),
            },
        };
    }
}
exports.SuspendDocumentHandler = SuspendDocumentHandler;
//# sourceMappingURL=SuspendDocumentHandler.js.map