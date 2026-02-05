import { ApiRequest, ApiResponse, extractTenantId } from './types';
import { IndicatorsReadRepository } from '../read-models/ports';

export class IndicatorsReadController {
  constructor(
    private readonly repo: IndicatorsReadRepository
  ) {}

  async getAll(req: ApiRequest): Promise<ApiResponse> {
    const tenantId = extractTenantId(req);
    const data = await this.repo.getAll(tenantId);

    return { status: 200, body: data };
  }

  async getById(req: ApiRequest): Promise<ApiResponse> {
    const tenantId = extractTenantId(req);
    const id = req.params['indicatorId'];

    if (!id) {
      return { status: 400, body: 'indicatorId is required' };
    }

    const result = await this.repo.getById(tenantId, id);

    if (!result) {
      return { status: 404, body: 'Indicator not found' };
    }

    return { status: 200, body: result };
  }

  async getByObjective(req: ApiRequest): Promise<ApiResponse> {
    const tenantId = extractTenantId(req);
    const objectiveId = req.query['objectiveId'];

    if (!objectiveId) {
      return { status: 400, body: 'objectiveId is required' };
    }

    const data = await this.repo.getByObjective(
      tenantId,
      objectiveId
    );

    return { status: 200, body: data };
  }
}