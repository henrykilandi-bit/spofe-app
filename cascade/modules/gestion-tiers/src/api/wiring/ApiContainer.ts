import {
  TierSummaryProjection,
  TierByStatusProjection,
  TierByRoleProjection,
  TierContactProjection,
  TierAuditProjection
} from '../../read-models';

import { TierController } from '../http/TierController';

export class ApiContainer {
  readonly tierController: TierController;

  constructor() {
    // Projections (singletons in-memory)
    const summary = new TierSummaryProjection();
    const byStatus = new TierByStatusProjection();
    const byRole = new TierByRoleProjection();
    const contacts = new TierContactProjection();
    const audit = new TierAuditProjection();

    // Controller
    this.tierController = new TierController(
      summary,
      byStatus,
      byRole,
      contacts,
      audit
    );
  }
}