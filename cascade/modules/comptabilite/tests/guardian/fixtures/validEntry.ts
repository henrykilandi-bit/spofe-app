/**
 * 🧰 Fixtures - Écritures Valides pour Tests Guardian
 */

import { AccountingEntry } from '../../../src/guardian/types/AccountingEntry';

export function validEntry(): AccountingEntry {
  return {
    entryId: 'E-001',
    journalCode: 'VENTE',
    periodId: '2026-01',
    entryDate: '2026-01-15',

    lines: [
      { accountCode: '411', debit: 1200, credit: 0, tierId: 'C-001' },
      { accountCode: '706', debit: 0, credit: 1200 }
    ],

    source: {
      module: 'VENTE',
      sourceId: 'INV-001'
    },

    documentRef: 'DOC-001',
    createdAt: '2026-01-15T10:00:00Z',
    createdBy: 'system'
  };
}

export function validSingleLineEntry(): AccountingEntry {
  return {
    entryId: 'E-002',
    journalCode: 'BANQUE',
    periodId: '2026-01',
    entryDate: '2026-01-16',

    lines: [
      { accountCode: '512', debit: 500, credit: 0 }
    ],

    source: {
      module: 'BANQUE',
      sourceId: 'REMISE-001'
    },

    documentRef: 'DOC-002',
    createdAt: '2026-01-16T10:00:00Z',
    createdBy: 'system'
  };
}

export function validUnbalancedEntry(): AccountingEntry {
  return {
    entryId: 'E-003',
    journalCode: 'ACHAT',
    periodId: '2026-01',
    entryDate: '2026-01-17',

    lines: [
      { accountCode: '601', debit: 800, credit: 0 },
      { accountCode: '401', debit: 0, credit: 750 } // Déséquilibré
    ],

    source: {
      module: 'ACHAT',
      sourceId: 'FACT-001'
    },

    documentRef: 'DOC-003',
    createdAt: '2026-01-17T10:00:00Z',
    createdBy: 'system'
  };
}
