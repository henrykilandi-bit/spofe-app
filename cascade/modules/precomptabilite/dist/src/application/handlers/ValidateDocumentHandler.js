"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValidateDocumentHandler = void 0;
class ValidateDocumentHandler {
    constructor(guardian) {
        this.guardian = guardian;
    }
    handle(cmd) {
        this.guardian.validate({ tenantId: cmd.tenantId, actorId: cmd.actorId }, {
            commandId: cmd.commandId,
            commandType: 'VALIDATE_DOCUMENT',
            tenantId: cmd.tenantId,
            documentId: cmd.documentId,
            status: cmd.currentStatus,
        });
        return {
            type: 'DocumentValidated',
            payload: {
                tenantId: cmd.tenantId,
                documentId: cmd.documentId,
                occurredAt: new Date().toISOString(),
            },
        };
    }
}
exports.ValidateDocumentHandler = ValidateDocumentHandler;
//# sourceMappingURL=ValidateDocumentHandler.js.map