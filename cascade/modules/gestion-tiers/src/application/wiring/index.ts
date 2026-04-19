import { TierGuardian } from '../../domain/guardian/TierGuardian';
import { TierRepositoryPort } from '../ports/TierRepositoryPort';
import { TierEventStorePort } from '../ports/TierEventStorePort';
import {
  CreateTierHandler,
  UpdateTierHandler,
  SuspendTierHandler,
  ArchiveTierHandler
} from '../handlers';

/**
 * In-memory implementations (application wiring only)
 * NOT infrastructure, acceptable for compilation & bootstrap
 */

class InMemoryTierRepository implements TierRepositoryPort {
  async findById(): Promise<null> {
    return null;
  }
}

class InMemoryTierEventStore implements TierEventStorePort {
  async append(): Promise<void> {
    return;
  }
}

// Wiring
const guardian = new TierGuardian();
const repository = new InMemoryTierRepository();
const eventStore = new InMemoryTierEventStore();

export const createTierHandler = new CreateTierHandler(
  guardian,
  eventStore
);

export const updateTierHandler = new UpdateTierHandler(
  guardian,
  repository,
  eventStore
);

export const suspendTierHandler = new SuspendTierHandler(
  guardian,
  repository,
  eventStore
);

export const archiveTierHandler = new ArchiveTierHandler(
  guardian,
  repository,
  eventStore
);