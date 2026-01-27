import { QueryTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { success, error, badRequest } from '../utils/response.js';
import Compagnie from '../models/compagnie.model.js';
import { AppError, asyncHandler } from '../middleware/error.middleware.js';
import logger from '../utils/logger.js';

const ROLE_MAP = {
  admin: 'ADMIN',
  accountant: 'COACH',
  user: 'USER',
  viewer: 'USER',
  manager: 'DIRIGEANT'
};

const resolveCompanyId = async (req) => {
  if (req.user?.companyId) return req.user.companyId;
  if (req.query?.companyId) return parseInt(req.query.companyId, 10);

  const company = await Compagnie.findOne({ where: { isActive: true } });
  return company?.id || null;
};

const buildPeriod = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
};

const parseStartDate = ({ period, startDate }) => {
  if (startDate) return new Date(startDate);
  if (period) {
    const match = /^([0-9]+)d$/i.exec(String(period));
    if (match) {
      const days = parseInt(match[1], 10);
      const date = new Date();
      date.setDate(date.getDate() - days);
      return date;
    }
  }
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() - 30);
  return defaultDate;
};

const mapTreasuryMessage = (level) => {
  if (level === 'high') {
    return { level: 'danger', text: 'Tension de trésorerie élevée détectée.' };
  }
  if (level === 'moderate') {
    return { level: 'warning', text: 'Tension de trésorerie modérée détectée.' };
  }
  return { level: 'success', text: 'Situation de trésorerie saine.' };
};

export const getDashboardSummary = asyncHandler(async (req, res) => {
    const companyId = await resolveCompanyId(req);
    if (!companyId) {
      throw new AppError("ID de l'entreprise requis", 400, { field: 'companyId' });
    }

    const role = ROLE_MAP[req.user?.role] || String(req.user?.role || 'USER').toUpperCase();

    const [pending] = await sequelize.query(
      `SELECT COUNT(*) as count
       FROM business_operations bo
       JOIN fiscal_years fy ON fy.id = bo.fiscal_year_id
       WHERE bo.status = 'PENDING_VALIDATION'
       AND fy.company_id = :companyId`,
      { replacements: { companyId }, type: QueryTypes.SELECT }
    );

    if (!pending) {
      throw new AppError('Erreur lors de la récupération des opérations en attente', 500);
    }

    const [treasury] = await sequelize.query(
      `SELECT
        SUM(CASE WHEN tp.type = 'CUSTOMER'
          THEN jel.debit - jel.credit
          ELSE 0 END) AS receivables,
        SUM(CASE WHEN tp.type = 'SUPPLIER'
          THEN jel.credit - jel.debit
          ELSE 0 END) AS payables
       FROM journal_entry_lines jel
       JOIN journal_entries je ON je.id = jel.journal_entry_id
       JOIN third_parties tp ON tp.id = jel.third_party_id
       WHERE je.status = 'POSTED'
       AND je.company_id = :companyId`,
      { replacements: { companyId }, type: QueryTypes.SELECT }
    );

    if (!treasury) {
      throw new AppError('Erreur lors de la récupération des données de trésorerie', 500);
    }

    const receivables = Number(treasury?.receivables || 0);
    const payables = Number(treasury?.payables || 0);
    const net = receivables - payables;

    let treasuryLevel = 'low';
    if (payables > 0) {
      const ratio = net / payables;
      treasuryLevel = ratio <= 0 ? 'low' : ratio <= 0.3 ? 'moderate' : 'high';
    } else if (receivables > 0) {
      treasuryLevel = 'high';
    }

    const message = mapTreasuryMessage(treasuryLevel);

    const activityStartDate = parseStartDate({ period: '3d' });
    const activityRows = await sequelize.query(
      `SELECT DATE(bo.created_at) AS date, COUNT(*) AS count
       FROM business_operations bo
       JOIN fiscal_years fy ON fy.id = bo.fiscal_year_id
       WHERE fy.company_id = :companyId
         AND bo.created_at >= :startDate
       GROUP BY DATE(bo.created_at)
       ORDER BY DATE(bo.created_at) ASC`,
      {
        replacements: { companyId, startDate: activityStartDate },
        type: QueryTypes.SELECT,
      }
    );

    if (!activityRows) {
      throw new AppError('Erreur lors de la récupération des données d\'activité', 500);
    }

    const labels = activityRows.map((row) => String(row.date));
    const values = activityRows.map((row) => Number(row.count || 0));

    const rawThirdParties = await sequelize.query(
      `SELECT tp.name AS name,
        SUM(CASE WHEN jel.debit > 0 THEN jel.debit ELSE -jel.credit END) AS balance
       FROM journal_entry_lines jel
       JOIN journal_entries je ON je.id = jel.journal_entry_id
       JOIN third_parties tp ON tp.id = jel.third_party_id
       WHERE je.status = 'POSTED'
       AND je.company_id = :companyId
       GROUP BY tp.id, tp.name
       ORDER BY ABS(SUM(CASE WHEN jel.debit > 0 THEN jel.debit ELSE -jel.credit END)) DESC
       LIMIT 5`,
      { replacements: { companyId }, type: QueryTypes.SELECT }
    );

    if (!rawThirdParties) {
      throw new AppError('Erreur lors de la récupération des tiers', 500);
    }

    const topThirdParties = rawThirdParties.map((row) => ({
      name: row.name,
      balance: Number(row.balance || 0)
    }));

    logger.logInfo('Dashboard summary retrieved successfully', { userId: req.user?.id, companyId });

    success(res, {
      period: buildPeriod(),
      role,
      message,
      kpis: {
        result: {
          value: 125000,
          trend: '+12%'
        },
        activity: {
          status: 'normal'
        }
      },
      treasury: {
        level: treasuryLevel,
        receivables,
        payables,
        explanation: 'Créances supérieures aux dettes'
      },
      pendingValidations: {
        count: Number(pending?.count || 0)
      },
      activityChart: {
        labels,
        values
      },
      topThirdParties
    }, 200, 'Résumé dashboard');
});

export const getDashboardActivity = asyncHandler(async (req, res) => {
    const companyId = await resolveCompanyId(req);
    if (!companyId) {
      throw new AppError("ID de l'entreprise requis", 400, { field: 'companyId' });
    }

    const { period = '30d', startDate, endDate } = req.query;
    const start = parseStartDate({ period, startDate });
    const end = endDate ? new Date(endDate) : new Date();

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw new AppError('Format de date invalide', 400, { field: 'date' });
    }

    const operations = await sequelize.query(
      `SELECT DATE(bo.created_at) AS date, COUNT(*) AS count
       FROM business_operations bo
       JOIN fiscal_years fy ON fy.id = bo.fiscal_year_id
       WHERE fy.company_id = :companyId
         AND bo.created_at BETWEEN :startDate AND :endDate
       GROUP BY DATE(bo.created_at)`,
      {
        replacements: { companyId, startDate: start, endDate: end },
        type: QueryTypes.SELECT,
      }
    );

    if (!operations) {
      throw new AppError('Erreur lors de la récupération des opérations', 500);
    }

    const entries = await sequelize.query(
      `SELECT DATE(created_at) AS date, COUNT(*) AS count
       FROM journal_entries
       WHERE company_id = :companyId
         AND status = 'POSTED'
         AND created_at BETWEEN :startDate AND :endDate
       GROUP BY DATE(created_at)`,
      {
        replacements: { companyId, startDate: start, endDate: end },
        type: QueryTypes.SELECT,
      }
    );

    if (!entries) {
      throw new AppError('Erreur lors de la récupération des écritures', 500);
    }

    const map = {};
    operations.forEach((row) => {
      map[String(row.date)] = {
        date: String(row.date),
        operations: Number(row.count || 0),
        entries: 0,
      };
    });

    entries.forEach((row) => {
      const key = String(row.date);
      if (!map[key]) {
        map[key] = { date: key, operations: 0, entries: Number(row.count || 0) };
      } else {
        map[key].entries = Number(row.count || 0);
      }
    });

    const data = Object.values(map).sort((a, b) => (a.date > b.date ? 1 : -1));

    logger.logInfo('Dashboard activity retrieved successfully', { userId: req.user?.id, companyId, period });

    success(res, data, 200, 'Activité dashboard');
});
