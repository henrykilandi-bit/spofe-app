import { TierEvent } from '../../domain/events/TierEvents';

export interface TierEventStore {
  append(event: TierEvent): Promise<void>;
  getEvents(tierId: string): Promise<TierEvent[]>;
  getEventsByTenant(tenantId: string): Promise<TierEvent[]>;
}

// TODO v1.1+: Implement concrete event store
// - EventStore implementation
// - Kafka implementation
// - In-memory implementation (for testing)