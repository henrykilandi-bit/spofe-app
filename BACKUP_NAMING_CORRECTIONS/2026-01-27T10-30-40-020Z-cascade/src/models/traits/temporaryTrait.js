/**
 * ⏱️ TEMPORARY DATA TRAIT - POUR DONNÉES EXPIRABLES
 * ================================================
 * Mixin pour tables avec données temporaires
 * - Pas de soft delete (hard delete direct)
 * - Champ expires_at obligatoire
 * - CRON job pour cleanup automatique
 */

import { Op } from 'sequelize';

export const TemporaryDataTrait = (sequelize) => ({
  paranoid: false, // ❌ Pas de soft delete - suppression immédiate
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',

  // Scope pour trouver rapidement les expiré(e)s
  scopes: {
    // Récupérer les données encore valides
    notExpired: {
      where: {
        expires_at: {
          [Op.gt]: new Date()
        }
      }
    },

    // Récupérer les données expirées (pour cleanup)
    expired: {
      where: {
        expires_at: {
          [Op.lte]: new Date()
        }
      }
    }
  },

  // Hooks pour validation
  hooks: {
    // Valider expires_at au création
    beforeCreate: (instance, options) => {
      if (!instance.expires_at) {
        throw new Error(
          `❌ VALIDATION_ERROR: "expires_at" est obligatoire pour ${instance.constructor.tableName}`
        );
      }

      if (instance.expires_at <= new Date()) {
        throw new Error(
          `❌ VALIDATION_ERROR: "expires_at" doit être une date future (${instance.expires_at})`
        );
      }
    },

    // Empêcher modification de expires_at
    beforeUpdate: (instance, options) => {
      if (instance.changed('expires_at')) {
        throw new Error(
          `❌ UPDATE_FORBIDDEN: "expires_at" ne peut pas être modifié. ` +
          `Créez un nouveau token si nécessaire.`
        );
      }
    }
  },

  // Indexes pour performance de cleanup
  indexes: [
    {
      fields: ['expires_at'],
      name: 'idx_expires_at',
      type: 'BTREE'
    },
    {
      fields: ['created_at', 'expires_at'],
      name: 'idx_created_expires'
    }
  ]
});

/**
 * Helpers pour gestion des données temporaires
 */
export const TemporaryDataHelpers = {
  /**
   * Vérifier si un token/credential est expiré
   */
  isExpired(instance) {
    return new Date() >= instance.expires_at;
  },

  /**
   * Obtenir TTL restant en secondes
   */
  getTTL(instance) {
    const now = new Date();
    const remaining = (instance.expires_at - now) / 1000;
    return Math.max(0, remaining);
  },

  /**
   * Formater statut expiration
   */
  getExpiryStatus(instance) {
    const ttl = this.getTTL(instance);
    
    if (ttl <= 0) {
      return { status: 'EXPIRED', message: 'Données expirées - suppression autorisée' };
    }
    
    if (ttl < 3600) { // < 1 heure
      return { 
        status: 'EXPIRING_SOON', 
        message: `Expire dans ${Math.floor(ttl / 60)}m`,
        ttlSeconds: ttl
      };
    }
    
    const days = Math.floor(ttl / 86400);
    return { 
      status: 'VALID', 
      message: `Valide pour ${days}j`,
      ttlSeconds: ttl
    };
  }
};

export default TemporaryDataTrait;
