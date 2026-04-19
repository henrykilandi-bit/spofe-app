import { ParametersReadRepository } from './ports/ParametersReadRepository.js';
import { ParametersFrameRM } from './types/ParametersFrameRM.js';
export declare class InMemoryParametersReadRepository implements ParametersReadRepository {
    private readonly frames;
    constructor(initialFrames?: ParametersFrameRM[]);
    getActiveFrame(): Promise<ParametersFrameRM | null>;
    getFrameByVersion(version: string): Promise<ParametersFrameRM | null>;
    listFrames(): Promise<ParametersFrameRM[]>;
}
//# sourceMappingURL=InMemoryParametersReadRepository.d.ts.map