import { ParametersFrame } from './types/ParametersFrame.js';
export declare class ParametersGuardian {
    static validateNewFrame(existingFrames: ParametersFrame[], candidate: ParametersFrame): void;
    /**
     * Compatibilité tests - valide un frame sans contexte d'historique
     */
    static validateFrame(candidate: ParametersFrame): void;
}
//# sourceMappingURL=ParametersGuardian.d.ts.map