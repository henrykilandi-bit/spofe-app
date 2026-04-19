import type {
  GestionCommandeStatus,
  OrderCancelledEvent,
  OrderCreatedEvent
} from '../domain';

export interface OrderStatusReadModel {
  readonly orderId: string;
  readonly tenantId: string;
  readonly status: GestionCommandeStatus;
  readonly updatedAt: string;
}

export type GestionCommandesEvent = OrderCreatedEvent | OrderCancelledEvent;

export const applyOrderEvent = (
  current: OrderStatusReadModel | null,
  event: GestionCommandesEvent
): OrderStatusReadModel => {
  if (event.type === 'ORDER_CREATED') {
    return {
      orderId: event.orderId,
      tenantId: event.tenantId,
      status: 'CREATED',
      updatedAt: event.occurredAt
    };
  }

  if (!current) {
    throw new Error('Missing current order state for ORDER_CANCELLED projection');
  }

  return {
    ...current,
    status: 'CANCELLED',
    updatedAt: event.occurredAt
  };
};

export class InMemoryOrderStatusReadRepository {
  private readonly orders = new Map<string, OrderStatusReadModel>();

  upsert(order: OrderStatusReadModel): void {
    this.orders.set(order.orderId, order);
  }

  findByOrderId(orderId: string): OrderStatusReadModel | null {
    return this.orders.get(orderId) ?? null;
  }
}
