import { ParametersFrameProjection } from '../../src/read-models/projections/ParametersFrameProjection';
import { InMemoryParametersReadRepository } from '../../src/read-models/InMemoryParametersReadRepository';
import { validParametersFrame } from '../guardian/fixtures/validParametersFrame';

// Mock controller pour les tests E2E (sera remplacé par le vrai controller)
class ParametersReadController {
  constructor(private repository: InMemoryParametersReadRepository) {}

  async getActiveFrame() {
    return this.repository.getActiveFrame();
  }

  async getFrameByVersion(version: string) {
    return this.repository.getFrameByVersion(version);
  }

  async listFrames() {
    const frames = await this.repository.listFrames();
    return { frames };
  }
}

describe('E2E — Paramètres read-only', () => {

  test('E2E-01 — GET /parameters/active retourne le frame actif', async () => {
    const frame = validParametersFrame();
    const readModel = ParametersFrameProjection.project(frame);

    const repository = new InMemoryParametersReadRepository([readModel]);
    const controller = new ParametersReadController(repository);

    const result = await controller.getActiveFrame();

    expect(result).not.toBeNull();
    expect(result?.version).toBe('1.0.0');
    expect(result?.status).toBe('ACTIVE');
    expect(result?.identity.legalName).toBe('ACME SA');
  });

  test('E2E-02 — GET /parameters/:version retourne le bon frame', async () => {
    const frame = validParametersFrame();
    const readModel = ParametersFrameProjection.project(frame);

    const repository = new InMemoryParametersReadRepository([readModel]);
    const controller = new ParametersReadController(repository);

    const result = await controller.getFrameByVersion('1.0.0');

    expect(result).not.toBeNull();
    expect(result?.frameId).toBe('FRAME-001');
  });

  test('E2E-03 — GET /parameters/:version retourne null si absent', async () => {
    const repository = new InMemoryParametersReadRepository([]);
    const controller = new ParametersReadController(repository);

    const result = await controller.getFrameByVersion('9.9.9');

    expect(result).toBeNull();
  });

  test('E2E-04 — GET /parameters retourne la liste des frames', async () => {
    const frame = validParametersFrame();
    const readModel = ParametersFrameProjection.project(frame);

    const repository = new InMemoryParametersReadRepository([readModel]);
    const controller = new ParametersReadController(repository);

    const result = await controller.listFrames();

    expect(result.frames.length).toBe(1);
    expect(result.frames[0].version).toBe('1.0.0');
  });

  test('E2E-05 — aucune mutation possible via l\'API', async () => {
    const frame = validParametersFrame();
    const readModel = ParametersFrameProjection.project(frame);

    const repository = new InMemoryParametersReadRepository([readModel]);
    const controller = new ParametersReadController(repository);

    const result = await controller.getActiveFrame();

    expect(() => {
      (result as any).version = '2.0.0';
    }).not.toThrow();

    // Relire depuis le repo → inchangé
    const reread = await controller.getActiveFrame();
    expect(reread?.version).toBe('1.0.0');
  });

});
