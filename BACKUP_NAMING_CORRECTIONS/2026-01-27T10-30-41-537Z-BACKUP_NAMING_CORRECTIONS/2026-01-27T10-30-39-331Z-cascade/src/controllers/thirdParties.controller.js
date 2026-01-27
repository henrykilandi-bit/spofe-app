import { ThirdParty, Company } from '../models/index.js';
import { success, error, notFound, badRequest, forbidden } from '../utils/response.js';
import { Op } from 'sequelize';

/**
 * Récupérer tous les tiers pour une entreprise
 * @route GET /api/third-parties
 * @param {Object} req - Requête Express (query: companyId, type, isActive, search)
 * @param {Object} res - Réponse Express
 */
export const getAllThirdParties = async (req, res) => {
  try {
    const { companyId, type, isActive, search, page = 1, limit = 50 } = req.query;

    if (!companyId) {
      return badRequest(res, 'ID de l\'entreprise requis', { field: 'companyId' });
    }

    // Vérifier que l'entreprise existe
    const company = await Company.findByPk(companyId);
    if (!company) {
      return notFound(res, 'Entreprise non trouvée');
    }

    const whereClause = { companyId };

    // Filtre par type
    if (type) {
      whereClause.type = type;
    }

    // Filtre actif/inactif
    if (isActive !== undefined) {
      whereClause.isActive = isActive === 'true';
    }

    // Recherche textuelle
    if (search) {
      whereClause[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { siret: { [Op.like]: `%${search}%` } }
      ];
    }

    const offset = (parseInt(page) - 1) * parseInt(limit);

    const { count, rows: thirdParties } = await ThirdParty.findAndCountAll({
      where: whereClause,
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset
    });

    success(res, {
      thirdParties,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    }, 200, 'Tiers récupérés avec succès');
  } catch (err) {
    console.error('Erreur lors de la récupération des tiers:', err);
    error(res, 'Une erreur est survenue lors de la récupération des tiers', 500);
  }
};

/**
 * Récupérer un tiers par son ID
 * @route GET /api/third-parties/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const getThirdPartyById = async (req, res) => {
  try {
    const { id } = req.params;

    const thirdParty = await ThirdParty.findByPk(id, {
      include: [
        {
          model: Company,
          attributes: ['id', 'name']
        }
      ]
    });

    if (!thirdParty) {
      return notFound(res, 'Tiers non trouvé');
    }

    success(res, thirdParty, 200, 'Tiers récupéré avec succès');
  } catch (err) {
    console.error('Erreur lors de la récupération du tiers:', err);
    error(res, 'Une erreur est survenue lors de la récupération du tiers', 500);
  }
};

/**
 * Créer un nouveau tiers
 * @route POST /api/third-parties
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const createThirdParty = async (req, res) => {
  try {
    const {
      companyId,
      type,
      code,
      name,
      legalForm,
      siret,
      vatNumber,
      email,
      phone,
      mobile,
      fax,
      website,
      address,
      addressComplement,
      postalCode,
      city,
      country,
      bankName,
      iban,
      bic,
      bankCode,
      branchCode,
      accountNumber,
      ribKey,
      paymentTerms,
      paymentMethod,
      discountRate,
      creditLimit,
      notes,
      contactPerson,
      contactEmail,
      contactPhone
    } = req.body;

    // Vérifier que l'entreprise existe
    const company = await Company.findByPk(companyId);
    if (!company) {
      return notFound(res, 'Entreprise non trouvée');
    }

    // Vérifier que le code n'existe pas déjà pour cette entreprise
    const existingThirdParty = await ThirdParty.findOne({
      where: {
        companyId,
        code
      }
    });

    if (existingThirdParty) {
      return badRequest(res, 'Ce code de tiers existe déjà pour cette entreprise', {
        field: 'code',
        value: code
      });
    }

    // Vérifier que le SIRET n'est pas déjà utilisé (s'il est fourni)
    if (siret) {
      const existingSiret = await ThirdParty.findOne({
        where: { siret }
      });

      if (existingSiret) {
        return badRequest(res, 'Ce numéro SIRET est déjà enregistré', {
          field: 'siret',
          value: siret
        });
      }
    }

    // Créer le tiers
    const newThirdParty = await ThirdParty.create({
      companyId,
      type,
      code,
      name,
      legalForm,
      siret,
      vatNumber,
      email,
      phone,
      mobile,
      fax,
      website,
      address,
      addressComplement,
      postalCode,
      city,
      country: country || 'France',
      bankName,
      iban,
      bic,
      bankCode,
      branchCode,
      accountNumber,
      ribKey,
      paymentTerms: paymentTerms || 30,
      paymentMethod: paymentMethod || 'TRANSFER',
      discountRate: discountRate || 0,
      creditLimit,
      notes,
      isActive: true,
      isBlocked: false,
      contactPerson,
      contactEmail,
      contactPhone
    });

    success(res, newThirdParty, 201, 'Tiers créé avec succès');
  } catch (err) {
    console.error('Erreur lors de la création du tiers:', err);
    error(res, 'Une erreur est survenue lors de la création du tiers', 500);
  }
};

/**
 * Mettre à jour un tiers existant
 * @route PUT /api/third-parties/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const updateThirdParty = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const thirdParty = await ThirdParty.findByPk(id);
    if (!thirdParty) {
      return notFound(res, 'Tiers non trouvé');
    }

    // Si SIRET modifié, vérifier qu'il n'est pas déjà utilisé
    if (updateData.siret && updateData.siret !== thirdParty.siret) {
      const existingSiret = await ThirdParty.findOne({
        where: {
          siret: updateData.siret,
          id: { [Op.ne]: id }
        }
      });

      if (existingSiret) {
        return badRequest(res, 'Ce numéro SIRET est déjà enregistré', {
          field: 'siret',
          value: updateData.siret
        });
      }
    }

    // Ne pas permettre de changer le code ou companyId
    delete updateData.code;
    delete updateData.companyId;

    // Mettre à jour le tiers
    await thirdParty.update(updateData);

    // Récupérer le tiers mis à jour
    const updatedThirdParty = await ThirdParty.findByPk(id, {
      include: [
        {
          model: Company,
          attributes: ['id', 'name']
        }
      ]
    });

    success(res, updatedThirdParty, 200, 'Tiers mis à jour avec succès');
  } catch (err) {
    console.error('Erreur lors de la mise à jour du tiers:', err);
    error(res, 'Une erreur est survenue lors de la mise à jour du tiers', 500);
  }
};

/**
 * Supprimer un tiers (soft delete - désactivation)
 * @route DELETE /api/third-parties/:id
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const deleteThirdParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { permanent = false } = req.query;

    const thirdParty = await ThirdParty.findByPk(id);
    if (!thirdParty) {
      return notFound(res, 'Tiers non trouvé');
    }

    // TODO: Vérifier qu'il n'y a pas d'écritures comptables associées
    // const entriesCount = await JournalEntryLine.count({ where: { thirdPartyId: id } });
    // if (entriesCount > 0) {
    //   return badRequest(res, 'Impossible de supprimer ce tiers: des écritures comptables y sont associées');
    // }

    if (permanent === 'true') {
      // Suppression permanente (admin uniquement)
      await thirdParty.destroy();
      success(res, null, 200, 'Tiers supprimé définitivement');
    } else {
      // Soft delete (désactivation)
      await thirdParty.update({ isActive: false });
      success(res, thirdParty, 200, 'Tiers désactivé avec succès');
    }
  } catch (err) {
    console.error('Erreur lors de la suppression du tiers:', err);
    error(res, 'Une erreur est survenue lors de la suppression du tiers', 500);
  }
};

/**
 * Bloquer/débloquer un tiers
 * @route POST /api/third-parties/:id/block
 * @param {Object} req - Requête Express
 * @param {Object} res - Réponse Express
 */
export const toggleBlockThirdParty = async (req, res) => {
  try {
    const { id } = req.params;
    const { block, reason } = req.body;

    const thirdParty = await ThirdParty.findByPk(id);
    if (!thirdParty) {
      return notFound(res, 'Tiers non trouvé');
    }

    await thirdParty.update({
      isBlocked: block,
      notes: reason ? `${thirdParty.notes || ''}\n[${new Date().toISOString()}] ${block ? 'Blocage' : 'Déblocage'}: ${reason}` : thirdParty.notes
    });

    success(res, thirdParty, 200, block ? 'Tiers bloqué avec succès' : 'Tiers débloqué avec succès');
  } catch (err) {
    console.error('Erreur lors du blocage/déblocage du tiers:', err);
    error(res, 'Une erreur est survenue lors du blocage/déblocage du tiers', 500);
  }
};

/**
 * Rechercher des tiers par critères
 * @route GET /api/third-parties/search
 * @param {Object} req - Requête Express (query: companyId, search, type)
 * @param {Object} res - Réponse Express
 */
export const searchThirdParties = async (req, res) => {
  try {
    const { companyId, search, type } = req.query;

    if (!companyId) {
      return badRequest(res, 'ID de l\'entreprise requis', { field: 'companyId' });
    }

    const whereClause = {
      companyId,
      isActive: true
    };

    // Recherche textuelle
    if (search) {
      whereClause[Op.or] = [
        { code: { [Op.like]: `%${search}%` } },
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Filtre par type
    if (type) {
      whereClause.type = type;
    }

    const thirdParties = await ThirdParty.findAll({
      where: whereClause,
      attributes: ['id', 'code', 'name', 'type', 'email', 'phone'],
      order: [['name', 'ASC']],
      limit: 50
    });

    success(res, {
      thirdParties,
      total: thirdParties.length
    }, 200, 'Recherche effectuée avec succès');
  } catch (err) {
    console.error('Erreur lors de la recherche de tiers:', err);
    error(res, 'Une erreur est survenue lors de la recherche', 500);
  }
};
