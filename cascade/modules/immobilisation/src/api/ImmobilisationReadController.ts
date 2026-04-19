// src/api/ImmobilisationReadController.ts
import { ApiRequest, ApiResponse } from './types';
import { ImmobilisationReadRepository } from '../read-models/ports/ImmobilisationReadRepository';
import { ImmobilisationRM } from '../read-models/types';

export class ImmobilisationReadController {
  constructor(
    private readonly repo: ImmobilisationReadRepository
  ) {}

  async getAll(
    req: ApiRequest
  ): Promise<ApiResponse<ImmobilisationRM[]>> {
    const data = await this.repo.getAll(req.tenantId);
    return { status: 200, body: data };
  }

  async getById(
    req: ApiRequest
  ): Promise<ApiResponse<ImmobilisationRM | null>> {
    const id = req.params?.id;
    if (!id) {
      return { status: 400, body: null };
    }

    const item = await this.repo.getById(
      req.tenantId,
      id
    );

    if (!item) {
      return { status: 404, body: null };
    }

    return { status: 200, body: item };
  }

  async getInService(
    req: ApiRequest
  ): Promise<ApiResponse<ImmobilisationRM[]>> {
    const data = await this.repo.getInService(req.tenantId);
    return { status: 200, body: data };
  }

  async getDisposed(
    req: ApiRequest
  ): Promise<ApiResponse<ImmobilisationRM[]>> {
    const data = await this.repo.getDisposed(req.tenantId);
    return { status: 200, body: data };
  }

  async getByCategory(
    req: ApiRequest
  ): Promise<ApiResponse<ImmobilisationRM[]>> {
    const category = req.query?.category as
      | 'CORPORELLE'
      | 'INCORPORELLE'
      | 'FINANCIERE'
      | undefined;

    if (!category) {
      return { status: 400, body: [] };
    }

    const data = await this.repo.getByCategory(
      req.tenantId,
      category
    );

    return { status: 200, body: data };
  }
}
