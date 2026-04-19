import { describe, expect, it } from '@jest/globals';

import { GestionCommandesWrite } from '../../write';
import {
  applyOrderEvent,
  InMemoryOrderStatusReadRepository
} from '../../read-models';

describe('gestion-commandes system create -> cancel -> read', () => {
  it('updates read-model status to CANCELLED after cancellation', async () => {
    const repository = new InMemoryOrderStatusReadRepository();

    const created = await GestionCommandesWrite.createOrderWithEvent({
      commandId: 'CMD-SYS-01',
      commandType: 'CREATE_ORDER',
      orderId: 'ORDER-SYS-01',
      tenantId: 'tenant-system',
      actorId: 'actor-system',
      tiersId: 'tiers-system',
      stockId: 'stock-system',
      documentId: 'doc-system',
      documentStatus: 'VALIDATED',
      quantity: 1
    });

    const cancelled = await GestionCommandesWrite.cancelOrder(
      {
        commandId: 'CMD-SYS-02',
        commandType: 'CANCEL_ORDER',
        orderId: created.order.orderId,
        tenantId: created.order.tenantId,
        actorId: 'actor-system',
        reason: 'test cancellation'
      },
      created.order
    );

    repository.upsert(applyOrderEvent(null, created.event));
    repository.upsert(
      applyOrderEvent(repository.findByOrderId(created.order.orderId), cancelled.event)
    );

    const projected = repository.findByOrderId(created.order.orderId);
    expect(projected).not.toBeNull();
    expect(projected?.status).toBe('CANCELLED');
  });
});
