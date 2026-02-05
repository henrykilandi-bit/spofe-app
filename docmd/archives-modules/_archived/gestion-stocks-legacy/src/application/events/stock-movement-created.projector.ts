import { Pool } from 'pg';

export interface StockMovementCreatedEvent {
  movementId: string;
  tenantId: string;
  depotId: string;
  productId: string;
  category: string;
  movementType: 'entry' | 'exit' | 'transfer' | 'inventory';
  quantity: number;
  documentId: string;
  occurredAt: Date;
}

export class StockMovementProjector {
  constructor(private readonly db: Pool) {}

  async project(event: StockMovementCreatedEvent): Promise<void> {
    await this.db.query(
      `
      INSERT INTO stock_movements (
        movement_id,
        tenant_id,
        depot_id,
        product_id,
        category,
        movement_type,
        quantity,
        document_id,
        occurred_at
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      `,
      [
        event.movementId,
        event.tenantId,
        event.depotId,
        event.productId,
        event.category,
        event.movementType,
        event.quantity,
        event.documentId,
        event.occurredAt,
      ]
    );
  }
}