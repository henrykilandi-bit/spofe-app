"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.invariantDocumentCatalog = invariantDocumentCatalog;
const errors_js_1 = require("../../shared/errors.js");
function invariantDocumentCatalog(catalog) {
    for (const doc of catalog.documentTypes) {
        if (!doc.documentTypeCode) {
            throw new errors_js_1.GuardianViolation('G-P06 violation: documentTypeCode is mandatory');
        }
        if (doc.initialState !== 'DRAFT') {
            throw new errors_js_1.GuardianViolation('G-P06 violation: initial document state must be DRAFT');
        }
        if (doc.dependsOn) {
            throw new errors_js_1.GuardianViolation('G-P06 violation: document dependencies are forbidden');
        }
    }
}
//# sourceMappingURL=invariantDocumentCatalog.js.map