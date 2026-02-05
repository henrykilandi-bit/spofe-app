import { StockGuardian } from '../../domain/guardian/stock.guardian';
import { ValidateStockDocumentCommand } from '../commands/validate-stock-document.command';
import { StockDocumentValidatedEvent } from '../events/stock-document-validated.event';
import { EventBus } from '../events/event-bus';

export class ValidateStockDocumentHandler {
  constructor(
    private readonly eventBus: EventBus,
    private readonly documentLoader: (id: string) => any
  ) {}

  async execute(command: ValidateStockDocumentCommand): Promise<void> {
    const document = this.documentLoader(command.documentId);

    const validation = StockGuardian.validateDocumentValidation({
      ...document,
      actorId: command.actorId,
    });

    if (!validation.success) {
      throw new Error('Guardian validation failed');
    }

    await this.eventBus.publish(
      new StockDocumentValidatedEvent(
        command.documentId,
        command.actorId
      )
    );
  }
}