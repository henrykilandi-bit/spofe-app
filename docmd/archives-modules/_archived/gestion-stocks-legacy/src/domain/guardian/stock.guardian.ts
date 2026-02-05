// src/domain/guardian/stock.guardian.ts

export type GuardianViolation = {
  rule: string;
  message: string;
  field?: string;
};

export type GuardianResult =
  | { success: true }
  | { success: false; violations: GuardianViolation[] };

const success = (): GuardianResult => ({ success: true });

const failure = (violations: GuardianViolation[]): GuardianResult => ({
  success: false,
  violations,
});

export type DocumentStatus = 'draft' | 'validated' | 'cancelled';
export type MovementType = 'entry' | 'exit' | 'transfer' | 'inventory';
export type StockCategory =
  | 'MERCHANDISE'
  | 'FINISHED_PRODUCT'
  | 'RAW_MATERIAL'
  | 'CONSUMABLE_PACKAGING'
  | 'RETURNABLE_PACKAGING'
  | 'OTHER';

export interface StockDocument {
  documentId: string;
  documentType: string;
  tenantId: string;
  depotId: string;
  category: StockCategory;
  status: DocumentStatus;
  actorId?: string;
  previousDocumentValidated?: boolean;
}

export interface StockMovementInput {
  movementType: MovementType;
  tenantId: string;
  depotId: string;
  quantity: number;
  documentId: string;
}

export interface InternalTransferInput {
  tenantId: string;
  sourceDepotId: string;
  targetDepotId: string;
  documentValidated: boolean;
}

export class StockGuardian {
  /* ------------------------------------------------------------------
   * DOCUMENT VALIDATION
   * ------------------------------------------------------------------ */

  static validateDocumentValidation(
    document: StockDocument
  ): GuardianResult {
    const violations: GuardianViolation[] = [];

    if (document.status !== 'draft') {
      violations.push({
        rule: 'STOCK-INV-001',
        message: 'Only draft documents can be validated',
        field: 'status',
      });
    }

    if (!document.actorId) {
      violations.push({
        rule: 'STOCK-INV-002',
        message: 'Actor is mandatory to validate a document',
        field: 'actorId',
      });
    }

    if (document.previousDocumentValidated === false) {
      violations.push({
        rule: 'STOCK-INV-003',
        message: 'Previous document in the chain is not validated',
      });
    }

    return violations.length ? failure(violations) : success();
  }

  /* ------------------------------------------------------------------
   * MOVEMENT CREATION
   * ------------------------------------------------------------------ */

  static validateMovementCreation(
    input: StockMovementInput
  ): GuardianResult {
    const violations: GuardianViolation[] = [];

    if (!input.documentId) {
      violations.push({
        rule: 'STOCK-INV-001',
        message: 'Movement must be linked to a validated document',
        field: 'documentId',
      });
    }

    if (!input.tenantId) {
      violations.push({
        rule: 'STOCK-INV-004',
        message: 'TenantId is mandatory',
        field: 'tenantId',
      });
    }

    if (!input.depotId) {
      violations.push({
        rule: 'STOCK-INV-005',
        message: 'DepotId is mandatory',
        field: 'depotId',
      });
    }

    if (input.quantity === 0) {
      violations.push({
        rule: 'STOCK-INV-007',
        message: 'Movement quantity cannot be zero',
        field: 'quantity',
      });
    }

    const allowedTypes: MovementType[] = [
      'entry',
      'exit',
      'transfer',
      'inventory',
    ];

    if (!allowedTypes.includes(input.movementType)) {
      violations.push({
        rule: 'STOCK-INV-007',
        message: 'Unauthorized movement type',
        field: 'movementType',
      });
    }

    return violations.length ? failure(violations) : success();
  }

  /* ------------------------------------------------------------------
   * INTERNAL TRANSFER
   * ------------------------------------------------------------------ */

  static validateInternalTransfer(
    input: InternalTransferInput
  ): GuardianResult {
    const violations: GuardianViolation[] = [];

    if (input.sourceDepotId === input.targetDepotId) {
      violations.push({
        rule: 'STOCK-TRF-001',
        message: 'Source and target depots must be different',
      });
    }

    if (!input.documentValidated) {
      violations.push({
        rule: 'STOCK-INV-001',
        message: 'Transfer requires a validated document',
      });
    }

    return violations.length ? failure(violations) : success();
  }
}