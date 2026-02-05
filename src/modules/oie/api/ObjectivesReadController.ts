import { ApiRequest, ApiResponse, extractTenantId } from './types';
import { ObjectivesReadRepository } from '../read-models/ports';

export class ObjectivesReadController {
  constructor(
    private readonly repo: ObjectivesReadRepository
  ) {}

  async getAll(req: ApiRequest): Promise<ApiResponse> {
    const tenantId = extractTenantId(req);
    const data = await this.repo.getAll(tenantId);

    return { status: 200, body: data };
  }

  async getById(req: ApiRequest): Promise<ApiResponse> {
    const tenantId = extractTenantId(req);
    const id = req.params['objectiveId'];

    if (!id) {
      return { status: 400, body: 'objectiveId is required' };
    }

    const result = await this.repo.getById(tenantId, id);

    if (!result) {
      return { status: 404, body: 'Objective not found' };
    }

    return { status: 200, body: result };
  }

  async getByPeriod(req: ApiRequest): Promise<ApiResponse> {
    const tenantId = extractTenantId(req);
    const periodId = req.query['periodId'];

    if (!periodId) {
      return { status: 400, body: 'periodId is required' };
    }

    const data = await this.repo.getByPeriod(tenantId, periodId);
    return { status: 200, body: data };
  }
}