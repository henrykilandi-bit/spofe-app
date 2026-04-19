"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParametersReadController = void 0;
/**
 * Contrôleur API READ-ONLY du module Paramètres
 *
 * PRINCIPES SPOFE :
 * - Transport uniquement, zéro logique métier
 * - Délégation stricte au Read Repository
 * - Aucune validation, aucune transformation
 * - Compatible AST READ-ONLY enforcement
 * - HTTP GET uniquement
 */
class ParametersReadController {
    constructor(repository) {
        this.repository = repository;
    }
    /**
     * GET /parameters/active
     *
     * Retourne le ParametersFrame actuellement actif
     * Délégation directe sans aucune transformation
     */
    async getActiveFrame() {
        return this.repository.getActiveFrame();
    }
    /**
     * GET /parameters/:version
     *
     * Retourne un ParametersFrame par version spécifique
     * Paramètre version passé directement au repository
     */
    async getFrameByVersion(version) {
        return this.repository.getFrameByVersion(version);
    }
    /**
     * GET /parameters
     *
     * Liste tous les ParametersFrames (historique)
     * Encapsulation standard pour collection
     */
    async listFrames() {
        const frames = await this.repository.listFrames();
        return { frames };
    }
}
exports.ParametersReadController = ParametersReadController;
//# sourceMappingURL=ParametersReadController.js.map