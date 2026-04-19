import { ImmobilisationGuardian } from '../../guardian/ImmobilisationGuardian';
import { DisposeImmobilisationCommand } from '../commands/DisposeImmobilisationCommand';
import { ImmobilisationWriteRepository } from '../ports/ImmobilisationWriteRepository';

export class DisposeImmobilisationHandler {
  constructor(
    private readonly guardian: ImmobilisationGuardian,
    private readonly repo: ImmobilisationWriteRepository
  ) {}

  async handle(
    command: DisposeImmobilisationCommand
  ): Promise<void> {
    this.guardian.validateDispose(
      command.context,
      command.payload
    );

    await this.repo.save({
      type: 'ImmobilisationDisposed',
      payload: command.payload,
      occurredAt: new Date().toISOString(),
    });
  }
}
