import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock des utilities (doit être avant les imports du contrôleur)
vi.mock('../src/utils/response.js', () => ({
  success: vi.fn(),
  error: vi.fn(),
  badRequest: vi.fn(),
  notFound: vi.fn(),
}));

// Mock des modèles (doit être avant les imports du contrôleur)
vi.mock('../src/models/index.js', () => ({
  ChartOfAccount: {
    findOne: vi.fn(),
    findAll: vi.fn(),
  },
  JournalEntry: {
    findAll: vi.fn(),
  },
  JournalEntryLine: {
    findAll: vi.fn(),
  },
  Company: {
    findByPk: vi.fn(),
  },
  ThirdParty: {
    findAll: vi.fn(),
  },
  sequelize: {
    fn: vi.fn((fn, col) => `${fn}(${col})`),
    col: vi.fn((col) => col),
    where: vi.fn((fn, op, val) => ({ [fn]: { [op]: val } })),
    // ✅ AJOUTER MOCK sequelize.query()
    query: vi.fn().mockResolvedValue([
      [
        {
          thirdPartyId: 1,
          thirdPartyCode: 'CLI001',
          thirdPartyName: 'Client Test',
          thirdPartyType: 'CUSTOMER',
          thirdPartyEmail: 'client@test.fr',
          totalDebit: '15000.00',
          totalCredit: '10000.00',
        },
      ],
    ]),
  },
}));

import {
  getBalance,
  getBalanceAuxiliary,
  getGeneralLedger,
  getIncomeStatement,
  getBalanceSheet,
} from '../src/controllers/reports.controller.js';
import * as response from '../src/utils/response.js';
import { ChartOfAccount, JournalEntryLine, Company } from '../src/models/index.js';

describe('Reports Controller', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('getBalance', () => {
    beforeEach(() => {
      req = {
        query: {
          companyId: '1',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        },
      };
    });

    it('devrait générer la balance générale avec succès', async () => {
      Company.findByPk.mockResolvedValue({ id: 1, name: 'Test Company' });

      JournalEntryLine.findAll.mockResolvedValue([
        {
          dataValues: {
            totalDebit: '10000.00',
            totalCredit: '5000.00',
          },
          ChartOfAccount: {
            id: 1,
            accountNumber: '411',
            accountName: 'Clients',
            accountType: 'ASSET',
          },
        },
        {
          dataValues: {
            totalDebit: '3000.00',
            totalCredit: '8000.00',
          },
          ChartOfAccount: {
            id: 2,
            accountNumber: '401',
            accountName: 'Fournisseurs',
            accountType: 'LIABILITY',
          },
        },
      ]);

      await getBalance(req, res);

      expect(Company.findByPk).toHaveBeenCalledWith('1');
      expect(JournalEntryLine.findAll).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          balance: expect.arrayContaining([
            expect.objectContaining({
              accountNumber: '401',
              debit: '3000.00',
              credit: '8000.00',
              balance: '-5000.00',
              balanceType: 'CREDIT',
            }),
            expect.objectContaining({
              accountNumber: '411',
              debit: '10000.00',
              credit: '5000.00',
              balance: '5000.00',
              balanceType: 'DEBIT',
            }),
          ]),
          totals: expect.objectContaining({
            totalDebit: '13000.00',
            totalCredit: '13000.00',
            difference: '0.00',
          }),
          count: 2,
        }),
        200,
        'Balance générale générée avec succès',
      );
    });

    it('devrait retourner une erreur si companyId manquant', async () => {
      req.query.companyId = undefined;

      await getBalance(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        "ID de l'entreprise requis",
        expect.objectContaining({ field: 'companyId' }),
      );
    });

    it("devrait retourner une erreur si company n'existe pas", async () => {
      Company.findByPk.mockResolvedValue(null);

      await getBalance(req, res);

      expect(response.notFound).toHaveBeenCalledWith(res, 'Entreprise non trouvée');
    });

    it('devrait filtrer par niveau de compte', async () => {
      req.query.level = '1';
      Company.findByPk.mockResolvedValue({ id: 1 });
      JournalEntryLine.findAll.mockResolvedValue([]);

      await getBalance(req, res);

      expect(JournalEntryLine.findAll).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalled();
    });
  });

  describe('getBalanceAuxiliary', () => {
    beforeEach(() => {
      req = {
        query: {
          companyId: '1',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        },
      };
    });

    it('devrait générer la balance auxiliaire avec succès', async () => {
      Company.findByPk.mockResolvedValue({ id: 1, name: 'Test Company' });

      JournalEntryLine.findAll.mockResolvedValue([
        {
          dataValues: {
            totalDebit: '15000.00',
            totalCredit: '10000.00',
          },
          ThirdParty: {
            id: 1,
            code: 'CLI001',
            name: 'Client Test',
            type: 'CUSTOMER',
            email: 'client@test.fr',
          },
        },
      ]);

      await getBalanceAuxiliary(req, res);

      expect(Company.findByPk).toHaveBeenCalledWith('1');
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          balanceAuxiliary: expect.arrayContaining([
            expect.objectContaining({
              thirdPartyCode: 'CLI001',
              thirdPartyName: 'Client Test',
              debit: '15000.00',
              credit: '10000.00',
              balance: '5000.00',
              balanceType: 'DEBIT',
            }),
          ]),
          totals: expect.any(Object),
          count: 1,
        }),
        200,
        'Balance auxiliaire générée avec succès',
      );
    });

    it('devrait retourner une erreur si companyId manquant', async () => {
      req.query.companyId = undefined;

      await getBalanceAuxiliary(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        "ID de l'entreprise requis",
        expect.objectContaining({ field: 'companyId' }),
      );
    });

    it('devrait filtrer par type de tiers', async () => {
      req.query.thirdPartyType = 'SUPPLIER';
      Company.findByPk.mockResolvedValue({ id: 1 });

      await getBalanceAuxiliary(req, res);

      // ✅ sequelize.query est appelée, pas JournalEntryLine.findAll
      expect(response.success).toHaveBeenCalled();
    });
  });

  describe('getGeneralLedger', () => {
    beforeEach(() => {
      req = {
        query: {
          companyId: '1',
          accountId: '1',
          startDate: '2025-01-01',
          endDate: '2025-12-31',
        },
      };
    });

    it('devrait générer le grand livre avec succès', async () => {
      Company.findByPk.mockResolvedValue({ id: 1, name: 'Test Company' });

      ChartOfAccount.findOne.mockResolvedValue({
        id: 1,
        accountNumber: '411',
        accountName: 'Clients',
        accountType: 'ASSET',
      });

      JournalEntryLine.findAll.mockResolvedValue([
        {
          id: 1,
          debit: 5000.0,
          credit: 0.0,
          description: 'Facture FV001',
          JournalEntry: {
            id: 1,
            entryNumber: 'VT/202501/0001',
            entryDate: new Date('2025-01-15'),
            description: 'Vente marchandises',
            journalCode: 'VT',
          },
          ThirdParty: {
            id: 1,
            code: 'CLI001',
            name: 'Client Test',
          },
        },
        {
          id: 2,
          debit: 0.0,
          credit: 2000.0,
          description: 'Paiement',
          JournalEntry: {
            id: 2,
            entryNumber: 'BQ/202501/0001',
            entryDate: new Date('2025-01-20'),
            description: 'Encaissement',
            journalCode: 'BQ',
          },
          ThirdParty: {
            id: 1,
            code: 'CLI001',
            name: 'Client Test',
          },
        },
      ]);

      await getGeneralLedger(req, res);

      expect(Company.findByPk).toHaveBeenCalledWith('1');
      expect(ChartOfAccount.findOne).toHaveBeenCalled();
      expect(JournalEntryLine.findAll).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          account: expect.objectContaining({
            accountNumber: '411',
            accountName: 'Clients',
          }),
          movements: expect.arrayContaining([
            expect.objectContaining({
              entryNumber: 'VT/202501/0001',
              debit: '5000.00',
              credit: '0.00',
              balance: '5000.00',
            }),
            expect.objectContaining({
              entryNumber: 'BQ/202501/0001',
              debit: '0.00',
              credit: '2000.00',
              balance: '3000.00',
            }),
          ]),
          totals: expect.objectContaining({
            finalBalance: '3000.00',
          }),
          count: 2,
        }),
        200,
        'Grand livre généré avec succès',
      );
    });

    it('devrait retourner une erreur si companyId manquant', async () => {
      req.query.companyId = undefined;

      await getGeneralLedger(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        "ID de l'entreprise requis",
        expect.objectContaining({ field: 'companyId' }),
      );
    });

    it('devrait retourner une erreur si accountId manquant', async () => {
      req.query.accountId = undefined;

      await getGeneralLedger(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        'ID du compte requis',
        expect.objectContaining({ field: 'accountId' }),
      );
    });

    it('devrait retourner une erreur si compte non trouvé', async () => {
      Company.findByPk.mockResolvedValue({ id: 1 });
      ChartOfAccount.findOne.mockResolvedValue(null);

      await getGeneralLedger(req, res);

      expect(response.notFound).toHaveBeenCalledWith(res, 'Compte non trouvé');
    });
  });

  describe('getIncomeStatement', () => {
    beforeEach(() => {
      req = {
        query: {
          companyId: '1',
          fiscalYear: '2025',
        },
      };
    });

    it('devrait générer le compte de résultat avec fiscalYear', async () => {
      Company.findByPk.mockResolvedValue({ id: 1, name: 'Test Company' });

      // Mock charges (classe 6)
      JournalEntryLine.findAll
        .mockResolvedValueOnce([
          {
            dataValues: {
              totalDebit: '50000.00',
              totalCredit: '0.00',
            },
            ChartOfAccount: {
              id: 1,
              accountNumber: '601',
              accountName: 'Achats de marchandises',
              accountType: 'EXPENSE',
            },
          },
        ])
        // Mock produits (classe 7)
        .mockResolvedValueOnce([
          {
            dataValues: {
              totalDebit: '0.00',
              totalCredit: '80000.00',
            },
            ChartOfAccount: {
              id: 2,
              accountNumber: '701',
              accountName: 'Ventes de marchandises',
              accountType: 'REVENUE',
            },
          },
        ]);

      await getIncomeStatement(req, res);

      expect(Company.findByPk).toHaveBeenCalledWith('1');
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          charges: expect.arrayContaining([
            expect.objectContaining({
              accountNumber: '601',
              accountName: 'Achats de marchandises',
              amount: '50000.00',
            }),
          ]),
          produits: expect.arrayContaining([
            expect.objectContaining({
              accountNumber: '701',
              accountName: 'Ventes de marchandises',
              amount: '80000.00',
            }),
          ]),
          totals: expect.objectContaining({
            totalCharges: '50000.00',
            totalProduits: '80000.00',
            resultat: '30000.00',
            resultatType: 'BENEFICE',
          }),
          period: expect.objectContaining({
            fiscalYear: '2025',
          }),
        }),
        200,
        'Compte de résultat généré avec succès',
      );
    });

    it('devrait générer le compte de résultat avec startDate et endDate', async () => {
      req.query = {
        companyId: '1',
        startDate: '2025-01-01',
        endDate: '2025-06-30',
      };

      Company.findByPk.mockResolvedValue({ id: 1 });
      JournalEntryLine.findAll.mockResolvedValue([]);

      await getIncomeStatement(req, res);

      expect(response.success).toHaveBeenCalled();
    });

    it('devrait retourner une erreur si companyId manquant', async () => {
      req.query.companyId = undefined;

      await getIncomeStatement(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        "ID de l'entreprise requis",
        expect.objectContaining({ field: 'companyId' }),
      );
    });

    it('devrait retourner une erreur si période non fournie', async () => {
      req.query = { companyId: '1' };
      Company.findByPk.mockResolvedValue({ id: 1 });

      await getIncomeStatement(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        'Période requise (fiscalYear ou startDate+endDate)',
      );
    });

    it('devrait calculer une perte si charges > produits', async () => {
      Company.findByPk.mockResolvedValue({ id: 1 });

      // Charges > Produits
      JournalEntryLine.findAll
        .mockResolvedValueOnce([
          {
            dataValues: {
              totalDebit: '100000.00',
              totalCredit: '0.00',
            },
            ChartOfAccount: {
              id: 1,
              accountNumber: '601',
              accountName: 'Achats',
              accountType: 'EXPENSE',
            },
          },
        ])
        .mockResolvedValueOnce([
          {
            dataValues: {
              totalDebit: '0.00',
              totalCredit: '50000.00',
            },
            ChartOfAccount: {
              id: 2,
              accountNumber: '701',
              accountName: 'Ventes',
              accountType: 'REVENUE',
            },
          },
        ]);

      await getIncomeStatement(req, res);

      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          totals: expect.objectContaining({
            resultat: '-50000.00',
            resultatType: 'PERTE',
          }),
        }),
        200,
        expect.any(String),
      );
    });
  });

  describe('getBalanceSheet', () => {
    beforeEach(() => {
      req = {
        query: {
          companyId: '1',
          date: '2025-12-31',
        },
      };
    });

    it('devrait générer le bilan comptable avec succès', async () => {
      Company.findByPk.mockResolvedValue({ id: 1, name: 'Test Company' });

      // Mock actif
      JournalEntryLine.findAll
        .mockResolvedValueOnce([
          {
            dataValues: {
              totalDebit: '100000.00',
              totalCredit: '20000.00',
            },
            ChartOfAccount: {
              id: 1,
              accountNumber: '2154',
              accountName: 'Matériel',
              accountType: 'ASSET',
            },
          },
          {
            dataValues: {
              totalDebit: '50000.00',
              totalCredit: '10000.00',
            },
            ChartOfAccount: {
              id: 2,
              accountNumber: '411',
              accountName: 'Clients',
              accountType: 'ASSET',
            },
          },
        ])
        // Mock passif
        .mockResolvedValueOnce([
          {
            dataValues: {
              totalDebit: '0.00',
              totalCredit: '100000.00',
            },
            ChartOfAccount: {
              id: 3,
              accountNumber: '101',
              accountName: 'Capital',
              accountType: 'EQUITY',
            },
          },
          {
            dataValues: {
              totalDebit: '10000.00',
              totalCredit: '30000.00',
            },
            ChartOfAccount: {
              id: 4,
              accountNumber: '401',
              accountName: 'Fournisseurs',
              accountType: 'LIABILITY',
            },
          },
        ]);

      await getBalanceSheet(req, res);

      expect(Company.findByPk).toHaveBeenCalledWith('1');
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          actif: expect.arrayContaining([
            expect.objectContaining({
              accountNumber: '2154',
              amount: '80000.00', // 100000 - 20000
            }),
            expect.objectContaining({
              accountNumber: '411',
              amount: '40000.00', // 50000 - 10000
            }),
          ]),
          passif: expect.arrayContaining([
            expect.objectContaining({
              accountNumber: '101',
              amount: '100000.00',
            }),
            expect.objectContaining({
              accountNumber: '401',
              amount: '20000.00', // 30000 - 10000
            }),
          ]),
          totals: expect.objectContaining({
            totalActif: '120000.00',
            totalPassif: '120000.00',
            difference: '0.00',
            isBalanced: true,
          }),
        }),
        200,
        'Bilan comptable généré avec succès',
      );
    });

    it('devrait retourner une erreur si companyId manquant', async () => {
      req.query.companyId = undefined;

      await getBalanceSheet(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        "ID de l'entreprise requis",
        expect.objectContaining({ field: 'companyId' }),
      );
    });

    it('devrait utiliser la date du jour si non fournie', async () => {
      req.query.date = undefined;
      Company.findByPk.mockResolvedValue({ id: 1 });
      JournalEntryLine.findAll.mockResolvedValue([]);

      await getBalanceSheet(req, res);

      expect(response.success).toHaveBeenCalled();
    });

    it('devrait détecter un bilan déséquilibré', async () => {
      Company.findByPk.mockResolvedValue({ id: 1 });

      // Actif != Passif
      JournalEntryLine.findAll
        .mockResolvedValueOnce([
          {
            dataValues: {
              totalDebit: '100000.00',
              totalCredit: '0.00',
            },
            ChartOfAccount: {
              id: 1,
              accountNumber: '2154',
              accountName: 'Matériel',
              accountType: 'ASSET',
            },
          },
        ])
        .mockResolvedValueOnce([
          {
            dataValues: {
              totalDebit: '0.00',
              totalCredit: '95000.00',
            },
            ChartOfAccount: {
              id: 3,
              accountNumber: '101',
              accountName: 'Capital',
              accountType: 'EQUITY',
            },
          },
        ]);

      await getBalanceSheet(req, res);

      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          totals: expect.objectContaining({
            isBalanced: false,
            difference: '5000.00',
          }),
        }),
        200,
        expect.any(String),
      );
    });
  });
});
