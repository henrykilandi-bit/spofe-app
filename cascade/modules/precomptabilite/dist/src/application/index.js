"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./commands/CreateDocumentCommand"), exports);
__exportStar(require("./commands/UpdateDocumentMetadataCommand"), exports);
__exportStar(require("./commands/SubmitForValidationCommand"), exports);
__exportStar(require("./commands/ValidateDocumentCommand"), exports);
__exportStar(require("./commands/RejectDocumentCommand"), exports);
__exportStar(require("./commands/SuspendDocumentCommand"), exports);
__exportStar(require("./events/DocumentCreated"), exports);
__exportStar(require("./events/DocumentMetadataUpdated"), exports);
__exportStar(require("./events/DocumentSubmitted"), exports);
__exportStar(require("./events/DocumentValidated"), exports);
__exportStar(require("./events/DocumentRejected"), exports);
__exportStar(require("./events/DocumentSuspended"), exports);
__exportStar(require("./handlers/CreateDocumentHandler"), exports);
__exportStar(require("./handlers/UpdateDocumentMetadataHandler"), exports);
__exportStar(require("./handlers/SubmitForValidationHandler"), exports);
__exportStar(require("./handlers/ValidateDocumentHandler"), exports);
__exportStar(require("./handlers/RejectDocumentHandler"), exports);
__exportStar(require("./handlers/SuspendDocumentHandler"), exports);
//# sourceMappingURL=index.js.map