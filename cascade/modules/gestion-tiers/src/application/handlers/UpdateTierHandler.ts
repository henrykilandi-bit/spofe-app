import { randomUUID } from 'crypto';
import { TierGuardian } from '../../domain/guardian/TierGuardian';
import { GuardianContext } from '../../domain/guardian/GuardianContext';
import { UpdateTier } from '../commands/UpdateTier';
import { TierRepositoryPort } from '../ports/TierRepositoryPort';
import { TierEventStorePort } from '../ports/TierEventStorePort';

export class UpdateTierHandler {
  constructor(
    private readonly guardian: TierGuardian,
    private readonly repository: TierRepositoryPort,
    private readonly eventStore: TierEventStorePort
  ) {}

  async execute(command: UpdateTier): Promise<void> {
    const currentTier = await this.repository.findById(command.tierId);

    const context: GuardianContext = {
      tenantId: command.tenantId,
      actorId: command.actorId,
      commandType: 'UpdateTier',
      currentTier: currentTier ?? undefined,
      document: {
        id: randomUUID(),
        type: 'TierUpdateRecord',
        state: 'validated',
        payload: command.payload
      }
    };

    this.guardian.validate(context);

    await this.eventStore.append({
      type: 'TierUpdated',
      tierId: command.tierId,
      tenantId: command.tenantId,
      actorId: command.actorId,
      timestamp: new Date().toISOString(),
      payload: command.payload
    });
  }
}