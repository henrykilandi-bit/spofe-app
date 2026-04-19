// src/guardian/types.ts

export type StockCategory =
  | 'MARCHANDISES'
  | 'PRODUITS_FINIS'
  | 'MATIERES_PREMIERES'
  | 'EMBALLAGES_PERDUS'
  | 'EMBALLAGES_RECUPERABLES'
  | 'AUTRES';

export type StockMovementType =
  | 'ENTRY'
  | 'EXIT'
  | 'TRANSFER'
  | 'ADJUSTMENT';

export interface GuardianContext {
  tenantId: string;
  actorId: string;
}

export interface StockMovementFact {
  movementId: string;
  tenantId: string;
  productId: string;
  category: StockCategory;
  quantity: number;
  depotId: string;
  targetDepotId?: string; // uniquement pour TRANSFER
  movementType: StockMovementType;
  documentId: string;
  documentStatus: 'VALIDATED';
  lots?: string[]; // optionnels
  resultingStock: number; // stock après mouvement (calculé en amont)
}
