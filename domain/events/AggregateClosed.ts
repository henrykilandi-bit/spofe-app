/**
 * AggregateClosed Event
 */

import { AggregateId } from '../value-objects/AggregateId';
import { Timestamp } from '../value-objects/Timestamp';

export interface AggregateClosed {
  eventId: string;
  eventType: 'AGGREGATE_CLOSED';
  aggregateId: AggregateId;
  timestamp: Timestamp;
  reason: string;
}