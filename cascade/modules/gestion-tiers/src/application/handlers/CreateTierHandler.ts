import { randomUUID } from 'crypto';
import { TierGuardian } from '../../domain/guardian/TierGuardian';
import { GuardianContext } from '../../domain/guardian/GuardianContext';
import { CreateTier } from '../commands/CreateTier';
import { TierEventStorePort } from '../ports/TierEventStorePort';

export class CreateTierHandler {
  constructor(
    private readonly guardian: TierGuardian,
    private readonly eventStore: TierEventStorePort
  ) {}

  async execute(command: CreateTier): Promise<void> {
    const tierId = randomUUID();

    const context: GuardianContext = {
      tenantId: command.tenantId,
      actorId: command.actorId,
      commandType: 'CreateTier',
      document: {
        id: randomUUID(),
        type: 'TierRecord',
        state: 'validated',
        payload: command.payload
      }
    };

    this.guardian.validate(context);

    await this.eventStore.append({
      type: 'TierCreated',
      tierId,
      tenantId: command.tenantId,
      actorId: command.actorId,
      timestamp: new Date().toISOString(),
      payload: command.payload
    });
  }
}