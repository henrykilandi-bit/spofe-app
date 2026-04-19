// src/read-models/projections/StockProjection.ts

import { StockMovementRM, StockQuantityRM } from '../types';

type StockEvent =
  | { type: 'StockEntered'; payload: StockMovementRM }
  | { type: 'StockExited'; payload: StockMovementRM }
  | { type: 'StockAdjusted'; payload: StockMovementRM }
  | { type: 'StockTransferred'; payload: StockMovementRM };

export class StockProjection {
  private movements: StockMovementRM[] = [];
  private quantities = new Map<string, StockQuantityRM>();

  apply(event: StockEvent): void {
    const m = event.payload;
    this.movements.push(m);

    switch (event.type) {
      case 'StockEntered':
      case 'StockAdjusted':
        this.increment(m);
        break;

      case 'StockExited':
        this.decrement(m);
        break;

      case 'StockTransferred':
        this.decrement({ ...m, depotId: m.depotId });
        this.increment({ ...m, depotId: m.targetDepotId! });
        break;
    }
  }

  private key(m: StockMovementRM): string {
    return `${m.tenantId}::${m.productId}::${m.depotId}`;
  }

  private increment(m: StockMovementRM): void {
    const key = this.key(m);
    const current = this.quantities.get(key);

    const qty = (current?.quantity ?? 0) + m.quantity;

    this.quantities.set(key, {
      tenantId: m.tenantId,
      productId: m.productId,
      category: m.category,
      depotId: m.depotId,
      quantity: qty,
    });
  }

  private decrement(m: StockMovementRM): void {
    const key = this.key(m);
    const current = this.quantities.get(key);

    const qty = (current?.quantity ?? 0) - m.quantity;

    this.quantities.set(key, {
      tenantId: m.tenantId,
      productId: m.productId,
      category: m.category,
      depotId: m.depotId,
      quantity: qty,
    });
  }

  snapshotMovements(): StockMovementRM[] {
    return [...this.movements];
  }

  snapshotQuantities(): StockQuantityRM[] {
    return Array.from(this.quantities.values());
  }
}
