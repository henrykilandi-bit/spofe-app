import { ParametersFrameRM } from '../types/ParametersFrameRM.js';

export interface ParametersReadRepository {
  /**
   * Retourne le ParametersFrame actif
   */
  getActiveFrame(): Promise<ParametersFrameRM | null>;

  /**
   * Retourne un ParametersFrame par version
   */
  getFrameByVersion(version: string): Promise<ParametersFrameRM | null>;

  /**
   * Liste tous les frames (historique)
   */
  listFrames(): Promise<ParametersFrameRM[]>;
}
