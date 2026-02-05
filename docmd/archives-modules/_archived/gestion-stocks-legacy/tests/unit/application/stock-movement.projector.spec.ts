import { StockMovementProjector } from '../../../src/application/events/stock-movement-created.projector';

describe('StockMovementProjector', () => {
  it('projects a stock movement event into read store', async () => {
    const mockDb = {
      query: jest.fn(),
    } as any;

    const projector = new StockMovementProjector(mockDb);

    await projector.project({
      movementId: 'mov-1',
      tenantId: 'tenant-1',
      depotId: 'depot-1',
      productId: 'prod-1',
      category: 'MERCHANDISE',
      movementType: 'entry',
      quantity: 10,
      documentId: 'doc-1',
      occurredAt: new Date(),
    });

    expect(mockDb.query).toHaveBeenCalledTimes(1);
  });
});