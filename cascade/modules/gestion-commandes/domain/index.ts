/**
 * SPOFE Module: Gestion-Commandes v1.0.0
 * Domain Layer - Order create/cancel slice
 */

export type GestionCommandeStatus =
  | 'CREATED'
  | 'CANCELLED'
  | 'FINALIZED'
  | 'DELIVERED';

export interface CreateGestionCommandeInput {
  readonly commandId: string;
  readonly commandType: 'CREATE_ORDER';
  readonly orderId: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly tiersId: string;
  readonly stockId: string;
  readonly documentId: string;
  readonly documentStatus: 'VALIDATED' | 'SIGNED';
  readonly quantity: number;
}

export interface CancelGestionCommandeInput {
  readonly commandId: string;
  readonly commandType: 'CANCEL_ORDER';
  readonly orderId: string;
  readonly tenantId: string;
  readonly actorId: string;
  readonly reason?: string;
}

export interface GestionCommande {
  readonly orderId: string;
  readonly tenantId: string;
  readonly tiersId: string;
  readonly stockId: string;
  readonly quantity: number;
  readonly documentId: string;
  readonly actorId: string;
  readonly commandId: string;
  readonly status: GestionCommandeStatus;
  readonly createdAt: string;
  readonly cancelledAt?: string;
  readonly cancellationReason?: string;
}

export interface GestionCommandesDomain {
  readonly moduleId: string;
  readonly version: string;
  readonly domain: 'order-management';
  readonly implementation: 'first-slice';
}

const createGestionCommande = (
  input: CreateGestionCommandeInput,
  createdAt = new Date().toISOString()
): GestionCommande => {
  return {
    orderId: input.orderId,
    tenantId: input.tenantId,
    tiersId: input.tiersId,
    stockId: input.stockId,
    quantity: input.quantity,
    documentId: input.documentId,
    actorId: input.actorId,
    commandId: input.commandId,
    status: 'CREATED',
    createdAt
  };
};

const cancelGestionCommande = (
  currentOrder: GestionCommande,
  input: CancelGestionCommandeInput,
  cancelledAt = new Date().toISOString()
): GestionCommande => {
  return {
    ...currentOrder,
    status: 'CANCELLED',
    commandId: input.commandId,
    actorId: input.actorId,
    cancelledAt,
    cancellationReason: input.reason
  };
};

export interface OrderCreatedEvent {
  readonly type: 'ORDER_CREATED';
  readonly orderId: string;
  readonly tenantId: string;
  readonly status: 'CREATED';
  readonly occurredAt: string;
}

export interface OrderCancelledEvent {
  readonly type: 'ORDER_CANCELLED';
  readonly orderId: string;
  readonly tenantId: string;
  readonly status: 'CANCELLED';
  readonly reason?: string;
  readonly occurredAt: string;
}

const emitOrderCreated = (
  order: GestionCommande,
  occurredAt = order.createdAt
): OrderCreatedEvent => ({
  type: 'ORDER_CREATED',
  orderId: order.orderId,
  tenantId: order.tenantId,
  status: 'CREATED',
  occurredAt
});

const emitOrderCancelled = (
  order: GestionCommande,
  occurredAt = order.cancelledAt ?? new Date().toISOString()
): OrderCancelledEvent => ({
  type: 'ORDER_CANCELLED',
  orderId: order.orderId,
  tenantId: order.tenantId,
  status: 'CANCELLED',
  reason: order.cancellationReason,
  occurredAt
});

export const GestionCommandesDomain = {
  moduleId: 'gestion-commandes',
  version: '1.0.0',
  domain: 'order-management' as const,
  implementation: 'first-slice' as const,
  createGestionCommande,
  cancelGestionCommande,
  emitOrderCreated,
  emitOrderCancelled
} as const;
