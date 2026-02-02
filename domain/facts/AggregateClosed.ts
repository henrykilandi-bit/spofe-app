/**
 * AggregateClosed Fact
 */

import { AggregateId } from '../value-objects/AggregateId';
import { Timestamp } from '../value-objects/Timestamp';

export interface AggregateClosed {
  factId: string;
  factType: 'AGGREGATE_CLOSED';
  aggregateId: AggregateId;
  timestamp: Timestamp;
  reason: string;
  causedByEventId: string;
}