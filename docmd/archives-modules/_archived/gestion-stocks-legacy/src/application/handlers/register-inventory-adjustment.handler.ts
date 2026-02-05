import { v4 as uuid } from 'uuid';
import { StockGuardian } from '../../domain/guardian/stock.guardian';
import { RegisterInventoryAdjustmentCommand } from '../commands/register-inventory-adjustment.command';
import { StockMovementCreatedEvent } from '../events/stock-movement-created.event';
import { EventBus } from '../events/event-bus';

export class RegisterInventoryAdjustmentHandler {
  constructor(private readonly eventBus: EventBus) {}

  async execute(command: RegisterInventoryAdjustmentCommand): Promise<void> {
    const validation = StockGuardian.validateMovementCreation({
      movementType: 'inventory',
      tenantId: command.tenantId,
      depotId: command.depotId,
      quantity: command.quantityDelta,
      documentId: command.documentId,
    });

    if (!validation.success) {
      throw new Error('Guardian validation failed');
    }

    await this.eventBus.publish(
      new StockMovementCreatedEvent(
        uuid(),
        command.tenantId,
        command.depotId,
        command.productId,
        command.category,
        'inventory',
        command.quantityDelta,
        command.documentId
      )
    );
  }
}