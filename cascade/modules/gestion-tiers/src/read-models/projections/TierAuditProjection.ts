import { TierEvent } from '../../domain/events/TierEvents';
import { TierAuditView } from '../models/TierAuditView';

export class TierAuditProjection {
  private readonly store: TierAuditView[] = [];

  apply(event: TierEvent): void {
    this.store.push({
      tenantId: event.tenantId,
      tierId: event.tierId,
      eventType: event.type,
      actorId: event.actorId,
      timestamp: event.timestamp,
      summary: event.type
    });
  }

  getByTier(tenantId: string, tierId: string): TierAuditView[] {
    return this.store.filter(
      e => e.tenantId === tenantId && e.tierId === tierId
    );
  }
}