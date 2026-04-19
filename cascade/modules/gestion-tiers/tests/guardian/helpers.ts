import { GuardianContext, TierAggregate, TierDocument } from '../../src/domain/guardian/GuardianContext';

export function validDocument(overrides: Partial<TierDocument> = {}): TierDocument {
  return {
    id: 'doc-1',
    type: 'TierRecord',
    state: 'validated',
    payload: {
      name: 'ACME',
      roles: ['CLIENT'],
      legalIdentifiers: ['ICE123']
    },
    ...overrides
  };
}

export function validTier(overrides: Partial<TierAggregate> = {}): TierAggregate {
  return {
    tierId: 'tier-1',
    tenantId: 'tenant-1',
    status: 'ACTIVE',
    roles: ['CLIENT'],
    legalIdentifiers: ['ICE123'],
    ...overrides
  };
}

export function baseContext(overrides: Partial<GuardianContext> = {}): GuardianContext {
  return {
    tenantId: 'tenant-1',
    actorId: 'actor-1',
    commandType: 'CreateTier',
    document: validDocument(),
    ...overrides
  };
}