/**
 * 📋 Exemple d'Intégration - Composition Racine
 * 
 * Illustratif uniquement (pas du scope du module)
 * Montre comment assembler les composants SPOFE.
 */

import { AccountingReadController } from './api/AccountingReadController';
import { InMemoryAccountingReadRepository } from './read-models/InMemoryAccountingReadRepository';
import { AccountingPeriodRM } from './read-models/types/AccountingPeriodRM';
import { AccountingEntryRM } from './read-models/types/AccountingEntryRM';

// Composition racine
const repo = new InMemoryAccountingReadRepository();
const controller = new AccountingReadController(repo);

// Exemple d'utilisation
export function exampleUsage() {
  // GET /accounting/periods/2026-01
  const period = controller.getPeriod('2026-01');
  console.log('Période:', period);

  // GET /accounting/periods/2026-01/entries
  const entries = controller.getEntriesByPeriod('2026-01');
  console.log('Écritures:', entries);

  // GET /accounting/periods/2026-01/accounts/411
  const accountEntries = controller.getEntriesByAccount('2026-01', '411');
  console.log('Écritures compte 411:', accountEntries);

  // GET /accounting/periods/2026-01/tiers/C-001
  const tierEntries = controller.getEntriesByTier('2026-01', 'C-001');
  console.log('Écritures tiers C-001:', tierEntries);
}

// Exemple d'initialisation avec données de test
export function initializeWithTestData() {
  const testPeriod: AccountingPeriodRM = {
    periodId: '2026-01',
    status: 'OPEN',
    entries: [
      {
        entryId: 'E-001',
        periodId: '2026-01',
        journalCode: 'VENTE',
        entryDate: '2026-01-15',
        accountCode: '411',
        debit: 1200,
        credit: 0,
        tierId: 'C-001',
        documentRef: 'DOC-001',
        sourceModule: 'VENTE',
        sourceId: 'INV-001',
        createdAt: '2026-01-15T10:00:00Z'
      },
      {
        entryId: 'E-001',
        periodId: '2026-01',
        journalCode: 'VENTE',
        entryDate: '2026-01-15',
        accountCode: '706',
        debit: 0,
        credit: 1200,
        documentRef: 'DOC-001',
        sourceModule: 'VENTE',
        sourceId: 'INV-001',
        createdAt: '2026-01-15T10:00:00Z'
      }
    ]
  };

  repo.addPeriod(testPeriod);
  console.log('Données de test initialisées');
}
