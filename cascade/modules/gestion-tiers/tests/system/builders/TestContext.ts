import { randomUUID } from 'crypto';
import { TierTestBuilder } from './TierTestBuilder';

export interface TestContext {
  tenantId: string;
  actorId: string;
}

export class SystemTestContext {
  public readonly context: TestContext;
  public readonly tierBuilder: TierTestBuilder;

  constructor() {
    this.context = {
      tenantId: `tenant-${randomUUID().substring(0, 8)}`,
      actorId: `actor-${randomUUID().substring(0, 8)}`
    };
    this.tierBuilder = new TierTestBuilder(this.context);
  }

  // Contextes prédéfinis pour différents scénarios
  static forBasicScenario(): SystemTestContext {
    return new SystemTestContext();
  }

  static forMultiTenantScenario(): SystemTestContext {
    return new SystemTestContext();
  }

  // Helper pour validation Guardian
  ensureGuardianCompliance(): void {
    if (!this.context.tenantId || !this.context.actorId) {
      throw new Error('Guardian compliance requires tenantId and actorId');
    }
  }
}