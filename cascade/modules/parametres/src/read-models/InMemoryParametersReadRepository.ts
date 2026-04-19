import { ParametersReadRepository } from './ports/ParametersReadRepository.js';
import { ParametersFrameRM } from './types/ParametersFrameRM.js';

export class InMemoryParametersReadRepository
  implements ParametersReadRepository
{
  private readonly frames: ParametersFrameRM[];

  constructor(initialFrames: ParametersFrameRM[] = []) {
    this.frames = initialFrames.map((frame) => this.cloneFrame(frame));
  }

  async getActiveFrame(): Promise<ParametersFrameRM | null> {
    const frame = this.frames.find((f) => f.status === 'ACTIVE') ?? null;
    return frame ? this.cloneFrame(frame) : null;
  }

  async getFrameByVersion(
    version: string
  ): Promise<ParametersFrameRM | null> {
    const frame = this.frames.find((f) => f.version === version) ?? null;
    return frame ? this.cloneFrame(frame) : null;
  }

  async listFrames(): Promise<ParametersFrameRM[]> {
    return this.frames.map((frame) => this.cloneFrame(frame));
  }

  private cloneFrame(frame: ParametersFrameRM): ParametersFrameRM {
    return JSON.parse(JSON.stringify(frame)) as ParametersFrameRM;
  }
}
