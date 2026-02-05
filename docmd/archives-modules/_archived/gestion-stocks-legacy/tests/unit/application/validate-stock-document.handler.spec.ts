import { ValidateStockDocumentHandler } from '../../../src/application/handlers/validate-stock-document.handler';

describe('ValidateStockDocumentHandler', () => {
  it('publishes event when document is valid', async () => {
    const events: any[] = [];

    const handler = new ValidateStockDocumentHandler(
      { publish: async e => { events.push(e); } },
      () => ({
        documentId: 'doc-1',
        documentType: 'RECEPTION',
        tenantId: 'tenant-1',
        depotId: 'depot-1',
        category: 'MERCHANDISE',
        status: 'draft',
        previousDocumentValidated: true,
      })
    );

    await handler.execute({
      commandId: 'cmd-1',
      documentId: 'doc-1',
      actorId: 'actor-1',
    });

    expect(events.length).toBe(1);
  });
});