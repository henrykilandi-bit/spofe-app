"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InMemoryParametersReadRepository = void 0;
class InMemoryParametersReadRepository {
    constructor(initialFrames = []) {
        this.frames = [...initialFrames];
    }
    async getActiveFrame() {
        return (this.frames.find((f) => f.status === 'ACTIVE') ?? null);
    }
    async getFrameByVersion(version) {
        return (this.frames.find((f) => f.version === version) ?? null);
    }
    async listFrames() {
        return [...this.frames];
    }
}
exports.InMemoryParametersReadRepository = InMemoryParametersReadRepository;
//# sourceMappingURL=InMemoryParametersReadRepository.js.map