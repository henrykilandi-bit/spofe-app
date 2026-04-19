"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateDocumentMetadataHandler = void 0;
class UpdateDocumentMetadataHandler {
    constructor(guardian) {
        this.guardian = guardian;
    }
    handle(cmd) {
        this.guardian.validate({ tenantId: cmd.tenantId, actorId: cmd.actorId }, {
            commandId: cmd.commandId,
            commandType: 'UPDATE_METADATA',
            tenantId: cmd.tenantId,
            documentId: cmd.documentId,
            metadata: cmd.metadata,
            analytics: cmd.analytics,
        });
        return {
            type: 'DocumentMetadataUpdated',
            payload: {
                tenantId: cmd.tenantId,
                documentId: cmd.documentId,
                metadata: cmd.metadata,
                analytics: cmd.analytics,
                occurredAt: new Date().toISOString(),
            },
        };
    }
}
exports.UpdateDocumentMetadataHandler = UpdateDocumentMetadataHandler;
//# sourceMappingURL=UpdateDocumentMetadataHandler.js.map