import { ApiRequest, ApiResponse, extractTenantId } from './types';
import { EventsReadRepository } from '../read-models/ports';

export class EventsReadController {
  constructor(
    private readonly repo: EventsReadRepository
  ) {}

  async getAll(req: ApiRequest): Promise<ApiResponse> {
    const tenantId = extractTenantId(req);
    const data = await this.repo.getAll(tenantId);

    return { status: 200, body: data };
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

  async getByPeriod(req: ApiRequest): Promise<ApiResponse> {
    const tenantId = extractTenantId(req);
    const periodId = req.query['periodId'];

    if (!periodId) {
      return { status: 400, body: 'periodId is required' };
    }

    const data = await this.repo.getByPeriod(
      tenantId,
      periodId
    );

    return { status: 200, body: data };
  }
}