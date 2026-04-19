import { HttpRequest, HttpResponse } from './HttpTypes';
import {
  TierSummaryProjection,
  TierByStatusProjection,
  TierByRoleProjection,
  TierContactProjection,
  TierAuditProjection
} from '../../read-models';

export class TierController {
  constructor(
    private readonly summary: TierSummaryProjection,
    private readonly byStatus: TierByStatusProjection,
    private readonly byRole: TierByRoleProjection,
    private readonly contacts: TierContactProjection,
    private readonly audit: TierAuditProjection
  ) {}

  getTier(req: HttpRequest): HttpResponse {
    const { tierId } = req.params;
    const tier = tierId
      ? this.summary.getById(req.tenantId, tierId)
      : undefined;

    if (!tier) {
      return { status: 404, body: { message: 'Tier not found' } };
    }

    return { status: 200, body: tier };
  }

  listTiers(req: HttpRequest): HttpResponse {
    const { status } = req.query;

    const tiers =
      status
        ? this.byStatus.getAll().filter(
            t => t.tenantId === req.tenantId && t.status === status
          )
        : this.summary
            .getAll()
            .filter(t => t.tenantId === req.tenantId);

    return { status: 200, body: tiers };
  }

  getTierContacts(req: HttpRequest): HttpResponse {
    const { tierId } = req.params;
    if (!tierId) {
      return { status: 400, body: { message: 'tierId required' } };
    }

    const view = this.contacts.getByTier(req.tenantId, tierId);
    return { status: 200, body: view ?? {} };
  }

  getTierAudit(req: HttpRequest): HttpResponse {
    const { tierId } = req.params;
    if (!tierId) {
      return { status: 400, body: { message: 'tierId required' } };
    }

    const events = this.audit.getByTier(req.tenantId, tierId);
    return { status: 200, body: events };
  }

  getTierStatus(req: HttpRequest): HttpResponse {
    const { tierId } = req.params;
    if (!tierId) {
      return { status: 400, body: { message: 'tierId required' } };
    }

    const tier = this.summary.getById(req.tenantId, tierId);
    if (!tier) {
      return { status: 404, body: { message: 'Tier not found' } };
    }

    return {
      status: 200,
      body: { tierId, status: tier.status }
    };
  }

  tierExists(req: HttpRequest): HttpResponse {
    const { tierId } = req.params;
    if (!tierId) {
      return { status: 400, body: { exists: false } };
    }

    const exists = Boolean(
      this.summary.getById(req.tenantId, tierId)
    );

    return { status: 200, body: { exists } };
  }
}