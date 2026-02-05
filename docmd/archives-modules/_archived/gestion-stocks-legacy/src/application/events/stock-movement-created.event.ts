export class StockMovementCreatedEvent {
  constructor(
    public readonly movementId: string,
    public readonly tenantId: string,
    public readonly depotId: string,
    public readonly productId: string,
    public readonly category: string,
    public readonly movementType: 'entry' | 'exit' | 'transfer' | 'inventory',
    public readonly quantity: number,
    public readonly documentId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}