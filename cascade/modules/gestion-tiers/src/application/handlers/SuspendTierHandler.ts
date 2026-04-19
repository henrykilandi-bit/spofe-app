import { randomUUID } from 'crypto';
import { TierGuardian } from '../../domain/guardian/TierGuardian';
import { GuardianContext } from '../../domain/guardian/GuardianContext';
import { SuspendTier } from '../commands/SuspendTier';
import { TierRepositoryPort } from '../ports/TierRepositoryPort';
import { TierEventStorePort } from '../ports/TierEventStorePort';

export class SuspendTierHandler {
  constructor(
    private readonly guardian: TierGuardian,
    private readonly repository: TierRepositoryPort,
    private readonly eventStore: TierEventStorePort
  ) {}

  async execute(command: SuspendTier): Promise<void> {
    const currentTier = await this.repository.findById(command.tierId);

    const context: GuardianContext = {
      tenantId: command.tenantId,
      actorId: command.actorId,
      commandType: 'SuspendTier',
      currentTier: currentTier ?? undefined,
      document: {
        id: randomUUID(),
        type: 'TierSuspensionRecord',
        state: 'validated',
        payload: { reason: command.reason }
      }
    };

    this.guardian.validate(context);

    await this.eventStore.append({
      type: 'TierSuspended',
      tierId: command.tierId,
      tenantId: command.tenantId,
      actorId: command.actorId,
      timestamp: new Date().toISOString(),
      reason: command.reason
    });
  }
}