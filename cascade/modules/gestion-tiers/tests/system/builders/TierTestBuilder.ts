import { createTierHandler, updateTierHandler, suspendTierHandler, archiveTierHandler } from '../../../src/application/wiring';
import { TierRole } from '../../../src/domain/guardian/GuardianContext';

export interface TestContext {
  tenantId: string;
  actorId: string;
}

export class TierTestBuilder {
  constructor(private ctx: TestContext) {}

  async givenActiveTier(options: {
    name: string;
    roles: TierRole[];
    legalIdentifiers?: string[];
  }) {
    await createTierHandler.execute({
      tenantId: this.ctx.tenantId,
      actorId: this.ctx.actorId,
      payload: {
        name: options.name,
        roles: options.roles,
        legalIdentifiers: options.legalIdentifiers || [`SIRET:${Math.random().toString().substring(2, 16)}`],
        email: `${options.name.toLowerCase().replace(/\s+/g, '')}@example.com`
      }
    });
  }

  async givenActiveClient(name: string = 'ACME Client SA') {
    return this.givenActiveTier({
      name,
      roles: ['CLIENT'],
      legalIdentifiers: [`SIRET:${Math.random().toString().substring(2, 16)}`]
    });
  }

  async givenActiveProvider(name: string = 'Provider Corp') {
    return this.givenActiveTier({
      name,
      roles: ['FOURNISSEUR'],
      legalIdentifiers: [`SIRET:${Math.random().toString().substring(2, 16)}`]
    });
  }

  async givenEmployee(name: string = 'John Doe') {
    return this.givenActiveTier({
      name,
      roles: ['SALARIE'],
      legalIdentifiers: [`SS:${Math.random().toString().substring(2, 16)}`]
    });
  }
}