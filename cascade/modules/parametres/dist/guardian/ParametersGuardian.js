"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametersGuardian = void 0;
const invariantActiveFrame_js_1 = require("./invariants/invariantActiveFrame.js");
const invariantAppendOnly_js_1 = require("./invariants/invariantAppendOnly.js");
const invariantPassiveOnly_js_1 = require("./invariants/invariantPassiveOnly.js");
const invariantStatesNormed_js_1 = require("./invariants/invariantStatesNormed.js");
const invariantDocumentCatalog_js_1 = require("./invariants/invariantDocumentCatalog.js");
const invariantRolesCapabilities_js_1 = require("./invariants/invariantRolesCapabilities.js");
class ParametersGuardian {
    static validateNewFrame(existingFrames, candidate) {
        (0, invariantAppendOnly_js_1.invariantAppendOnly)(false);
        (0, invariantActiveFrame_js_1.invariantSingleActiveFrame)(existingFrames, candidate);
        (0, invariantPassiveOnly_js_1.invariantPassiveOnly)(candidate);
        (0, invariantStatesNormed_js_1.invariantStatesNormed)(candidate.statesCatalog);
        (0, invariantDocumentCatalog_js_1.invariantDocumentCatalog)(candidate.documentsCatalog);
        (0, invariantRolesCapabilities_js_1.invariantRolesCapabilities)(candidate.rolesCatalog);
    }
    /**
     * Compatibilité tests - valide un frame sans contexte d'historique
     */
    static validateFrame(candidate) {
        return this.validateNewFrame([], candidate);
    }
}
exports.ParametersGuardian = ParametersGuardian;
//# sourceMappingURL=ParametersGuardian.js.map