// src/read-models/types.ts

export interface StockMovementRM {
  movementId: string;
  tenantId: string;
  productId: string;
  category: string;
  quantity: number;
  depotId: string;
  targetDepotId?: string;
  movementType: 'ENTRY' | 'EXIT' | 'TRANSFER' | 'ADJUSTMENT';
  documentId: string;
  occurredAt: string;
}

export interface StockQuantityRM {
  tenantId: string;
  productId: string;
  category: string;
  depotId: string;
  quantity: number;
}
