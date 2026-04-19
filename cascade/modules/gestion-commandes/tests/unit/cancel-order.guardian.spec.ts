import { describe, expect, it } from '@jest/globals';

import { GestionCommandesGuardian, GuardianError } from '../../guardian';
import { GestionCommandesDomain } from '../../domain';

const baseOrder = GestionCommandesDomain.createGestionCommande({
  commandId: 'CMD-010',
  commandType: 'CREATE_ORDER',
  orderId: 'ORDER-010',
  tenantId: 'tenant-1',
  actorId: 'actor-1',
  tiersId: 'tiers-1',
  stockId: 'stock-1',
  documentId: 'doc-1',
  documentStatus: 'VALIDATED',
  quantity: 2
});

describe('gestion-commandes guardian cancellation', () => {
  it('accepts cancellation for CREATED order', () => {
    expect(() =>
      GestionCommandesGuardian.assertCancelOrder(
        {
          commandId: 'CMD-011',
          commandType: 'CANCEL_ORDER',
          orderId: baseOrder.orderId,
          tenantId: baseOrder.tenantId,
          actorId: 'actor-2'
        },
        baseOrder
      )
    ).not.toThrow();
  });

  it('rejects cancellation for FINALIZED order', () => {
    const finalizedOrder = { ...baseOrder, status: 'FINALIZED' as const };

    expect(() =>
      GestionCommandesGuardian.assertCancelOrder(
        {
          commandId: 'CMD-011',
          commandType: 'CANCEL_ORDER',
          orderId: finalizedOrder.orderId,
          tenantId: finalizedOrder.tenantId,
          actorId: 'actor-2'
        },
        finalizedOrder
      )
    ).toThrow(GuardianError);
  });
});
