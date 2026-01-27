/**
 * Controller: Business Operations
 * 
 * Gestion des opérations métier pré-comptables
 * 
 * Workflow complet:
 * 1. CREATE (USER) → DRAFT
 * 2. SUBMIT (USER) → PENDING_VALIDATION
 * 3. VALIDATE (ADMIN) → VALIDATED + écriture comptable
 * 4. REJECT (ADMIN) → REJECTED
 * 
 * Conformité OHADA:
 * - Transaction atomique pour validation
 * - Traçabilité via audits
 * - Intangibilité post-validation
 */

import { 
  BusinessOperation, 
  OperationTemplate, 
  BusinessOperationAudit,
  JournalEntry,
  JournalEntryLine,
  ChartOfAccount,
  ThirdParty,
  User,
  FiscalYear,
  sequelize
} from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';
import { success, error } from '../utils/response.js';

class BusinessOperationController {
  
  /**
   * Créer une nouvelle opération métier
   * POST /api/business-operations
   */
  async create(req, res) {
    const transaction = await sequelize.transaction();
    
    try {
      const {
        operationType,
        label,
        description,
        amount,
        operationDate,
        fiscalYearId,
        thirdPartyId,
        attachmentUrl
      } = req.body;

      // Créer l'opération
      const operation = await BusinessOperation.create({
        operationType,
        label,
        description,
        amount,
        operationDate,
        fiscalYearId,
        thirdPartyId,
        attachmentUrl,
        createdBy: req.user.id,
        status: 'DRAFT'
      }, { transaction });

      // Log d'audit
      await BusinessOperationAudit.logAction(
        operation.id,
        'CREATE',
        req.user.id,
        {
          comment: 'Création de l\'opération',
          newValues: operation.toJSON(),
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );

      await transaction.commit();

      logger.logInfo('Opération métier créée', {
        operationId: operation.id,
        userId: req.user.id,
        type: operationType
      });

      return success(res, operation, 201, 'Opération créée avec succès');

    } catch (err) {
      await transaction.rollback();
      
      logger.logError('Erreur création opération', {
        error: err.message,
        userId: req.user?.id
      });

      return error(res, 'Erreur lors de la création de l\'opération', 400, [err.message]);
    }
  }

  /**
   * Lister les opérations selon le rôle de l'utilisateur
   * GET /api/business-operations
   */
  async list(req, res) {
    try {
      const { 
        page = 1, 
        limit = 20, 
        status, 
        operationType,
        startDate,
        endDate,
        search 
      } = req.query;

      const offset = (page - 1) * limit;
      const where = {};

      // Filtrage par rôle
      if (req.viewScope === 'user') {
        // USER: Uniquement ses propres opérations
        where.createdBy = req.user.id;
      } else if (req.viewScope === 'viewer') {
        // VIEWER: Uniquement les opérations validées
        where.status = 'VALIDATED';
      }
      // ADMIN/ACCOUNTANT: Toutes les opérations

      // Filtres supplémentaires
      if (status) {
        where.status = status;
      }

      if (operationType) {
        where.operationType = operationType;
      }

      if (startDate || endDate) {
        where.operationDate = {};
        if (startDate) where.operationDate[Op.gte] = new Date(startDate);
        if (endDate) where.operationDate[Op.lte] = new Date(endDate);
      }

      if (search) {
        where[Op.or] = [
          { label: { [Op.iLike]: `%${search}%` } },
          { description: { [Op.iLike]: `%${search}%` } }
        ];
      }

      const { count, rows } = await BusinessOperation.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset: parseInt(offset),
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email']
          },
          {
            model: User,
            as: 'validator',
            attributes: ['id', 'username', 'email']
          },
          {
            model: ThirdParty,
            as: 'thirdParty',
            attributes: ['id', 'name', 'type']
          }
        ],
        order: [['operationDate', 'DESC'], ['createdAt', 'DESC']]
      });

      return success(res, {
        operations: rows,
        pagination: {
          total: count,
          page: parseInt(page),
          limit: parseInt(limit),
          totalPages: Math.ceil(count / limit)
        }
      });

    } catch (err) {
      logger.logError('Erreur listage opérations', {
        error: err.message,
        userId: req.user?.id
      });

      return error(res, 'Erreur lors de la récupération des opérations', 500);
    }
  }

  /**
   * Obtenir une opération par ID
   * GET /api/business-operations/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const operation = await BusinessOperation.findByPk(id, {
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email', 'role']
          },
          {
            model: User,
            as: 'validator',
            attributes: ['id', 'username', 'email', 'role']
          },
          {
            model: ThirdParty,
            as: 'thirdParty',
            attributes: ['id', 'name', 'type', 'code']
          },
          {
            model: JournalEntry,
            as: 'generatedEntry',
            attributes: ['id', 'entryNumber', 'status']
          },
          {
            model: BusinessOperationAudit,
            as: 'audits',
            include: [{
              model: User,
              as: 'performer',
              attributes: ['id', 'username']
            }],
            separate: true,
            order: [['performedAt', 'DESC']],
            limit: 10
          }
        ]
      });

      if (!operation) {
        return error(res, 'Opération non trouvée', 404);
      }

      // Vérifier les permissions de lecture
      if (req.viewScope === 'user' && operation.createdBy !== req.user.id) {
        return error(res, 'Accès refusé', 403);
      }

      if (req.viewScope === 'viewer' && operation.status !== 'VALIDATED') {
        return error(res, 'Accès refusé', 403);
      }

      return success(res, operation);

    } catch (err) {
      logger.logError('Erreur récupération opération', {
        error: err.message,
        operationId: req.params.id,
        userId: req.user?.id
      });

      return error(res, 'Erreur lors de la récupération de l\'opération', 500);
    }
  }

  /**
   * Mettre à jour une opération
   * PATCH /api/business-operations/:id
   */
  async update(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const operation = req.businessOperation; // Injecté par le middleware
      const oldValues = operation.toJSON();

      const updates = req.body;
      
      // Interdire la modification du statut via cette route
      delete updates.status;
      delete updates.validatedBy;
      delete updates.validatedAt;
      delete updates.proposedJournalEntryId;

      await operation.update(updates, { transaction });

      // Log d'audit
      await BusinessOperationAudit.logAction(
        operation.id,
        'UPDATE',
        req.user.id,
        {
          comment: 'Modification de l\'opération',
          oldValues,
          newValues: operation.toJSON(),
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );

      await transaction.commit();

      logger.logInfo('Opération mise à jour', {
        operationId: operation.id,
        userId: req.user.id
      });

      return success(res, operation, 200, 'Opération mise à jour avec succès');

    } catch (err) {
      await transaction.rollback();

      logger.logError('Erreur mise à jour opération', {
        error: err.message,
        operationId: req.params.id,
        userId: req.user?.id
      });

      return error(res, 'Erreur lors de la mise à jour', 400, [err.message]);
    }
  }

  /**
   * Soumettre une opération pour validation
   * POST /api/business-operations/:id/submit
   */
  async submit(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const operation = await BusinessOperation.findByPk(id);

      if (!operation) {
        return error(res, 'Opération non trouvée', 404);
      }

      // Vérifier que l'utilisateur est le créateur
      if (operation.createdBy !== req.user.id && req.user.role !== 'admin') {
        return error(res, 'Seul le créateur peut soumettre cette opération', 403);
      }

      if (operation.status !== 'DRAFT') {
        return error(res, `Impossible de soumettre: statut actuel "${operation.status}"`, 400);
      }

      await operation.update({ status: 'PENDING_VALIDATION' }, { transaction });

      // Log d'audit
      await BusinessOperationAudit.logAction(
        operation.id,
        'SUBMIT',
        req.user.id,
        {
          comment: 'Soumission pour validation',
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );

      await transaction.commit();

      logger.logInfo('Opération soumise pour validation', {
        operationId: operation.id,
        userId: req.user.id
      });

      return success(res, operation, 200, 'Opération soumise pour validation');

    } catch (err) {
      await transaction.rollback();

      logger.logError('Erreur soumission opération', {
        error: err.message,
        operationId: req.params.id,
        userId: req.user?.id
      });

      return error(res, 'Erreur lors de la soumission', 500);
    }
  }

  /**
   * Valider une opération et créer l'écriture comptable
   * POST /api/business-operations/:id/validate
   * 
   * CRITIQUE: Transaction atomique obligatoire
   */
  async validate(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const operation = req.businessOperation; // Injecté par le middleware
      const { debitAccountId, creditAccountId, comment } = req.body;

      // Trouver le template correspondant
      const template = await OperationTemplate.findByTypeAndLabel(
        operation.operationType,
        operation.label,
        {
          include: [
            { model: ChartOfAccount, as: 'debitAccount' },
            { model: ChartOfAccount, as: 'creditAccount' }
          ]
        }
      );

      if (!template) {
        await transaction.rollback();
        return error(res, `Aucun template trouvé pour "${operation.label}"`, 400);
      }

      // Valider l'opération avec le template
      const validation = template.validateBusinessOperation(operation);
      if (!validation.valid) {
        await transaction.rollback();
        return error(res, 'Validation échouée', 400, validation.errors);
      }

      // Utiliser les comptes du template ou ceux fournis (si editable_by_accountant)
      const finalDebitAccountId = debitAccountId && template.editableByAccountant 
        ? debitAccountId 
        : template.debitAccountId;
      
      const finalCreditAccountId = creditAccountId && template.editableByAccountant 
        ? creditAccountId 
        : template.creditAccountId;

      // Obtenir companyId depuis l'opération (via fiscal_year)
      const fiscalYear = await FiscalYear.findByPk(operation.fiscalYearId);
      if (!fiscalYear) {
        await transaction.rollback();
        return error(res, 'Exercice comptable introuvable', 404);
      }

      // Générer entryNumber unique: JournalCode/YearMonth/Sequence
      const journalCode = operation.operationType.substring(0, 2);
      const yearMonth = new Date().toISOString().slice(0, 7).replace('-', '');
      const lastEntry = await JournalEntry.findOne({
        where: {
          companyId: fiscalYear.companyId,
          entryNumber: {
            [Op.like]: `${journalCode}/${yearMonth}/%`
          }
        },
        order: [['created_at', 'DESC']],
        transaction
      });
      
      const sequence = lastEntry 
        ? parseInt(lastEntry.entryNumber.split('/')[2]) + 1 
        : 1;
      const entryNumber = `${journalCode}/${yearMonth}/${sequence.toString().padStart(4, '0')}`;

      // 1. Créer l'écriture comptable
      const journalEntry = await JournalEntry.create({
        companyId: fiscalYear.companyId,
        journalCode: journalCode,
        entryNumber: entryNumber,
        entryDate: operation.operationDate,
        description: operation.description || operation.label,
        referenceDocument: operation.attachmentUrl,
        status: 'POSTED',
        totalDebit: operation.amount,
        totalCredit: operation.amount
      }, { transaction });

      // 2. Créer les lignes d'écriture (débit & crédit)
      await JournalEntryLine.bulkCreate([
        {
          journalEntryId: journalEntry.id,
          accountId: finalDebitAccountId,
          debit: operation.amount,
          credit: 0,
          lineDescription: operation.label,
          thirdPartyId: operation.thirdPartyId
        },
        {
          journalEntryId: journalEntry.id,
          accountId: finalCreditAccountId,
          debit: 0,
          credit: operation.amount,
          lineDescription: operation.label,
          thirdPartyId: operation.thirdPartyId
        }
      ], { transaction });

      // 3. Mettre à jour l'opération métier
      await operation.update({
        status: 'VALIDATED',
        validatedBy: req.user.id,
        validatedAt: new Date(),
        proposedJournalEntryId: journalEntry.id
      }, { transaction });

      // 4. Log d'audit
      await BusinessOperationAudit.logAction(
        operation.id,
        'VALIDATE',
        req.user.id,
        {
          comment: comment || 'Validation et création écriture comptable',
          newValues: {
            journalEntryId: journalEntry.id,
            status: 'VALIDATED'
          },
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );

      await transaction.commit();

      logger.logInfo('Opération validée avec succès', {
        operationId: operation.id,
        journalEntryId: journalEntry.id,
        validatedBy: req.user.id
      });

      return success(res, {
        operation,
        journalEntry
      }, 200, 'Opération validée et écriture comptable créée');

    } catch (err) {
      await transaction.rollback();

      logger.logError('Erreur validation opération', {
        error: err.message,
        stack: err.stack,
        operationId: req.params.id,
        userId: req.user?.id
      });

      return error(res, 'Erreur lors de la validation', 500, [err.message]);
    }
  }

  /**
   * Rejeter une opération
   * POST /api/business-operations/:id/reject
   */
  async reject(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const operation = req.businessOperation; // Injecté par le middleware
      const { rejectionReason } = req.body;

      if (!rejectionReason || rejectionReason.trim().length < 10) {
        return error(res, 'Le motif de rejet doit contenir au moins 10 caractères', 400);
      }

      await operation.update({
        status: 'REJECTED',
        rejectionReason
      }, { transaction });

      // Log d'audit
      await BusinessOperationAudit.logAction(
        operation.id,
        'REJECT',
        req.user.id,
        {
          comment: rejectionReason,
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );

      await transaction.commit();

      logger.logInfo('Opération rejetée', {
        operationId: operation.id,
        rejectedBy: req.user.id
      });

      return success(res, operation, 200, 'Opération rejetée');

    } catch (err) {
      await transaction.rollback();

      logger.logError('Erreur rejet opération', {
        error: err.message,
        operationId: req.params.id,
        userId: req.user?.id
      });

      return error(res, 'Erreur lors du rejet', 500);
    }
  }

  /**
   * Supprimer une opération (soft delete)
   * DELETE /api/business-operations/:id
   */
  async delete(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const operation = req.businessOperation; // Injecté par le middleware

      await operation.destroy({ transaction });

      // Log d'audit
      await BusinessOperationAudit.logAction(
        operation.id,
        'DELETE',
        req.user.id,
        {
          comment: 'Suppression (soft delete)',
          oldValues: operation.toJSON(),
          ipAddress: req.ip,
          userAgent: req.get('user-agent')
        }
      );

      await transaction.commit();

      logger.logInfo('Opération supprimée', {
        operationId: operation.id,
        deletedBy: req.user.id
      });

      return success(res, null, 200, 'Opération supprimée avec succès');

    } catch (err) {
      await transaction.rollback();

      logger.logError('Erreur suppression opération', {
        error: err.message,
        operationId: req.params.id,
        userId: req.user?.id
      });

      return error(res, 'Erreur lors de la suppression', 500, [err.message]);
    }
  }

  /**
   * Obtenir les statistiques des opérations
   * GET /api/business-operations/stats
   */
  async getStats(req, res) {
    try {
      const where = {};

      // Filtrer selon le rôle
      if (req.viewScope === 'user') {
        where.createdBy = req.user.id;
      } else if (req.viewScope === 'viewer') {
        where.status = 'VALIDATED';
      }

      const stats = await BusinessOperation.findAll({
        where,
        attributes: [
          'status',
          [sequelize.fn('COUNT', sequelize.col('id')), 'count'],
          [sequelize.fn('SUM', sequelize.col('amount')), 'total']
        ],
        group: ['status'],
        raw: true
      });

      return success(res, stats);

    } catch (err) {
      logger.logError('Erreur récupération statistiques', {
        error: err.message,
        userId: req.user?.id
      });

      return error(res, 'Erreur lors de la récupération des statistiques', 500);
    }
  }
}

export default new BusinessOperationController();
