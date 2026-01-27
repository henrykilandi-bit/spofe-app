import { describe, it, expect, vi, beforeEach } from 'vitest';
import * as chartOfAccountsController from '../src/controllers/chartOfAccounts.controller.js';
import { ChartOfAccount, Company } from '../src/models/index.js';
import * as response from '../src/utils/response.js';

// Mock des modèles
vi.mock('../src/models/index.js', () => ({
  ChartOfAccount: {
    findAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    create: vi.fn(),
    count: vi.fn(),
  },
  Company: {
    findByPk: vi.fn(),
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

describe('ChartOfAccounts Controller', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    req = {
      query: {},
      params: {},
      body: {},
      user: { id: 1, role: 'admin' },
    };
    res = {};
    console.error = vi.fn(); // Silencer les logs d'erreur
  });

  describe('getAllAccounts', () => {
    it("devrait récupérer tous les comptes actifs d'une entreprise", async () => {
      req.query = { companyId: '1' };
      const mockCompany = { id: 1, name: 'Test Company' };
      const mockAccounts = [
        { id: 1, accountNumber: '101', accountName: 'Capital', isActive: true },
        { id: 2, accountNumber: '201', accountName: 'Immobilisations', isActive: true },
      ];

      Company.findByPk.mockResolvedValue(mockCompany);
      ChartOfAccount.findAll.mockResolvedValue(mockAccounts);

      await chartOfAccountsController.getAllAccounts(req, res);

      expect(Company.findByPk).toHaveBeenCalledWith('1');
      expect(ChartOfAccount.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: '1', isActive: true },
          order: [['accountNumber', 'ASC']],
        }),
      );
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          accounts: mockAccounts,
          total: 2,
          companyId: 1,
        }),
        200,
        'Plan comptable récupéré avec succès',
      );
    });

    it('devrait retourner une erreur si companyId est manquant', async () => {
      req.query = {};

      await chartOfAccountsController.getAllAccounts(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(res, "ID de l'entreprise requis");
    });

    it("devrait retourner notFound si l'entreprise n'existe pas", async () => {
      req.query = { companyId: '999' };
      Company.findByPk.mockResolvedValue(null);

      await chartOfAccountsController.getAllAccounts(req, res);

      expect(response.notFound).toHaveBeenCalledWith(res, 'Entreprise non trouvée');
    });

    it('devrait inclure les comptes inactifs si demandé', async () => {
      req.query = { companyId: '1', includeInactive: 'true' };
      Company.findByPk.mockResolvedValue({ id: 1 });
      ChartOfAccount.findAll.mockResolvedValue([]);

      await chartOfAccountsController.getAllAccounts(req, res);

      expect(ChartOfAccount.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { companyId: '1' }, // Pas de filtre isActive
        }),
      );
    });
  });

  describe('getAccountById', () => {
    it('devrait récupérer un compte par son ID avec ses relations', async () => {
      req.params = { id: '1' };
      const mockAccount = {
        id: 1,
        accountNumber: '101',
        accountName: 'Capital',
        parentAccount: null,
        subAccounts: [],
        Company: { id: 1, name: 'Test Company' },
      };

      ChartOfAccount.findByPk.mockResolvedValue(mockAccount);

      await chartOfAccountsController.getAccountById(req, res);

      expect(ChartOfAccount.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(response.success).toHaveBeenCalledWith(
        res,
        mockAccount,
        200,
        'Compte récupéré avec succès',
      );
    });

    it("devrait retourner notFound si le compte n'existe pas", async () => {
      req.params = { id: '999' };
      ChartOfAccount.findByPk.mockResolvedValue(null);

      await chartOfAccountsController.getAccountById(req, res);

      expect(response.notFound).toHaveBeenCalledWith(res, 'Compte non trouvé');
    });
  });

  describe('createAccount', () => {
    it('devrait créer un nouveau compte avec des données valides', async () => {
      req.body = {
        companyId: 1,
        accountNumber: '101',
        accountName: 'Capital',
        accountType: 'EQUITY',
        isActive: true,
      };

      const mockCompany = { id: 1, name: 'Test Company' };
      const mockNewAccount = { id: 1, ...req.body };

      Company.findByPk.mockResolvedValue(mockCompany);
      ChartOfAccount.findOne.mockResolvedValue(null); // Pas de doublon
      ChartOfAccount.create.mockResolvedValue(mockNewAccount);
      ChartOfAccount.findByPk.mockResolvedValue(mockNewAccount);

      await chartOfAccountsController.createAccount(req, res);

      expect(ChartOfAccount.create).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 1,
          accountNumber: '101',
          accountName: 'Capital',
          accountType: 'EQUITY',
          level: 1,
        }),
      );
      expect(response.success).toHaveBeenCalledWith(
        res,
        mockNewAccount,
        201,
        'Compte créé avec succès',
      );
    });

    it('devrait rejeter un numéro de compte invalide (OHADA)', async () => {
      req.body = {
        companyId: 1,
        accountNumber: '901', // Invalide: doit commencer par 1-8
        accountName: 'Invalid Account',
        accountType: 'OTHER',
      };

      Company.findByPk.mockResolvedValue({ id: 1 });
      ChartOfAccount.findOne.mockResolvedValue(null);

      await chartOfAccountsController.createAccount(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        'Numéro de compte OHADA invalide (doit commencer par 1-8 et contenir des chiffres)',
        expect.objectContaining({ field: 'accountNumber' }),
      );
    });

    it('devrait rejeter un numéro de compte en doublon', async () => {
      req.body = {
        companyId: 1,
        accountNumber: '101',
        accountName: 'Capital',
        accountType: 'EQUITY',
      };

      const existingAccount = { id: 2, accountNumber: '101', companyId: 1 };

      Company.findByPk.mockResolvedValue({ id: 1 });
      ChartOfAccount.findOne.mockResolvedValue(existingAccount);

      await chartOfAccountsController.createAccount(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        'Ce numéro de compte existe déjà pour cette entreprise',
        expect.objectContaining({
          field: 'accountNumber',
          value: '101',
        }),
      );
    });

    it('devrait créer un sous-compte avec parentAccountId', async () => {
      req.body = {
        companyId: 1,
        accountNumber: '1011',
        accountName: 'Capital souscrit',
        accountType: 'EQUITY',
        parentAccountId: 1,
      };

      const mockParent = {
        id: 1,
        accountNumber: '101',
        level: 1,
        allowSubAccounts: true,
        companyId: 1,
      };

      Company.findByPk.mockResolvedValue({ id: 1 });
      ChartOfAccount.findOne.mockResolvedValue(null);
      ChartOfAccount.findByPk.mockResolvedValueOnce(mockParent); // Pour parent
      ChartOfAccount.create.mockResolvedValue({ id: 2, ...req.body, level: 2 });
      ChartOfAccount.findByPk.mockResolvedValueOnce({ id: 2, ...req.body, level: 2 }); // Pour compte créé

      await chartOfAccountsController.createAccount(req, res);

      expect(ChartOfAccount.create).toHaveBeenCalledWith(
        expect.objectContaining({
          parentAccountId: 1,
          level: 2,
        }),
      );
    });

    it("devrait rejeter si parent n'autorise pas les sous-comptes", async () => {
      req.body = {
        companyId: 1,
        accountNumber: '1011',
        accountName: 'Sub Account',
        accountType: 'EQUITY',
        parentAccountId: 1,
      };

      const mockParent = { id: 1, allowSubAccounts: false, companyId: 1 };

      Company.findByPk.mockResolvedValue({ id: 1 });
      ChartOfAccount.findOne.mockResolvedValue(null);
      ChartOfAccount.findByPk.mockResolvedValue(mockParent);

      await chartOfAccountsController.createAccount(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        "Le compte parent n'autorise pas les sous-comptes",
      );
    });
  });

  describe('updateAccount', () => {
    it('devrait mettre à jour un compte existant', async () => {
      req.params = { id: '1' };
      req.body = {
        accountName: 'Capital mis à jour',
        isActive: false,
      };

      const mockAccount = {
        id: 1,
        accountNumber: '101',
        accountName: 'Capital',
        update: vi.fn().mockResolvedValue(true),
      };

      ChartOfAccount.findByPk.mockResolvedValueOnce(mockAccount);
      ChartOfAccount.count.mockResolvedValue(0); // Pas de sous-comptes
      ChartOfAccount.findByPk.mockResolvedValueOnce({
        ...mockAccount,
        accountName: 'Capital mis à jour',
        isActive: false,
      });

      await chartOfAccountsController.updateAccount(req, res);

      expect(mockAccount.update).toHaveBeenCalledWith(
        expect.objectContaining({
          accountName: 'Capital mis à jour',
          isActive: false,
        }),
      );
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.any(Object),
        200,
        'Compte mis à jour avec succès',
      );
    });

    it('devrait empêcher la désactivation de allowSubAccounts si sous-comptes existent', async () => {
      req.params = { id: '1' };
      req.body = { allowSubAccounts: false };

      const mockAccount = { id: 1, allowSubAccounts: true };

      ChartOfAccount.findByPk.mockResolvedValue(mockAccount);
      ChartOfAccount.count.mockResolvedValue(3); // 3 sous-comptes

      await chartOfAccountsController.updateAccount(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        'Impossible de désactiver les sous-comptes: ce compte a déjà des sous-comptes',
      );
    });
  });

  describe('deleteAccount', () => {
    it('devrait désactiver un compte (soft delete)', async () => {
      req.params = { id: '1' };
      req.query = {};

      const mockAccount = {
        id: 1,
        accountNumber: '101',
        update: vi.fn().mockResolvedValue(true),
      };

      ChartOfAccount.findByPk.mockResolvedValue(mockAccount);
      ChartOfAccount.count.mockResolvedValue(0); // Pas de sous-comptes

      await chartOfAccountsController.deleteAccount(req, res);

      expect(mockAccount.update).toHaveBeenCalledWith({ isActive: false });
      expect(response.success).toHaveBeenCalledWith(
        res,
        mockAccount,
        200,
        'Compte désactivé avec succès',
      );
    });

    it('devrait supprimer définitivement si permanent=true', async () => {
      req.params = { id: '1' };
      req.query = { permanent: 'true' };

      const mockAccount = {
        id: 1,
        destroy: vi.fn().mockResolvedValue(true),
      };

      ChartOfAccount.findByPk.mockResolvedValue(mockAccount);
      ChartOfAccount.count.mockResolvedValue(0);

      await chartOfAccountsController.deleteAccount(req, res);

      expect(mockAccount.destroy).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalledWith(
        res,
        null,
        200,
        'Compte supprimé définitivement',
      );
    });

    it('devrait rejeter si le compte a des sous-comptes', async () => {
      req.params = { id: '1' };

      ChartOfAccount.findByPk.mockResolvedValue({ id: 1 });
      ChartOfAccount.count.mockResolvedValue(5); // 5 sous-comptes

      await chartOfAccountsController.deleteAccount(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        'Impossible de supprimer ce compte: il possède des sous-comptes',
      );
    });
  });

  describe('searchAccounts', () => {
    it('devrait rechercher des comptes par numéro ou nom', async () => {
      req.query = { companyId: '1', search: '101' };

      const mockAccounts = [
        { id: 1, accountNumber: '101', accountName: 'Capital' },
        { id: 2, accountNumber: '1011', accountName: 'Capital souscrit' },
      ];

      ChartOfAccount.findAll.mockResolvedValue(mockAccounts);

      await chartOfAccountsController.searchAccounts(req, res);

      expect(ChartOfAccount.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: '1',
            isActive: true,
          }),
          limit: 50,
        }),
      );
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          accounts: mockAccounts,
          total: 2,
        }),
        200,
        'Recherche effectuée avec succès',
      );
    });

    it('devrait filtrer par type de compte', async () => {
      req.query = { companyId: '1', accountType: 'ASSETS' };

      ChartOfAccount.findAll.mockResolvedValue([]);

      await chartOfAccountsController.searchAccounts(req, res);

      expect(ChartOfAccount.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            accountType: 'ASSETS',
          }),
        }),
      );
    });
  });
});
