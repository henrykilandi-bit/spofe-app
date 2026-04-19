import { TierEvent } from '../../domain/events/TierEvents';
export interface TierEventStore {
    append(event: TierEvent): Promise<void>;
    getEvents(tierId: string): Promise<TierEvent[]>;
    getEventsByTenant(tenantId: string): Promise<TierEvent[]>;
}
//# sourceMappingURL=TierEventStore.d.ts.map