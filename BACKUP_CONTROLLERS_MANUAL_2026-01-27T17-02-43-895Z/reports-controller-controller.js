import { ChartOfAccount, JournalEntry, JournalEntryLine, Compagnie, ThirdParty, sequelize } from '../models/index.js';
import { success, error, notFound, badRequest } from '../utils/response.js';
import { Op } from 'sequelize';

/**
 * Récupérer la balance générale
 * @route GET /api/reports/balance
 * @param {Object} req - Requête Express (query: company_id, startDate, endDate, level)
 * @param {Object} res - Réponse Express
 */
export const getBalance = async (req, res) => {
  try {
    const { company_id, startDate, endDate, level } = req.query;

    if (!company_id) {
      return badRequest(res, 'ID de l\'entreprise requis', { field: 'company_id' });
    }

    // Vérifier que l'entreprise existe
    const company = await Compagnie.findByPk(company_id);
    if (!company) {
      return notFound(res, 'Entreprise non trouvée');
    }

    // Construire les filtres de date
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);

    const whereClause = {
      company_id: parseInt(company_id),
      status: 'POSTED' // Seulement les écritures validées
    };

    if (Object.keys(dateFilter).length > 0) {
      whereClause.entryDate = dateFilter;
    }

    // Filtre par niveau de compte (ex: niveau 1 = comptes 1 à 8)
    const accountWhere = { company_id: parseInt(company_id), is_active: true };
    if (level) {
      const levelInt = parseInt(level);
      // Niveau 1: comptes 1 chiffre (1-8)
      // Niveau 2: comptes 2 chiffres (10-89)
      // etc.
      if (levelInt === 1) {
        accountWhere.accountNumber = {
          [Op.regexp]: '^[1-8]$'
        };
      } else {
        accountWhere[Op.and] = [
          sequelize.where(sequelize.fn('LENGTH', sequelize.col('accountNumber')), '=', levelInt)
        ];
      }
    }

    // Requête SQL pour calculer les soldes
    const balanceData = await JournalEntryLine.findAll({
      attributes: [
        'accountId',
        [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit'],
        [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit']
      ],
      include: [
        {
          model: JournalEntry,
          attributes: [],
          where: whereClause,
          required: true
        },
        {
          model: ChartOfAccount,
          attributes: ['id', 'accountNumber', 'accountName', 'accountType', 'parentAccountId'],
          where: accountWhere,
          required: true
        }
      ],
      group: ['accountId', 'ChartOfAccount.id'],
      raw: false
    });

    // Calculer les soldes pour chaque compte
    const balanceItems = balanceData.map(item => {
      const debit = parseFloat(item.dataValues.totalDebit) || 0;
      const credit = parseFloat(item.dataValues.totalCredit) || 0;
      const balance = debit - credit;
      const account = item.ChartOfAccount;

      return {
        accountId: account.id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        accountType: account.accountType,
        debit: debit.toFixed(2),
        credit: credit.toFixed(2),
        balance: balance.toFixed(2),
        balanceType: balance >= 0 ? 'DEBIT' : 'CREDIT'
      };
    });

    // Calculer les totaux
    const totals = balanceItems.reduce((acc, item) => {
      acc.totalDebit += parseFloat(item.debit);
      acc.totalCredit += parseFloat(item.credit);
      return acc;
    }, { totalDebit: 0, totalCredit: 0 });

    success(res, {
      balance: balanceItems.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber)),
      totals: {
        totalDebit: totals.totalDebit.toFixed(2),
        totalCredit: totals.totalCredit.toFixed(2),
        difference: (totals.totalDebit - totals.totalCredit).toFixed(2)
      },
      filters: {
        company_id: parseInt(company_id),
        startDate: startDate || null,
        endDate: endDate || null,
        level: level ? parseInt(level) : null
      },
      count: balanceItems.length
    }, 200, 'Balance générale générée avec succès');
  } catch (err) {
    console.error('Erreur lors de la génération de la balance:', err);
    error(res, 'Une erreur est survenue lors de la génération de la balance', 500);
  }
};

/**
 * Récupérer la balance auxiliaire (par tiers)
 * @route GET /api/reports/balance-auxiliary
 * @param {Object} req - Requête Express (query: company_id, startDate, endDate, thirdPartyType)
 * @param {Object} res - Réponse Express
 */
export const getBalanceAuxiliary = async (req, res) => {
  try {
    const { company_id, startDate, endDate, thirdPartyType } = req.query;

    if (!company_id) {
      return badRequest(res, 'ID de l\'entreprise requis', { field: 'company_id' });
    }

    const company = await Compagnie.findByPk(company_id);
    if (!company) {
      return notFound(res, 'Entreprise non trouvée');
    }

    // Filtres de date
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);

    const whereClause = {
      company_id: parseInt(company_id),
      status: 'POSTED'
    };

    if (Object.keys(dateFilter).length > 0) {
      whereClause.entryDate = dateFilter;
    }

    // Filtre tiers par type
    const thirdPartyWhere = { company_id: parseInt(company_id), is_active: true };
    if (thirdPartyType) {
      thirdPartyWhere.type = thirdPartyType;
    }

    // Requête SQL explicite pour éviter les soucis d'alias Sequelize
    const queryFilters = [];
    const replacements = { company_id: parseInt(company_id) };

    if (startDate) {
      queryFilters.push('je.entry_date >= :startDate');
      replacements.startDate = startDate;
    }

    if (endDate) {
      queryFilters.push('je.entry_date <= :endDate');
      replacements.endDate = endDate;
    }

    if (thirdPartyType) {
      queryFilters.push('tp.type = :thirdPartyType');
      replacements.thirdPartyType = thirdPartyType;
    }

    const whereSql = queryFilters.length ? `AND ${queryFilters.join(' AND ')}` : '';

    const [auxiliaryRows] = await sequelize.query(
      `
      SELECT
        tp.id AS thirdPartyId,
        tp.code AS thirdPartyCode,
        tp.name AS thirdPartyName,
        tp.type AS thirdPartyType,
        tp.email AS thirdPartyEmail,
        SUM(jel.debit) AS totalDebit,
        SUM(jel.credit) AS totalCredit
      FROM journal_entry_lines jel
      JOIN journal_entries je ON je.id = jel.journal_entry_id
      JOIN third_parties tp ON tp.id = jel.third_party_id
      WHERE je.status = 'POSTED'
        AND je.company_id = :company_id
        AND tp.company_id = :company_id
        AND tp.is_active = 1
        AND jel.third_party_id IS NOT NULL
        ${whereSql}
      GROUP BY tp.id, tp.code, tp.name, tp.type, tp.email
      ORDER BY tp.code ASC
      `,
      { replacements }
    );

    // Calculer les soldes par tiers
    const auxiliaryItems = auxiliaryRows.map(item => {
      const debit = parseFloat(item.totalDebit) || 0;
      const credit = parseFloat(item.totalCredit) || 0;
      const balance = debit - credit;

      return {
        thirdPartyId: item.thirdPartyId,
        thirdPartyCode: item.thirdPartyCode,
        thirdPartyName: item.thirdPartyName,
        thirdPartyType: item.thirdPartyType,
        thirdPartyEmail: item.thirdPartyEmail,
        debit: debit.toFixed(2),
        credit: credit.toFixed(2),
        balance: balance.toFixed(2),
        balanceType: balance >= 0 ? 'DEBIT' : 'CREDIT'
      };
    });

    // Totaux
    const totals = auxiliaryItems.reduce((acc, item) => {
      acc.totalDebit += parseFloat(item.debit);
      acc.totalCredit += parseFloat(item.credit);
      if (item.balanceType === 'DEBIT') {
        acc.totalBalanceDebit += Math.abs(parseFloat(item.balance));
      } else {
        acc.totalBalanceCredit += Math.abs(parseFloat(item.balance));
      }
      return acc;
    }, { totalDebit: 0, totalCredit: 0, totalBalanceDebit: 0, totalBalanceCredit: 0 });

    success(res, {
      balanceAuxiliary: auxiliaryItems.sort((a, b) => a.thirdPartyCode.localeCompare(b.thirdPartyCode)),
      totals: {
        totalDebit: totals.totalDebit.toFixed(2),
        totalCredit: totals.totalCredit.toFixed(2),
        totalBalanceDebit: totals.totalBalanceDebit.toFixed(2),
        totalBalanceCredit: totals.totalBalanceCredit.toFixed(2)
      },
      filters: {
        company_id: parseInt(company_id),
        startDate: startDate || null,
        endDate: endDate || null,
        thirdPartyType: thirdPartyType || null
      },
      count: auxiliaryItems.length
    }, 200, 'Balance auxiliaire générée avec succès');
  } catch (err) {
    console.error('Erreur lors de la génération de la balance auxiliaire:', err);
    error(res, 'Une erreur est survenue lors de la génération de la balance auxiliaire', 500);
  }
};

/**
 * Récupérer le grand livre (mouvements détaillés par compte)
 * @route GET /api/reports/general-ledger
 * @param {Object} req - Requête Express (query: company_id, accountId, startDate, endDate)
 * @param {Object} res - Réponse Express
 */
export const getGeneralLedger = async (req, res) => {
  try {
    const { company_id, accountId, startDate, endDate } = req.query;

    if (!company_id) {
      return badRequest(res, 'ID de l\'entreprise requis', { field: 'company_id' });
    }

    if (!accountId) {
      return badRequest(res, 'ID du compte requis', { field: 'accountId' });
    }

    const company = await Compagnie.findByPk(company_id);
    if (!company) {
      return notFound(res, 'Entreprise non trouvée');
    }

    const account = await ChartOfAccount.findOne({
      where: {
        id: parseInt(accountId),
        company_id: parseInt(company_id)
      }
    });

    if (!account) {
      return notFound(res, 'Compte non trouvé');
    }

    // Filtres de date
    const dateFilter = {};
    if (startDate) dateFilter[Op.gte] = new Date(startDate);
    if (endDate) dateFilter[Op.lte] = new Date(endDate);

    const whereClause = {
      company_id: parseInt(company_id),
      status: 'POSTED'
    };

    if (Object.keys(dateFilter).length > 0) {
      whereClause.entryDate = dateFilter;
    }

    // Récupérer toutes les lignes du compte
    const lines = await JournalEntryLine.findAll({
      where: {
        accountId: parseInt(accountId)
      },
      include: [
        {
          model: JournalEntry,
          where: whereClause,
          required: true,
          attributes: ['id', 'entryNumber', 'entryDate', 'description', 'journalCode']
        },
        {
          model: ThirdParty,
          attributes: ['id', 'code', 'name'],
          required: false
        }
      ],
      order: [[JournalEntry, 'entryDate', 'ASC'], [JournalEntry, 'entryNumber', 'ASC']]
    });

    // Calculer le solde progressif
    let runningBalance = 0;
    const movements = lines.map(line => {
      const debit = parseFloat(line.debit) || 0;
      const credit = parseFloat(line.credit) || 0;
      runningBalance += debit - credit;

      return {
        lineId: line.id,
        entryId: line.JournalEntry.id,
        entryNumber: line.JournalEntry.entryNumber,
        entryDate: line.JournalEntry.entryDate,
        description: line.description || line.JournalEntry.description,
        journalCode: line.JournalEntry.journalCode,
        thirdParty: line.ThirdParty ? {
          id: line.ThirdParty.id,
          code: line.ThirdParty.code,
          name: line.ThirdParty.name
        } : null,
        debit: debit.toFixed(2),
        credit: credit.toFixed(2),
        balance: runningBalance.toFixed(2),
        balanceType: runningBalance >= 0 ? 'DEBIT' : 'CREDIT'
      };
    });

    // Totaux
    const totals = movements.reduce((acc, mov) => {
      acc.totalDebit += parseFloat(mov.debit);
      acc.totalCredit += parseFloat(mov.credit);
      return acc;
    }, { totalDebit: 0, totalCredit: 0 });

    success(res, {
      account: {
        id: account.id,
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        accountType: account.accountType
      },
      movements,
      totals: {
        totalDebit: totals.totalDebit.toFixed(2),
        totalCredit: totals.totalCredit.toFixed(2),
        finalBalance: runningBalance.toFixed(2),
        finalBalanceType: runningBalance >= 0 ? 'DEBIT' : 'CREDIT'
      },
      filters: {
        company_id: parseInt(company_id),
        accountId: parseInt(accountId),
        startDate: startDate || null,
        endDate: endDate || null
      },
      count: movements.length
    }, 200, 'Grand livre généré avec succès');
  } catch (err) {
    console.error('Erreur lors de la génération du grand livre:', err);
    error(res, 'Une erreur est survenue lors de la génération du grand livre', 500);
  }
};

/**
 * Récupérer le compte de résultat (Produits - Charges)
 * @route GET /api/reports/income-statement
 * @param {Object} req - Requête Express (query: company_id, fiscalYear ou startDate+endDate)
 * @param {Object} res - Réponse Express
 */
export const getIncomeStatement = async (req, res) => {
  try {
    const { company_id, fiscalYear, startDate, endDate } = req.query;

    if (!company_id) {
      return badRequest(res, 'ID de l\'entreprise requis', { field: 'company_id' });
    }

    const company = await Compagnie.findByPk(company_id);
    if (!company) {
      return notFound(res, 'Entreprise non trouvée');
    }

    // Déterminer la période
    let periodStart, periodEnd;
    if (fiscalYear) {
      periodStart = new Date(`${fiscalYear}-01-01`);
      periodEnd = new Date(`${fiscalYear}-12-31`);
    } else if (startDate && endDate) {
      periodStart = new Date(startDate);
      periodEnd = new Date(endDate);
    } else {
      return badRequest(res, 'Période requise (fiscalYear ou startDate+endDate)');
    }

    const whereClause = {
      company_id: parseInt(company_id),
      status: 'POSTED',
      entryDate: {
        [Op.gte]: periodStart,
        [Op.lte]: periodEnd
      }
    };

    // Charges (classe 6)
    const chargesData = await JournalEntryLine.findAll({
      attributes: [
        'accountId',
        [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit'],
        [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit']
      ],
      include: [
        {
          model: JournalEntry,
          attributes: [],
          where: whereClause,
          required: true
        },
        {
          model: ChartOfAccount,
          attributes: ['id', 'accountNumber', 'accountName', 'accountType'],
          where: {
            company_id: parseInt(company_id),
            accountNumber: { [Op.like]: '6%' },
            is_active: true
          },
          required: true
        }
      ],
      group: ['accountId', 'ChartOfAccount.id'],
      raw: false
    });

    // Produits (classe 7)
    const produitsData = await JournalEntryLine.findAll({
      attributes: [
        'accountId',
        [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit'],
        [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit']
      ],
      include: [
        {
          model: JournalEntry,
          attributes: [],
          where: whereClause,
          required: true
        },
        {
          model: ChartOfAccount,
          attributes: ['id', 'accountNumber', 'accountName', 'accountType'],
          where: {
            company_id: parseInt(company_id),
            accountNumber: { [Op.like]: '7%' },
            is_active: true
          },
          required: true
        }
      ],
      group: ['accountId', 'ChartOfAccount.id'],
      raw: false
    });

    // Calculer les charges
    const charges = chargesData.map(item => {
      const debit = parseFloat(item.dataValues.totalDebit) || 0;
      const credit = parseFloat(item.dataValues.totalCredit) || 0;
      const amount = debit - credit; // Les charges sont au débit
      const account = item.ChartOfAccount;

      return {
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        amount: amount.toFixed(2)
      };
    });

    // Calculer les produits
    const produits = produitsData.map(item => {
      const debit = parseFloat(item.dataValues.totalDebit) || 0;
      const credit = parseFloat(item.dataValues.totalCredit) || 0;
      const amount = credit - debit; // Les produits sont au crédit
      const account = item.ChartOfAccount;

      return {
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        amount: amount.toFixed(2)
      };
    });

    // Totaux
    const totalCharges = charges.reduce((sum, c) => sum + parseFloat(c.amount), 0);
    const totalProduits = produits.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const resultat = totalProduits - totalCharges;

    success(res, {
      charges: charges.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber)),
      produits: produits.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber)),
      totals: {
        totalCharges: totalCharges.toFixed(2),
        totalProduits: totalProduits.toFixed(2),
        resultat: resultat.toFixed(2),
        resultatType: resultat >= 0 ? 'BENEFICE' : 'PERTE'
      },
      period: {
        startDate: periodStart.toISOString().split('T')[0],
        endDate: periodEnd.toISOString().split('T')[0],
        fiscalYear: fiscalYear || null
      }
    }, 200, 'Compte de résultat généré avec succès');
  } catch (err) {
    console.error('Erreur lors de la génération du compte de résultat:', err);
    error(res, 'Une erreur est survenue lors de la génération du compte de résultat', 500);
  }
};

/**
 * Récupérer le bilan comptable (Actif / Passif)
 * @route GET /api/reports/balance-sheet
 * @param {Object} req - Requête Express (query: company_id, date)
 * @param {Object} res - Réponse Express
 */
export const getBalanceSheet = async (req, res) => {
  try {
    const { company_id, date } = req.query;

    if (!company_id) {
      return badRequest(res, 'ID de l\'entreprise requis', { field: 'company_id' });
    }

    const company = await Compagnie.findByPk(company_id);
    if (!company) {
      return notFound(res, 'Entreprise non trouvée');
    }

    // Date de clôture (par défaut: aujourd'hui)
    const closingDate = date ? new Date(date) : new Date();

    const whereClause = {
      company_id: parseInt(company_id),
      status: 'POSTED',
      entryDate: {
        [Op.lte]: closingDate
      }
    };

    // Actif (classes 2, 3, 4, 5 - sauf 40)
    const actifClasses = ['2%', '3%', '41%', '42%', '43%', '44%', '45%', '46%', '47%', '48%', '49%', '5%'];
    
    const actifData = await JournalEntryLine.findAll({
      attributes: [
        'accountId',
        [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit'],
        [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit']
      ],
      include: [
        {
          model: JournalEntry,
          attributes: [],
          where: whereClause,
          required: true
        },
        {
          model: ChartOfAccount,
          attributes: ['id', 'accountNumber', 'accountName', 'accountType'],
          where: {
            company_id: parseInt(company_id),
            [Op.or]: actifClasses.map(pattern => ({ accountNumber: { [Op.like]: pattern } })),
            is_active: true
          },
          required: true
        }
      ],
      group: ['accountId', 'ChartOfAccount.id'],
      raw: false
    });

    // Passif (classes 1, 40)
    const passifData = await JournalEntryLine.findAll({
      attributes: [
        'accountId',
        [sequelize.fn('SUM', sequelize.col('debit')), 'totalDebit'],
        [sequelize.fn('SUM', sequelize.col('credit')), 'totalCredit']
      ],
      include: [
        {
          model: JournalEntry,
          attributes: [],
          where: whereClause,
          required: true
        },
        {
          model: ChartOfAccount,
          attributes: ['id', 'accountNumber', 'accountName', 'accountType'],
          where: {
            company_id: parseInt(company_id),
            [Op.or]: [
              { accountNumber: { [Op.like]: '1%' } },
              { accountNumber: { [Op.like]: '40%' } }
            ],
            is_active: true
          },
          required: true
        }
      ],
      group: ['accountId', 'ChartOfAccount.id'],
      raw: false
    });

    // Calculer l'actif
    const actif = actifData.map(item => {
      const debit = parseFloat(item.dataValues.totalDebit) || 0;
      const credit = parseFloat(item.dataValues.totalCredit) || 0;
      const amount = debit - credit; // Actif au débit
      const account = item.ChartOfAccount;

      return {
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        amount: amount.toFixed(2)
      };
    });

    // Calculer le passif
    const passif = passifData.map(item => {
      const debit = parseFloat(item.dataValues.totalDebit) || 0;
      const credit = parseFloat(item.dataValues.totalCredit) || 0;
      const amount = credit - debit; // Passif au crédit
      const account = item.ChartOfAccount;

      return {
        accountNumber: account.accountNumber,
        accountName: account.accountName,
        amount: amount.toFixed(2)
      };
    });

    // Totaux
    const totalActif = actif.reduce((sum, a) => sum + parseFloat(a.amount), 0);
    const totalPassif = passif.reduce((sum, p) => sum + parseFloat(p.amount), 0);
    const difference = totalActif - totalPassif;

    success(res, {
      actif: actif.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber)),
      passif: passif.sort((a, b) => a.accountNumber.localeCompare(b.accountNumber)),
      totals: {
        totalActif: totalActif.toFixed(2),
        totalPassif: totalPassif.toFixed(2),
        difference: difference.toFixed(2),
        isBalanced: Math.abs(difference) < 0.01
      },
      closingDate: closingDate.toISOString().split('T')[0]
    }, 200, 'Bilan comptable généré avec succès');
  } catch (err) {
    console.error('Erreur lors de la génération du bilan:', err);
    error(res, 'Une erreur est survenue lors de la génération du bilan', 500);
  }
};
