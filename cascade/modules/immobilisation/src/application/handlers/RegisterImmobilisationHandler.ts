import { ImmobilisationGuardian } from '../../guardian/ImmobilisationGuardian';
import { RegisterImmobilisationCommand } from '../commands/RegisterImmobilisationCommand';
import { ImmobilisationWriteRepository } from '../ports/ImmobilisationWriteRepository';

export class RegisterImmobilisationHandler {
  constructor(
    private readonly guardian: ImmobilisationGuardian,
    private readonly repo: ImmobilisationWriteRepository
  ) {}

  async handle(command: RegisterImmobilisationCommand): Promise<void> {
    this.guardian.validateRegister(
      command.context,
      command.payload
    );

    await this.repo.save({
      type: 'ImmobilisationRegistered',
      payload: command.payload,
      occurredAt: new Date().toISOString(),
    });
  }
}
