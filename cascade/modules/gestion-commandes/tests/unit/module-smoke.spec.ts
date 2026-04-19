import { describe, expect, it } from '@jest/globals';

import { MODULE_INFO } from '../../index';
import { GestionCommandesDomain } from '../../domain';
import { GestionCommandesWrite } from '../../write';
import { GestionCommandesGuardian, GuardianError } from '../../guardian';
import { applyOrderEvent, InMemoryOrderStatusReadRepository } from '../../read-models';

const validInput = {
  commandId: 'CMD-001',
  commandType: 'CREATE_ORDER' as const,
  orderId: 'ORDER-001',
  tenantId: 'tenant-1',
  actorId: 'actor-1',
  tiersId: 'tiers-1',
  stockId: 'stock-1',
  documentId: 'doc-1',
  documentStatus: 'VALIDATED' as const,
  quantity: 3
};

describe('gestion-commandes smoke', () => {
  it('exposes coherent module metadata', () => {
    expect(MODULE_INFO.name).toBe('gestion-commandes');
    expect(MODULE_INFO.status).toBe('FIRST_SLICE_ACTIVE');
    expect(MODULE_INFO.implementation).toBe('order-create-cancel');
    expect(GestionCommandesDomain.moduleId).toBe(MODULE_INFO.name);
    expect(GestionCommandesWrite.moduleId).toBe(MODULE_INFO.name);
    expect(GestionCommandesGuardian.moduleId).toBe(MODULE_INFO.name);
  });

  it('declares an executable guardian for the first slice', () => {
    expect(GestionCommandesGuardian.guardiansCount).toBe(9);
    expect(GestionCommandesGuardian.status).toBe('FIRST_SLICE_ACTIVE');
    expect(GestionCommandesGuardian.executable).toBe(true);
    expect(GestionCommandesGuardian.declaredInvariants).toHaveLength(9);
    expect(GestionCommandesGuardian.validateScaffold()).toBe(true);
  });

  it('creates a command when the input is valid', async () => {
    const created = await GestionCommandesWrite.createOrder(validInput);

    expect(created.orderId).toBe(validInput.orderId);
    expect(created.tenantId).toBe(validInput.tenantId);
    expect(created.status).toBe('CREATED');
    expect(created.quantity).toBe(3);
  });

  it('rejects order creation when guardian invariants are violated', async () => {
    await expect(
      GestionCommandesWrite.createOrder({
        ...validInput,
        documentStatus: 'SIGNED',
        quantity: 0
      })
    ).rejects.toBeInstanceOf(GuardianError);
  });

  it('projects status from ORDER_CREATED and ORDER_CANCELLED events', async () => {
    const repository = new InMemoryOrderStatusReadRepository();
    const created = await GestionCommandesWrite.createOrderWithEvent(validInput);
    const cancelled = await GestionCommandesWrite.cancelOrder(
      {
        commandId: 'CMD-002',
        commandType: 'CANCEL_ORDER',
        orderId: created.order.orderId,
        tenantId: created.order.tenantId,
        actorId: 'actor-2',
        reason: 'customer request'
      },
      created.order
    );

    repository.upsert(applyOrderEvent(null, created.event));
    repository.upsert(applyOrderEvent(repository.findByOrderId(created.order.orderId), cancelled.event));

    expect(repository.findByOrderId(created.order.orderId)?.status).toBe('CANCELLED');
  });
});
