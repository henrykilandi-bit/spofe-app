// tests/unit/guardian/stock.guardian.spec.ts

import { StockGuardian } from '../../../src/domain/guardian/stock.guardian';

describe('StockGuardian', () => {
  describe('validateDocumentValidation', () => {
    it('accepts a valid document validation', () => {
      const result = StockGuardian.validateDocumentValidation({
        documentId: 'doc-1',
        documentType: 'RECEPTION',
        tenantId: 'tenant-1',
        depotId: 'depot-1',
        category: 'MERCHANDISE',
        status: 'draft',
        actorId: 'actor-1',
        previousDocumentValidated: true,
      });

      expect(result.success).toBe(true);
    });

    it('rejects validation without actor', () => {
      const result = StockGuardian.validateDocumentValidation({
        documentId: 'doc-1',
        documentType: 'RECEPTION',
        tenantId: 'tenant-1',
        depotId: 'depot-1',
        category: 'MERCHANDISE',
        status: 'draft',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('validateMovementCreation', () => {
    it('accepts a valid movement', () => {
      const result = StockGuardian.validateMovementCreation({
        movementType: 'entry',
        tenantId: 'tenant-1',
        depotId: 'depot-1',
        quantity: 10,
        documentId: 'doc-1',
      });

      expect(result.success).toBe(true);
    });

    it('rejects zero quantity', () => {
      const result = StockGuardian.validateMovementCreation({
        movementType: 'entry',
        tenantId: 'tenant-1',
        depotId: 'depot-1',
        quantity: 0,
        documentId: 'doc-1',
      });

      expect(result.success).toBe(false);
    });
  });

  describe('validateInternalTransfer', () => {
    it('rejects same source and target depot', () => {
      const result = StockGuardian.validateInternalTransfer({
        tenantId: 'tenant-1',
        sourceDepotId: 'depot-1',
        targetDepotId: 'depot-1',
        documentValidated: true,
      });

      expect(result.success).toBe(false);
    });

    it('accepts valid internal transfer', () => {
      const result = StockGuardian.validateInternalTransfer({
        tenantId: 'tenant-1',
        sourceDepotId: 'depot-1',
        targetDepotId: 'depot-2',
        documentValidated: true,
      });

      expect(result.success).toBe(true);
    });
  });
});