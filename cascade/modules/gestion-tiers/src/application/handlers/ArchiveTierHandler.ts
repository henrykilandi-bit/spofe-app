import { randomUUID } from 'crypto';
import { TierGuardian } from '../../domain/guardian/TierGuardian';
import { GuardianContext } from '../../domain/guardian/GuardianContext';
import { ArchiveTier } from '../commands/ArchiveTier';
import { TierRepositoryPort } from '../ports/TierRepositoryPort';
import { TierEventStorePort } from '../ports/TierEventStorePort';

export class ArchiveTierHandler {
  constructor(
    private readonly guardian: TierGuardian,
    private readonly repository: TierRepositoryPort,
    private readonly eventStore: TierEventStorePort
  ) {}

  async execute(command: ArchiveTier): Promise<void> {
    const currentTier = await this.repository.findById(command.tierId);

    const context: GuardianContext = {
      tenantId: command.tenantId,
      actorId: command.actorId,
      commandType: 'ArchiveTier',
      currentTier: currentTier ?? undefined,
      document: {
        id: randomUUID(),
        type: 'TierArchiveRecord',
        state: 'validated',
        payload: { reason: command.reason }
      }
    };

    this.guardian.validate(context);

    await this.eventStore.append({
      type: 'TierArchived',
      tierId: command.tierId,
      tenantId: command.tenantId,
      actorId: command.actorId,
      timestamp: new Date().toISOString(),
      reason: command.reason
    });
  }
}