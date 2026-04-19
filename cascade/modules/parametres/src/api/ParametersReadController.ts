import { ParametersReadRepository } from '../read-models/ports/ParametersReadRepository.js';
import {
  ParametersFrameResponse,
  ParametersFramesListResponse
} from './types.js';

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
export class ParametersReadController {
  constructor(
    private readonly repository: ParametersReadRepository
  ) {}

  /**
   * GET /parameters/active
   * 
   * Retourne le ParametersFrame actuellement actif
   * Délégation directe sans aucune transformation
   */
  async getActiveFrame(): Promise<ParametersFrameResponse | null> {
    return this.repository.getActiveFrame();
  }

  /**
   * GET /parameters/:version
   * 
   * Retourne un ParametersFrame par version spécifique
   * Paramètre version passé directement au repository
   */
  async getFrameByVersion(
    version: string
  ): Promise<ParametersFrameResponse | null> {
    return this.repository.getFrameByVersion(version);
  }

  /**
   * GET /parameters
   * 
   * Liste tous les ParametersFrames (historique)
   * Encapsulation standard pour collection
   */
  async listFrames(): Promise<ParametersFramesListResponse> {
    const frames = await this.repository.listFrames();
    return { frames };
  }
}