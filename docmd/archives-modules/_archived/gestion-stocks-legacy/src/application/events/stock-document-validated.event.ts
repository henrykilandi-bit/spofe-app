export class StockDocumentValidatedEvent {
  constructor(
    public readonly documentId: string,
    public readonly actorId: string,
    public readonly occurredAt: Date = new Date()
  ) {}
}