/**
 * Controller: Operation Templates
 * 
 * Gestion des règles de mapping métier → comptabilité
 * 
 * Réservé aux ADMIN et ACCOUNTANT uniquement
 */

import { 
  OperationTemplate, 
  ChartOfAccount,
  User,
  sequelize
} from '../models/index.js';
import logger from '../utils/logger.js';
import { success, error } from '../utils/response.js';

class OperationTemplateController {

  /**
   * Lister les templates
   * GET /api/operation-templates
   */
  async list(req, res) {
    try {
      const { operationType, active } = req.query;
      
      const where = {};
      
      if (operationType) {
        where.operationType = operationType;
      }

      if (active !== undefined) {
        where.active = active === 'true';
      }

      const templates = await OperationTemplate.findAll({
        where,
        include: [
          {
            model: ChartOfAccount,
            as: 'debitAccount',
            attributes: ['id', 'accountNumber', 'accountName']
          },
          {
            model: ChartOfAccount,
            as: 'creditAccount',
            attributes: ['id', 'accountNumber', 'accountName']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username']
          }
        ],
        order: [['operationType', 'ASC'], ['label', 'ASC']]
      });

      return success(res, templates);

    } catch (err) {
      logger.logError('Erreur listage templates', {
        error: err.message,
        user_id: req.user?.id
      });

      return error(res, 'Erreur lors de la récupération des templates', 500);
    }
  }

  /**
   * Obtenir un template par ID
   * GET /api/operation-templates/:id
   */
  async getById(req, res) {
    try {
      const { id } = req.params;

      const template = await OperationTemplate.findByPk(id, {
        include: [
          {
            model: ChartOfAccount,
            as: 'debitAccount'
          },
          {
            model: ChartOfAccount,
            as: 'creditAccount'
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'username', 'email']
          }
        ]
      });

      if (!template) {
        return error(res, 'Template non trouvé', 404);
      }

      return success(res, template);

    } catch (err) {
      logger.logError('Erreur récupération template', {
        error: err.message,
        templateId: req.params.id,
        user_id: req.user?.id
      });

      return error(res, 'Erreur lors de la récupération du template', 500);
    }
  }

  /**
   * Créer un nouveau template
   * POST /api/operation-templates
   */
  async create(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const {
        operationType,
        label,
        description,
        exampleUseCase,
        debitAccountId,
        creditAccountId,
        requiresThirdParty,
        requiresAttachment,
        editableByAccountant
      } = req.body;

      // Vérifier que les comptes existent
      const [debitAccount, creditAccount] = await Promise.all([
        ChartOfAccount.findByPk(debitAccountId),
        ChartOfAccount.findByPk(creditAccountId)
      ]);

      if (!debitAccount || !creditAccount) {
        await transaction.rollback();
        return error(res, 'Compte(s) comptable(s) invalide(s)', 400);
      }

      // Vérifier l'unicité (type + label)
      const existing = await OperationTemplate.findOne({
        where: { operationType, label }
      });

      if (existing) {
        await transaction.rollback();
        return error(res, `Un template existe déjà pour "${operationType}" avec le libellé "${label}"`, 400);
      }

      const template = await OperationTemplate.create({
        operationType,
        label,
        description,
        exampleUseCase,
        debitAccountId,
        creditAccountId,
        requiresThirdParty: requiresThirdParty || false,
        requiresAttachment: requiresAttachment || false,
        editableByAccountant: editableByAccountant !== false,
        createdBy: req.user.id,
        active: true
      }, { transaction });

      await transaction.commit();

      logger.logInfo('Template créé', {
        templateId: template.id,
        user_id: req.user.id,
        type: operationType
      });

      return success(res, template, 201, 'Template créé avec succès');

    } catch (err) {
      await transaction.rollback();

      logger.logError('Erreur création template', {
        error: err.message,
        user_id: req.user?.id
      });

      return error(res, 'Erreur lors de la création du template', 400, [err.message]);
    }
  }

  /**
   * Mettre à jour un template
   * PATCH /api/operation-templates/:id
   */
  async update(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const template = await OperationTemplate.findByPk(id);

      if (!template) {
        await transaction.rollback();
        return error(res, 'Template non trouvé', 404);
      }

      const updates = req.body;
      
      // Interdire la modification de certains champs
      delete updates.createdBy;

      await template.update(updates, { transaction });

      await transaction.commit();

      logger.logInfo('Template mis à jour', {
        templateId: template.id,
        user_id: req.user.id
      });

      return success(res, template, 200, 'Template mis à jour avec succès');

    } catch (err) {
      await transaction.rollback();

      logger.logError('Erreur mise à jour template', {
        error: err.message,
        templateId: req.params.id,
        user_id: req.user?.id
      });

      return error(res, 'Erreur lors de la mise à jour', 400, [err.message]);
    }
  }

  /**
   * Désactiver un template (au lieu de le supprimer)
   * DELETE /api/operation-templates/:id
   */
  async delete(req, res) {
    const transaction = await sequelize.transaction();

    try {
      const { id } = req.params;
      const template = await OperationTemplate.findByPk(id);

      if (!template) {
        await transaction.rollback();
        return error(res, 'Template non trouvé', 404);
      }

      // Soft delete
      await template.destroy({ transaction });

      await transaction.commit();

      logger.logInfo('Template supprimé', {
        templateId: template.id,
        deletedBy: req.user.id
      });

      return success(res, null, 200, 'Template supprimé avec succès');

    } catch (err) {
      await transaction.rollback();

      logger.logError('Erreur suppression template', {
        error: err.message,
        templateId: req.params.id,
        user_id: req.user?.id
      });

      return error(res, 'Erreur lors de la suppression', 500);
    }
  }

  /**
   * Activer/désactiver un template
   * PATCH /api/operation-templates/:id/toggle
   */
  async toggleActive(req, res) {
    try {
      const { id } = req.params;
      const template = await OperationTemplate.findByPk(id);

      if (!template) {
        return error(res, 'Template non trouvé', 404);
      }

      await template.update({ active: !template.active });

      logger.logInfo('Template activé/désactivé', {
        templateId: template.id,
        active: template.active,
        user_id: req.user.id
      });

      return success(res, template, 200, `Template ${template.active ? 'activé' : 'désactivé'}`);

    } catch (err) {
      logger.logError('Erreur toggle template', {
        error: err.message,
        templateId: req.params.id,
        user_id: req.user?.id
      });

      return error(res, 'Erreur lors de l\'activation/désactivation', 500);
    }
  }
}

export default new OperationTemplateController();
