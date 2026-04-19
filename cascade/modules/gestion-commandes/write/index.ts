/**
 * SPOFE Module: Gestion-Commandes v1.0.0
 * Write Layer - Order create/cancel slice
 */

import {
  type CancelGestionCommandeInput,
  GestionCommandesDomain,
  type CreateGestionCommandeInput,
  type GestionCommande,
  type OrderCancelledEvent,
  type OrderCreatedEvent
} from '../domain';
import { GestionCommandesGuardian } from '../guardian';

export interface GestionCommandesWrite {
  readonly moduleId: string;
  readonly writeType: 'Primary source (write)';
  readonly implementation: 'order-create-cancel';
}

export interface CreateOrderResult {
  readonly order: GestionCommande;
  readonly event: OrderCreatedEvent;
}

export interface CancelOrderResult {
  readonly order: GestionCommande;
  readonly event: OrderCancelledEvent;
}

export const GestionCommandesWrite = {
  moduleId: 'gestion-commandes',
  writeType: 'Primary source (write)' as const,
  implementation: 'order-create-cancel' as const,
  createOrder: async (
    input: CreateGestionCommandeInput
  ): Promise<GestionCommande> => {
    GestionCommandesGuardian.assertCreateOrder(input);
    return GestionCommandesDomain.createGestionCommande(input);
  },
  createOrderWithEvent: async (
    input: CreateGestionCommandeInput
  ): Promise<CreateOrderResult> => {
    const order = await GestionCommandesWrite.createOrder(input);
    return {
      order,
      event: GestionCommandesDomain.emitOrderCreated(order)
    };
  },
  cancelOrder: async (
    input: CancelGestionCommandeInput,
    currentOrder: GestionCommande
  ): Promise<CancelOrderResult> => {
    GestionCommandesGuardian.assertCancelOrder(input, currentOrder);
    const cancelledOrder = GestionCommandesDomain.cancelGestionCommande(currentOrder, input);
    return {
      order: cancelledOrder,
      event: GestionCommandesDomain.emitOrderCancelled(cancelledOrder)
    };
  }
} as const;
