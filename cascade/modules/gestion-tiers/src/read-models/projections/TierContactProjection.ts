import { TierEvent } from '../../domain/events/TierEvents';
import { TierContactView } from '../models/TierContactView';

export class TierContactProjection {
  private readonly store = new Map<string, TierContactView>();

  apply(event: TierEvent): void {
    if (event.type !== 'TierCreated') return;

    this.store.set(`${event.tenantId}:${event.tierId}`, {
      tenantId: event.tenantId,
      tierId: event.tierId
    });
  }

  getByTier(tenantId: string, tierId: string): TierContactView | undefined {
    return this.store.get(`${tenantId}:${tierId}`);
  }
}