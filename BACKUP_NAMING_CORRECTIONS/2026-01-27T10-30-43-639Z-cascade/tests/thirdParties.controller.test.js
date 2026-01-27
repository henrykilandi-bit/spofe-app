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
  ThirdParty: {
    findAndCountAll: vi.fn(),
    findByPk: vi.fn(),
    findOne: vi.fn(),
    findAll: vi.fn(),
    create: vi.fn(),
    destroy: vi.fn(),
  },
  Company: {
    findByPk: vi.fn(),
  },
}));

import {
  getAllThirdParties,
  getThirdPartyById,
  createThirdParty,
  updateThirdParty,
  deleteThirdParty,
  toggleBlockThirdParty,
  searchThirdParties,
} from '../src/controllers/thirdParties.controller.js';
import * as response from '../src/utils/response.js';
import { ThirdParty, Company } from '../src/models/index.js';

describe('ThirdParties Controller', () => {
  let req, res;

  beforeEach(() => {
    vi.clearAllMocks();
    res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    };
  });

  describe('getAllThirdParties', () => {
    beforeEach(() => {
      req = {
        query: {
          companyId: '1',
          page: '1',
          limit: '50',
        },
      };
    });

    it('devrait retourner une liste paginée de tiers', async () => {
      Company.findByPk.mockResolvedValue({ id: 1, name: 'Test Company' });
      ThirdParty.findAndCountAll.mockResolvedValue({
        count: 2,
        rows: [
          { id: 1, code: 'CLI001', name: 'Client 1', type: 'CUSTOMER' },
          { id: 2, code: 'FOU001', name: 'Fournisseur 1', type: 'SUPPLIER' },
        ],
      });

      await getAllThirdParties(req, res);

      expect(Company.findByPk).toHaveBeenCalledWith('1');
      expect(ThirdParty.findAndCountAll).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          thirdParties: expect.any(Array),
          pagination: expect.objectContaining({
            total: 2,
            page: 1,
            limit: 50,
            pages: 1,
          }),
        }),
        200,
        'Tiers récupérés avec succès',
      );
    });

    it('devrait filtrer par type', async () => {
      req.query.type = 'CUSTOMER';
      Company.findByPk.mockResolvedValue({ id: 1 });
      ThirdParty.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, code: 'CLI001', name: 'Client 1', type: 'CUSTOMER' }],
      });

      await getAllThirdParties(req, res);

      expect(ThirdParty.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'CUSTOMER',
          }),
        }),
      );
    });

    it('devrait filtrer par isActive', async () => {
      req.query.isActive = 'true';
      Company.findByPk.mockResolvedValue({ id: 1 });
      ThirdParty.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, code: 'CLI001', name: 'Client 1', isActive: true }],
      });

      await getAllThirdParties(req, res);

      expect(ThirdParty.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            isActive: true,
          }),
        }),
      );
    });

    it('devrait effectuer une recherche multi-champs', async () => {
      req.query.search = 'test';
      Company.findByPk.mockResolvedValue({ id: 1 });
      ThirdParty.findAndCountAll.mockResolvedValue({
        count: 1,
        rows: [{ id: 1, code: 'TEST001', name: 'Test Client' }],
      });

      await getAllThirdParties(req, res);

      expect(ThirdParty.findAndCountAll).toHaveBeenCalled();
    });

    it('devrait retourner une erreur si companyId manquant', async () => {
      req.query.companyId = undefined;

      await getAllThirdParties(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        "ID de l'entreprise requis",
        expect.objectContaining({ field: 'companyId' }),
      );
    });

    it("devrait retourner une erreur si company n'existe pas", async () => {
      Company.findByPk.mockResolvedValue(null);

      await getAllThirdParties(req, res);

      expect(response.notFound).toHaveBeenCalledWith(res, 'Entreprise non trouvée');
    });
  });

  describe('getThirdPartyById', () => {
    beforeEach(() => {
      req = {
        params: { id: '1' },
      };
    });

    it('devrait retourner un tiers par son ID', async () => {
      const mockData = {
        id: 1,
        code: 'CLI001',
        name: 'Client Test',
        type: 'CUSTOMER',
        Company: { id: 1, name: 'Test Company' },
      };
      ThirdParty.findByPk.mockResolvedValue(mockData);

      await getThirdPartyById(req, res);

      expect(ThirdParty.findByPk).toHaveBeenCalledWith('1', expect.any(Object));
      expect(response.success).toHaveBeenCalledWith(
        res,
        mockData,
        200,
        'Tiers récupéré avec succès',
      );
    });

    it('devrait retourner une erreur si tiers non trouvé', async () => {
      ThirdParty.findByPk.mockResolvedValue(null);

      await getThirdPartyById(req, res);

      expect(response.notFound).toHaveBeenCalledWith(res, 'Tiers non trouvé');
    });
  });

  describe('createThirdParty', () => {
    beforeEach(() => {
      req = {
        body: {
          companyId: 1,
          type: 'CUSTOMER',
          code: 'CLI001',
          name: 'Nouveau Client',
          email: 'client@test.com',
          siret: '12345678901234',
        },
      };
    });

    it('devrait créer un nouveau tiers avec succès', async () => {
      const mockCreated = { id: 1, ...req.body };
      Company.findByPk.mockResolvedValue({ id: 1, name: 'Test Company' });
      ThirdParty.findOne.mockResolvedValue(null); // Pas de doublon
      ThirdParty.create.mockResolvedValue(mockCreated);

      await createThirdParty(req, res);

      expect(Company.findByPk).toHaveBeenCalledWith(1);
      expect(ThirdParty.findOne).toHaveBeenCalledTimes(2); // Code + SIRET
      expect(ThirdParty.create).toHaveBeenCalledWith(
        expect.objectContaining({
          companyId: 1,
          type: 'CUSTOMER',
          code: 'CLI001',
          name: 'Nouveau Client',
        }),
      );
      expect(response.success).toHaveBeenCalledWith(
        res,
        mockCreated,
        201,
        'Tiers créé avec succès',
      );
    });

    it("devrait retourner une erreur si company n'existe pas", async () => {
      Company.findByPk.mockResolvedValue(null);

      await createThirdParty(req, res);

      expect(response.notFound).toHaveBeenCalledWith(res, 'Entreprise non trouvée');
    });

    it('devrait retourner une erreur si code existe déjà pour cette entreprise', async () => {
      Company.findByPk.mockResolvedValue({ id: 1 });
      ThirdParty.findOne.mockResolvedValueOnce({ id: 2, code: 'CLI001' }); // Code doublon

      await createThirdParty(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        'Ce code de tiers existe déjà pour cette entreprise',
        expect.objectContaining({ field: 'code', value: 'CLI001' }),
      );
    });

    it('devrait retourner une erreur si SIRET existe déjà', async () => {
      Company.findByPk.mockResolvedValue({ id: 1 });
      ThirdParty.findOne
        .mockResolvedValueOnce(null) // Code OK
        .mockResolvedValueOnce({ id: 3, siret: '12345678901234' }); // SIRET doublon

      await createThirdParty(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        'Ce numéro SIRET est déjà enregistré',
        expect.objectContaining({ field: 'siret', value: '12345678901234' }),
      );
    });

    it('devrait accepter la création sans SIRET', async () => {
      req.body.siret = undefined;
      const mockCreated = { id: 1, ...req.body };
      Company.findByPk.mockResolvedValue({ id: 1 });
      ThirdParty.findOne.mockResolvedValue(null);
      ThirdParty.create.mockResolvedValue(mockCreated);

      await createThirdParty(req, res);

      expect(ThirdParty.findOne).toHaveBeenCalledTimes(1); // Seulement code, pas SIRET
      expect(response.success).toHaveBeenCalled();
    });

    it('devrait créer un tiers avec coordonnées bancaires complètes', async () => {
      req.body.iban = 'FR7630006000011234567890189';
      req.body.bic = 'BNPAFRPPXXX';
      req.body.bankCode = '30006';
      req.body.branchCode = '00001';
      req.body.accountNumber = '12345678901';
      req.body.ribKey = '89';

      Company.findByPk.mockResolvedValue({ id: 1 });
      ThirdParty.findOne.mockResolvedValue(null);
      ThirdParty.create.mockResolvedValue({ id: 1, ...req.body });

      await createThirdParty(req, res);

      expect(ThirdParty.create).toHaveBeenCalledWith(
        expect.objectContaining({
          iban: 'FR7630006000011234567890189',
          bic: 'BNPAFRPPXXX',
          bankCode: '30006',
        }),
      );
    });
  });

  describe('updateThirdParty', () => {
    beforeEach(() => {
      req = {
        params: { id: '1' },
        body: {
          name: 'Nom Modifié',
          email: 'nouveau@test.com',
        },
      };
    });

    it('devrait mettre à jour un tiers avec succès', async () => {
      const mockThirdPartyInstance = {
        id: 1,
        code: 'CLI001',
        name: 'Ancien Nom',
        siret: '12345678901234',
        update: vi.fn().mockResolvedValue({
          id: 1,
          name: 'Nom Modifié',
          email: 'nouveau@test.com',
        }),
        reload: vi.fn().mockResolvedValue({
          id: 1,
          name: 'Nom Modifié',
          Company: { id: 1, name: 'Test Company' },
        }),
      };

      ThirdParty.findByPk.mockResolvedValue(mockThirdPartyInstance);
      ThirdParty.findOne.mockResolvedValue(null); // Pas de doublon SIRET

      await updateThirdParty(req, res);

      expect(mockThirdPartyInstance.update).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.any(Object),
        200,
        'Tiers mis à jour avec succès',
      );
    });

    it('devrait retourner une erreur si tiers non trouvé', async () => {
      ThirdParty.findByPk.mockResolvedValue(null);

      await updateThirdParty(req, res);

      expect(response.notFound).toHaveBeenCalledWith(res, 'Tiers non trouvé');
    });

    it('devrait retourner une erreur si nouveau SIRET existe déjà', async () => {
      req.body.siret = '98765432109876';

      const mockThirdPartyInstance = {
        id: 1,
        siret: '12345678901234',
        update: vi.fn(),
      };

      ThirdParty.findByPk.mockResolvedValue(mockThirdPartyInstance);
      ThirdParty.findOne.mockResolvedValue({ id: 2, siret: '98765432109876' }); // SIRET doublon

      await updateThirdParty(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        'Ce numéro SIRET est déjà enregistré',
        expect.objectContaining({ field: 'siret', value: '98765432109876' }),
      );
    });

    it('ne devrait pas modifier le code ou companyId', async () => {
      req.body.code = 'NEWCODE';
      req.body.companyId = 999;

      const mockThirdPartyInstance = {
        id: 1,
        code: 'CLI001',
        companyId: 1,
        update: vi.fn().mockResolvedValue({ id: 1 }),
        reload: vi.fn().mockResolvedValue({ id: 1, Company: {} }),
      };

      ThirdParty.findByPk.mockResolvedValue(mockThirdPartyInstance);
      ThirdParty.findOne.mockResolvedValue(null);

      await updateThirdParty(req, res);

      expect(mockThirdPartyInstance.update).toHaveBeenCalledWith(
        expect.not.objectContaining({
          code: 'NEWCODE',
          companyId: 999,
        }),
      );
    });

    it('devrait accepter la mise à jour sans changement de SIRET', async () => {
      const mockThirdPartyInstance = {
        id: 1,
        siret: '12345678901234',
        update: vi.fn().mockResolvedValue({ id: 1 }),
        reload: vi.fn().mockResolvedValue({ id: 1, Company: {} }),
      };

      ThirdParty.findByPk.mockResolvedValue(mockThirdPartyInstance);

      await updateThirdParty(req, res);

      // findOne ne doit pas être appelé si SIRET non modifié
      expect(ThirdParty.findOne).not.toHaveBeenCalled();
    });
  });

  describe('deleteThirdParty', () => {
    beforeEach(() => {
      req = {
        params: { id: '1' },
        query: {},
      };
    });

    it('devrait effectuer une suppression soft (isActive=false) par défaut', async () => {
      const mockThirdPartyInstance = {
        id: 1,
        code: 'CLI001',
        name: 'Client Test',
        isActive: true,
        update: vi.fn().mockResolvedValue({
          id: 1,
          isActive: false,
        }),
      };

      ThirdParty.findByPk.mockResolvedValue(mockThirdPartyInstance);

      await deleteThirdParty(req, res);

      expect(mockThirdPartyInstance.update).toHaveBeenCalledWith({ isActive: false });
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.any(Object),
        200,
        'Tiers désactivé avec succès',
      );
    });

    it('devrait effectuer une suppression définitive si permanent=true', async () => {
      req.query.permanent = 'true';

      const mockThirdPartyInstance = {
        id: 1,
        code: 'CLI001',
        destroy: vi.fn().mockResolvedValue(),
      };

      ThirdParty.findByPk.mockResolvedValue(mockThirdPartyInstance);

      await deleteThirdParty(req, res);

      expect(mockThirdPartyInstance.destroy).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalledWith(
        res,
        null,
        200,
        'Tiers supprimé définitivement',
      );
    });

    it('devrait retourner une erreur si tiers non trouvé', async () => {
      ThirdParty.findByPk.mockResolvedValue(null);

      await deleteThirdParty(req, res);

      expect(response.notFound).toHaveBeenCalledWith(res, 'Tiers non trouvé');
    });
  });

  describe('toggleBlockThirdParty', () => {
    beforeEach(() => {
      req = {
        params: { id: '1' },
        body: {
          block: true,
          reason: 'Impayé depuis 3 mois',
        },
      };
    });

    it('devrait bloquer un tiers avec une raison', async () => {
      const mockThirdPartyInstance = {
        id: 1,
        code: 'CLI001',
        isBlocked: false,
        notes: 'Notes existantes',
        update: vi.fn().mockResolvedValue({
          id: 1,
          isBlocked: true,
          notes: expect.stringContaining('Blocage: Impayé depuis 3 mois'),
        }),
      };

      ThirdParty.findByPk.mockResolvedValue(mockThirdPartyInstance);

      await toggleBlockThirdParty(req, res);

      expect(mockThirdPartyInstance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isBlocked: true,
          notes: expect.stringContaining('Blocage: Impayé depuis 3 mois'),
        }),
      );
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.any(Object),
        200,
        'Tiers bloqué avec succès',
      );
    });

    it('devrait débloquer un tiers', async () => {
      req.body.block = false;
      req.body.reason = 'Paiement reçu';

      const mockThirdPartyInstance = {
        id: 1,
        isBlocked: true,
        notes: '',
        update: vi.fn().mockResolvedValue({
          id: 1,
          isBlocked: false,
        }),
      };

      ThirdParty.findByPk.mockResolvedValue(mockThirdPartyInstance);

      await toggleBlockThirdParty(req, res);

      expect(mockThirdPartyInstance.update).toHaveBeenCalledWith(
        expect.objectContaining({
          isBlocked: false,
        }),
      );
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.any(Object),
        200,
        'Tiers débloqué avec succès',
      );
    });

    it('devrait retourner une erreur si tiers non trouvé', async () => {
      ThirdParty.findByPk.mockResolvedValue(null);

      await toggleBlockThirdParty(req, res);

      expect(response.notFound).toHaveBeenCalledWith(res, 'Tiers non trouvé');
    });

    it('devrait bloquer sans raison', async () => {
      req.body.reason = undefined;

      const mockThirdPartyInstance = {
        id: 1,
        isBlocked: false,
        notes: null,
        update: vi.fn().mockResolvedValue({ id: 1, isBlocked: true }),
      };

      ThirdParty.findByPk.mockResolvedValue(mockThirdPartyInstance);

      await toggleBlockThirdParty(req, res);

      expect(mockThirdPartyInstance.update).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalled();
    });
  });

  describe('searchThirdParties', () => {
    beforeEach(() => {
      req = {
        query: {
          companyId: '1',
          search: 'client',
        },
      };
    });

    it('devrait effectuer une recherche rapide de tiers', async () => {
      ThirdParty.findAll.mockResolvedValue([
        { id: 1, code: 'CLI001', name: 'Client 1', type: 'CUSTOMER' },
        { id: 2, code: 'CLI002', name: 'Client 2', type: 'CUSTOMER' },
      ]);

      await searchThirdParties(req, res);

      expect(ThirdParty.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            companyId: '1',
            isActive: true,
          }),
          attributes: expect.any(Array),
          order: expect.any(Array),
          limit: 50,
        }),
      );
      expect(response.success).toHaveBeenCalledWith(
        res,
        expect.objectContaining({
          thirdParties: expect.any(Array),
          total: 2,
        }),
        200,
        'Recherche effectuée avec succès',
      );
    });

    it('devrait filtrer par type dans la recherche', async () => {
      req.query.type = 'SUPPLIER';
      ThirdParty.findAll.mockResolvedValue([
        { id: 3, code: 'FOU001', name: 'Fournisseur 1', type: 'SUPPLIER' },
      ]);

      await searchThirdParties(req, res);

      expect(ThirdParty.findAll).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            type: 'SUPPLIER',
          }),
        }),
      );
    });

    it('devrait retourner une erreur si companyId manquant', async () => {
      req.query.companyId = undefined;

      await searchThirdParties(req, res);

      expect(response.badRequest).toHaveBeenCalledWith(
        res,
        "ID de l'entreprise requis",
        expect.objectContaining({ field: 'companyId' }),
      );
    });

    it('devrait rechercher sans terme de recherche (liste tous actifs)', async () => {
      req.query.search = undefined;
      ThirdParty.findAll.mockResolvedValue([
        { id: 1, code: 'CLI001', name: 'Client 1' },
        { id: 2, code: 'FOU001', name: 'Fournisseur 1' },
      ]);

      await searchThirdParties(req, res);

      expect(ThirdParty.findAll).toHaveBeenCalled();
      expect(response.success).toHaveBeenCalled();
    });
  });
});
