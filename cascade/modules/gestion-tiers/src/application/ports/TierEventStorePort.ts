import { TierEvent } from '../../domain/events/TierEvents';

export interface TierEventStorePort {
  append(event: TierEvent): Promise<void>;
}