import { TierEvent } from '../../domain/events/TierEvents';
import { TierByRoleView } from '../models/TierByRoleView';

export class TierByRoleProjection {
  private readonly store: TierByRoleView[] = [];

  apply(event: TierEvent): void {
    if (event.type !== 'TierCreated') return;

    // roles will be enriched later (v1.1+)
    // projection kept minimal on purpose
  }

  getAll(): TierByRoleView[] {
    return this.store;
  }
}