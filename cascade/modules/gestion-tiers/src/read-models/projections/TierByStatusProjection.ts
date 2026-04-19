import { TierEvent } from '../../domain/events/TierEvents';
import { TierByStatusView } from '../models/TierByStatusView';
import { isProjectionEligibleEvent } from './projectionGuards';

export class TierByStatusProjection {
  private readonly store = new Map<string, TierByStatusView>();

  apply(event: TierEvent): void {
    if (!isProjectionEligibleEvent(event)) {
      return;
    }

    const key = `${event.tenantId}:${event.tierId}`;

    if (event.type === 'TierCreated') {
      this.store.set(key, {
        tenantId: event.tenantId,
        tierId: event.tierId,
        status: 'ACTIVE',
        roles: []
      });
    }

    const current = this.store.get(key);
    if (!current) return;

    if (event.type === 'TierSuspended') current.status = 'SUSPENDED';
    if (event.type === 'TierArchived') current.status = 'ARCHIVED';
  }

  getAll(): TierByStatusView[] {
    return Array.from(this.store.values());
  }
}
