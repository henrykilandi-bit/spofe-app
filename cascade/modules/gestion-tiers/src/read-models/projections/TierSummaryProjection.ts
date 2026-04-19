import { TierEvent } from '../../domain/events/TierEvents';
import { TierSummaryView } from '../models/TierSummaryView';

export class TierSummaryProjection {
  private readonly store = new Map<string, TierSummaryView>();

  apply(event: TierEvent): void {
    const key = `${event.tenantId}:${event.tierId}`;
    const now = event.timestamp;

    if (event.type === 'TierCreated') {
      this.store.set(key, {
        tenantId: event.tenantId,
        tierId: event.tierId,
        status: 'ACTIVE',
        roles: [],
        createdAt: now,
        updatedAt: now
      });
    }

    const current = this.store.get(key);
    if (!current) return;

    if (event.type === 'TierUpdated') {
      current.updatedAt = now;
    }

    if (event.type === 'TierSuspended') {
      current.status = 'SUSPENDED';
      current.updatedAt = now;
    }

    if (event.type === 'TierArchived') {
      current.status = 'ARCHIVED';
      current.updatedAt = now;
    }
  }

  getAll(): TierSummaryView[] {
    return Array.from(this.store.values());
  }

  getById(tenantId: string, tierId: string): TierSummaryView | undefined {
    return this.store.get(`${tenantId}:${tierId}`);
  }
}