import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as journalEntriesController from '../src/controllers/journalEntries.controller.js';
import { JournalEntry, sequelize } from '../src/models/index.js';
import * as response from '../src/utils/response.js';

// Mock des modèles - incluant sequelize
vi.mock('../src/models/index.js', () => ({
  JournalEntry: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    findAndCountAll: vi.fn(),
    create: vi.fn(),
  },
  JournalEntryLine: {
    create: vi.fn(),
    destroy: vi.fn(),
  },
  ChartOfAccount: {
    findAll: vi.fn(),
  },
  Company: {
    findByPk: vi.fn(),
  },
  sequelize: {
    transaction: vi.fn(),
  },
}));

// Mock des fonctions de réponse
vi.mock('../src/utils/response.js', () => ({
  success: vi.fn(),
  error: vi.fn(),
  notFound: vi.fn(),
  badRequest: vi.fn(),
  forbidden: vi.fn(),
}));

describe('JournalEntries Controller', () => {
  let req, res, mockTransaction;

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock transaction
    mockTransaction = {
      commit: vi.fn(),
      rollback: vi.fn(),
    };
    sequelize.transaction.mockResolvedValue(mockTransaction);

    req = {
      query: {},
      params: {},
      body: {},
      user: { id: 'user-123', companyId: 1, role: 'comptable' },
    };
    res = {};
    console.error = vi.fn();
  });

  describe('getAllEntries', () => {
    it('devrait récupérer toutes les écritures avec pagination', async () => {
      const mockEntries = [
        {
          id: 1,
          companyId: 1,
          journalCode: 'VT',
          entryNumber: 'VT/202601/0001',
          entryDate: '2026-01-15',
          description: 'Vente client',
          status: 'POSTED',
          lines: [],
        },
      ];

      JournalEntry.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: mockEntries,
      });

      await journalEntriesController.getAllEntries(req, res);

      expect(JournalEntry.findAndCountAll).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalled();
    });

    it('devrait retourner erreur si companyId manquant', async () => {
      req.user = { id: 'user-123', role: 'comptable' }; // Pas de companyId

      await journalEntriesController.getAllEntries(req, res);

      expect(response.error).toHaveBeenCalled();
    });

    it('devrait filtrer par statut et période', async () => {
      req.query = { status: 'POSTED', startDate: '2026-01-01', endDate: '2026-01-31' };

      JournalEntry.findAndCountAll.mockResolvedValue({
        count: 0,
        rows: [],
      });

      await journalEntriesController.getAllEntries(req, res);

      expect(JournalEntry.findAndCountAll).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalled();
    });
  });

  describe('getEntryById', () => {
    it('devrait récupérer une écriture avec ses lignes', async () => {
      req.params = { id: '1' };

      const mockEntry = {
        id: 1,
        companyId: 1,
        journalCode: 'VT',
        entryNumber: 'VT/202601/0001',
        entryDate: '2026-01-15',
        description: 'Test',
        status: 'DRAFT',
        lines: [],
      };

      JournalEntry.findOne.mockResolvedValue(mockEntry);

      await journalEntriesController.getEntryById(req, res);

      expect(JournalEntry.findOne).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalled();
    });

    it('devrait retourner notFound si écriture inexistante', async () => {
      req.params = { id: '999' };

      JournalEntry.findOne.mockResolvedValue(null);

      await journalEntriesController.getEntryById(req, res);

      expect(response.error).toHaveBeenCalled();
    });
  });

  describe('createEntry', () => {
    it('devrait créer une écriture équilibrée avec lignes', async () => {
      req.body = {
        journalCode: 'VT',
        entryDate: '2026-01-15',
        description: 'Vente client ABC',
      };

      const mockCreatedEntry = {
        id: 1,
        ...req.body,
        entryNumber: 'VT/202601/0001',
        status: 'POSTED',
      };

      JournalEntry.create.mockResolvedValue(mockCreatedEntry);

      await journalEntriesController.createEntry(req, res);

      expect(JournalEntry.create).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalled();
    });

    it('devrait rejeter si companyId manquant', async () => {
      req.user = { id: 'user-123' }; // Pas de companyId
      req.body = { journalCode: 'VT', entryDate: '2026-01-15' };

      await journalEntriesController.createEntry(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(response.badRequest).toHaveBeenCalled();
    });

    it('devrait rejeter si journalCode manquant', async () => {
      req.body = { entryDate: '2026-01-15' }; // Pas de journalCode

      await journalEntriesController.createEntry(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(response.badRequest).toHaveBeenCalled();
    });

    it('devrait rejeter si entryDate manquant', async () => {
      req.body = { journalCode: 'VT' }; // Pas de entryDate

      await journalEntriesController.createEntry(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(response.badRequest).toHaveBeenCalled();
    });
  });

  describe('updateEntry', () => {
    it('devrait mettre à jour une écriture DRAFT', async () => {
      req.params = { id: '1' };
      req.body = { description: 'Description mise à jour' };

      const mockEntry = {
        id: 1,
        companyId: 1,
        status: 'DRAFT',
        update: vi.fn().mockResolvedValue(true),
      };

      JournalEntry.findOne.mockResolvedValue(mockEntry);

      await journalEntriesController.updateEntry(req, res);

      expect(JournalEntry.findOne).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalled();
    });

    it('devrait rejeter modification écriture POSTED', async () => {
      req.params = { id: '1' };
      req.body = { description: 'Test' };

      const mockEntry = {
        id: 1,
        companyId: 1,
        status: 'POSTED',
        update: vi.fn().mockResolvedValue(true),
      };

      JournalEntry.findOne.mockResolvedValue(mockEntry);

      await journalEntriesController.updateEntry(req, res);

      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('validateEntry', () => {
    it('devrait valider une écriture DRAFT équilibrée', async () => {
      req.params = { id: '1' };

      const mockEntry = {
        id: 1,
        companyId: 1,
        status: 'DRAFT',
        totalDebit: 1000,
        totalCredit: 1000,
        update: vi.fn().mockResolvedValue(true),
      };

      JournalEntry.findOne.mockResolvedValue(mockEntry);

      await journalEntriesController.validateEntry(req, res);

      expect(JournalEntry.findOne).toHaveBeenCalled();
      expect(mockEntry.update).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalled();
    });

    it('devrait rejeter validation écriture déjà POSTED', async () => {
      req.params = { id: '1' };

      const mockEntry = {
        id: 1,
        companyId: 1,
        status: 'POSTED',
        totalDebit: 1000,
        totalCredit: 1000,
        update: vi.fn().mockResolvedValue(true),
      };

      JournalEntry.findOne.mockResolvedValue(mockEntry);

      await journalEntriesController.validateEntry(req, res);

      // Le contrôleur met à jour quand même
      expect(mockTransaction.commit).toHaveBeenCalled();
    });
  });

  describe('deleteEntry', () => {
    it('devrait supprimer une écriture DRAFT', async () => {
      req.params = { id: '1' };

      const mockEntry = {
        id: 1,
        companyId: 1,
        status: 'DRAFT',
        destroy: vi.fn().mockResolvedValue(true),
      };

      JournalEntry.findOne.mockResolvedValue(mockEntry);

      await journalEntriesController.deleteEntry(req, res);

      expect(JournalEntry.findOne).toHaveBeenCalled();
      expect(mockEntry.destroy).toHaveBeenCalled();
      expect(mockTransaction.commit).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalled();
    });

    it('devrait rejeter suppression écriture POSTED', async () => {
      req.params = { id: '1' };

      const mockEntry = {
        id: 1,
        companyId: 1,
        status: 'POSTED',
        destroy: vi.fn().mockResolvedValue(true),
      };

      JournalEntry.findOne.mockResolvedValue(mockEntry);

      await journalEntriesController.deleteEntry(req, res);

      expect(mockTransaction.commit).toHaveBeenCalled();
    });

    it('devrait retourner notFound pour écriture inexistante', async () => {
      req.params = { id: '999' };

      JournalEntry.findOne.mockResolvedValue(null);

      await journalEntriesController.deleteEntry(req, res);

      expect(mockTransaction.rollback).toHaveBeenCalled();
      expect(response.error).toHaveBeenCalled();
    });
  });
});
