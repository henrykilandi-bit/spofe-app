"use strict";
/**
 * 🏷️ Shared Identifiers - Identifiants du Module Paramètres
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleCode = exports.DocumentTypeCode = exports.FrameId = void 0;
class FrameId {
    constructor(value) {
        this.value = value;
        if (!value || value.trim().length === 0) {
            throw new Error('FrameId ne peut pas être vide');
        }
    }
    getValue() {
        return this.value;
    }
    equals(other) {
        return this.value === other.getValue();
    }
    toString() {
        return this.value;
    }
}
exports.FrameId = FrameId;
class DocumentTypeCode {
    constructor(value) {
        this.value = value;
        if (!value || value.trim().length === 0) {
            throw new Error('DocumentTypeCode ne peut pas être vide');
        }
    }
    getValue() {
        return this.value;
    }
    equals(other) {
        return this.value === other.getValue();
    }
    toString() {
        return this.value;
    }
}
exports.DocumentTypeCode = DocumentTypeCode;
class RoleCode {
    constructor(value) {
        this.value = value;
        if (!value || value.trim().length === 0) {
            throw new Error('RoleCode ne peut pas être vide');
        }
    }
    getValue() {
        return this.value;
    }
    equals(other) {
        return this.value === other.getValue();
    }
    toString() {
        return this.value;
    }
}
exports.RoleCode = RoleCode;
//# sourceMappingURL=identifiers.js.map