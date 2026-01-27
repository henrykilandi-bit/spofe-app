import { Op } from 'sequelize';
import { JournalEntry, Compagnie, sequelize } from '../models/index.js';
import { success, error, badRequest } from '../utils/response.js';

// 🧩 GET /api/journal-entries
export const getAllEntries = async (req, res) => {
  try {
    const companyId = req.user?.companyId || req.query.companyId;

    if (!companyId) {
      return error(res, 'ID de société manquant.', 400);
    }

    console.log('getAllEntries - companyId:', companyId, 'req.query:', req.query);

    const {
      page = 1,
      limit = 20,
      sortBy = 'entryDate',
      order = 'DESC',
      search = '',
      status,
    } = req.query;

    const offset = (page - 1) * limit;
    const where = { companyId: parseInt(companyId) };

    if (status) {
      where.status = status.toUpperCase();
    }

    if (search) {
      where[Op.or] = [
        { description: { [Op.like]: `%${search}%` } },
        { journalCode: { [Op.like]: `%${search}%` } },
        { entryNumber: { [Op.like]: `%${search}%` } },
      ];
    }

    console.log('getAllEntries - where clause:', where);

    const { count, rows } = await JournalEntry.findAndCountAll({
      where,
      order: [[sortBy, order.toUpperCase()]],
      offset: parseInt(offset),
      limit: parseInt(limit),
      include: [
        {
          model: Compagnie,
          attributes: ['id', 'name'],
        },
      ],
    });

    console.log('getAllEntries - result:', { count, rows: rows.length });

    return success(res, {
      entries: rows,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit)),
      }
    });
  } catch (err) {
    console.error('Erreur getAllEntries:', err);
    return error(
      res,
      'Une erreur est survenue lors de la récupération des écritures.',
      500,
      err.message
    );
  }
};

// 🧩 GET /api/journal-entries/:id
export const getEntryById = async (req, res) => {
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    const entry = await JournalEntry.findOne({
      where: { id, companyId },
      include: [
        { model: Compagnie, attributes: ['id', 'name'] },
      ],
    });

    if (!entry) {
      return error(res, 'Écriture non trouvée', 404);
    }

    return success(res, entry);
  } catch (err) {
    console.error('Erreur getEntryById:', err);
    return error(res, 'Erreur lors de la récupération de l\'écriture', 500);
  }
};

// 🧩 POST /api/journal-entries
export const createEntry = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const companyId = req.user?.companyId;
    const { journalCode, entryNumber, entryDate, description, totalDebit, totalCredit } = req.body;

    if (!companyId) {
      await transaction.rollback();
      return badRequest(res, 'ID de société requis');
    }

    // ✅ VALIDATION des champs obligatoires
    if (!journalCode || !entryDate) {
      await transaction.rollback();
      return badRequest(res, 'Champs requis: journalCode, entryDate');
    }

    const newEntry = await JournalEntry.create({
      companyId,
      journalCode,
      entryNumber,
      entryDate,
      description,
      totalDebit,
      totalCredit,
      status: 'POSTED',
    }, { transaction });

    await transaction.commit();
    return success(res, newEntry, 201, 'Écriture créée avec succès');
  } catch (err) {
    await transaction.rollback();
    console.error('Erreur createEntry:', err);
    return error(res, 'Erreur lors de la création de l\'écriture.', 500, err.message);
  }
};

// 🧩 PUT /api/journal-entries/:id
export const updateEntry = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    if (!companyId) {
      await transaction.rollback();
      return badRequest(res, 'ID de société requis');
    }

    const entry = await JournalEntry.findOne({ where: { id, companyId } });
    if (!entry) {
      await transaction.rollback();
      return error(res, 'Écriture non trouvée', 404);
    }

    await entry.update(req.body, { transaction });
    await transaction.commit();
    return success(res, entry, 200, 'Écriture mise à jour');
  } catch (err) {
    await transaction.rollback();
    console.error('Erreur updateEntry:', err);
    return error(res, 'Erreur lors de la mise à jour de l\'écriture', 500);
  }
};

// 🧩 DELETE /api/journal-entries/:id
export const deleteEntry = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    if (!companyId) {
      await transaction.rollback();
      return badRequest(res, 'ID de société requis');
    }

    const entry = await JournalEntry.findOne({ where: { id, companyId } });
    if (!entry) {
      await transaction.rollback();
      return error(res, 'Écriture non trouvée', 404);
    }

    await entry.destroy({ transaction });
    await transaction.commit();
    return success(res, { message: 'Écriture supprimée avec succès' });
  } catch (err) {
    await transaction.rollback();
    console.error('Erreur deleteEntry:', err);
    return error(res, 'Erreur lors de la suppression de l\'écriture', 500);
  }
};

// 🧩 POST /api/journal-entries/:id/validate
export const validateEntry = async (req, res) => {
  const transaction = await sequelize.transaction();
  
  try {
    const { id } = req.params;
    const companyId = req.user?.companyId;

    if (!companyId) {
      await transaction.rollback();
      return badRequest(res, 'ID de société requis');
    }

    const entry = await JournalEntry.findOne({ where: { id, companyId } });
    if (!entry) {
      await transaction.rollback();
      return error(res, 'Écriture non trouvée', 404);
    }

    // Validation: totalDebit doit égaler totalCredit
    if (entry.totalDebit !== entry.totalCredit) {
      await transaction.rollback();
      return badRequest(res, 'L\'écriture n\'est pas équilibrée (débit ≠ crédit)');
    }

    await entry.update({ status: 'VALIDATED' }, { transaction });
    await transaction.commit();
    return success(res, entry, 200, 'Écriture validée');
  } catch (err) {
    await transaction.rollback();
    console.error('Erreur validateEntry:', err);
    return error(res, 'Erreur lors de la validation de l\'écriture', 500);
  }
};

// ✅ Exports legacy pour rétrocompatibilité
export const getAllJournalEntries = getAllEntries;
export const getJournalEntryById = getEntryById;
export const createJournalEntry = createEntry;
export const updateJournalEntry = updateEntry;
export const deleteJournalEntry = deleteEntry;
