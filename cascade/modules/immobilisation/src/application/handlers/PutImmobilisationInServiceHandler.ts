import { ImmobilisationGuardian } from '../../guardian/ImmobilisationGuardian';
import { PutImmobilisationInServiceCommand } from '../commands/PutImmobilisationInServiceCommand';
import { ImmobilisationWriteRepository } from '../ports/ImmobilisationWriteRepository';

export class PutImmobilisationInServiceHandler {
  constructor(
    private readonly guardian: ImmobilisationGuardian,
    private readonly repo: ImmobilisationWriteRepository
  ) {}

  async handle(
    command: PutImmobilisationInServiceCommand
  ): Promise<void> {
    this.guardian.validatePutInService(
      command.context,
      command.payload
    );

    await this.repo.save({
      type: 'ImmobilisationPutInService',
      payload: command.payload,
      occurredAt: new Date().toISOString(),
    });
  }
}
