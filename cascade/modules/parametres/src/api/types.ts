import { ParametersFrameRM } from '../read-models/types/ParametersFrameRM.js';

/**
 * Réponse API pour un ParametersFrame unique
 * Mapping direct du read-model sans transformation
 */
export type ParametersFrameResponse = ParametersFrameRM;

/**
 * Réponse API pour la liste des ParametersFrames
 * Encapsulation standard pour les collections
 */
export type ParametersFramesListResponse = {
  frames: ParametersFrameRM[];
};