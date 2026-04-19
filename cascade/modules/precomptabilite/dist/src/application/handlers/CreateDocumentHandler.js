"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateDocumentHandler = void 0;
class CreateDocumentHandler {
    constructor(guardian) {
        this.guardian = guardian;
    }
    handle(cmd) {
        this.guardian.validate({ tenantId: cmd.tenantId, actorId: cmd.actorId }, {
            commandId: cmd.commandId,
            commandType: 'CREATE_DOCUMENT',
            tenantId: cmd.tenantId,
            documentId: cmd.documentId,
            documentType: cmd.documentType,
        });
        return {
            type: 'DocumentCreated',
            payload: {
                tenantId: cmd.tenantId,
                documentId: cmd.documentId,
                documentType: cmd.documentType,
                occurredAt: new Date().toISOString(),
            },
        };
    }
}
exports.CreateDocumentHandler = CreateDocumentHandler;
//# sourceMappingURL=CreateDocumentHandler.js.map