"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RejectDocumentHandler = void 0;
class RejectDocumentHandler {
    constructor(guardian) {
        this.guardian = guardian;
    }
    handle(cmd) {
        this.guardian.validate({ tenantId: cmd.tenantId, actorId: cmd.actorId }, {
            commandId: cmd.commandId,
            commandType: 'REJECT_DOCUMENT',
            tenantId: cmd.tenantId,
            documentId: cmd.documentId,
            status: cmd.currentStatus,
        });
        return {
            type: 'DocumentRejected',
            payload: {
                tenantId: cmd.tenantId,
                documentId: cmd.documentId,
                reason: cmd.reason,
                occurredAt: new Date().toISOString(),
            },
        };
    }
}
exports.RejectDocumentHandler = RejectDocumentHandler;
//# sourceMappingURL=RejectDocumentHandler.js.map