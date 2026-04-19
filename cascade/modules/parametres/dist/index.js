"use strict";
/**
 * 📋 Module Paramètres - Point d'Entrée Principal
 *
 * Module constitutionnel SPOFE fournissant les cadres normatifs
 * pour tous les autres modules métier.
 *
 * Version : 1.0.0
 * Gouvernance : SPOFE P0 - Constitutional
 * Type : Socle normatif transverse
 * Mode : READ_ONLY_PROVIDER
 */
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
exports.PARAMETRES_MODULE = void 0;
// API - Couche d'exposition READ-ONLY
__exportStar(require("./api/index.js"), exports);
// Guardian - Constitution métier
__exportStar(require("./guardian/index.js"), exports);
// Read Models - Modèles de consultation
__exportStar(require("./read-models/index.js"), exports);
// Shared - Éléments communs
__exportStar(require("./shared/errors.js"), exports);
__exportStar(require("./shared/identifiers.js"), exports);
// Module metadata
exports.PARAMETRES_MODULE = {
    name: 'parametres',
    version: '1.0.0',
    governance: 'SPOFE P0 - Constitutional',
    type: 'Socle normatif transverse',
    mode: 'READ_ONLY_PROVIDER',
    status: 'READY_FOR_CERTIFICATION'
};
//# sourceMappingURL=index.js.map