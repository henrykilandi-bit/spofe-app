import { ParametersReadRepository } from '../read-models/ports/ParametersReadRepository.js';
import { ParametersFrameResponse, ParametersFramesListResponse } from './types.js';
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
export declare class ParametersReadController {
    private readonly repository;
    constructor(repository: ParametersReadRepository);
    /**
     * GET /parameters/active
     *
     * Retourne le ParametersFrame actuellement actif
     * Délégation directe sans aucune transformation
     */
    getActiveFrame(): Promise<ParametersFrameResponse | null>;
    /**
     * GET /parameters/:version
     *
     * Retourne un ParametersFrame par version spécifique
     * Paramètre version passé directement au repository
     */
    getFrameByVersion(version: string): Promise<ParametersFrameResponse | null>;
    /**
     * GET /parameters
     *
     * Liste tous les ParametersFrames (historique)
     * Encapsulation standard pour collection
     */
    listFrames(): Promise<ParametersFramesListResponse>;
}
//# sourceMappingURL=ParametersReadController.d.ts.map