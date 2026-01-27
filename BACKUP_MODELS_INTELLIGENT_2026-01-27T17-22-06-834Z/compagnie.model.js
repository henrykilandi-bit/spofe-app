// src/models/compagnie.model.js
import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { logInfo, logError, logSecurity } from '../utils/logger.js';

const Compagnie = sequelize.define(
  'Compagnie',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    groupe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'groupes_entreprises',
        key: 'id'
      }
    },
    nom: {
      type: DataTypes.STRING(255),
      allowNull: false,
      validate: {
        len: [2, 255],
        notEmpty: true
      }
    },
    sigle: {
      type: DataTypes.STRING(50),
      allowNull: true
    },
    numero_registre_commerce: {
      type: DataTypes.STRING(100),
      allowNull: true,
      unique: true
    },
    adresse: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    telephone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    devise: {
      type: DataTypes.STRING(3),
      defaultValue: 'XOF'
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    deleted_at: {
      type: DataTypes.DATE,
      allowNull: true
    }
  },
  {
    tableName: 'compagnies',
    timestamps: true,
    freezeTableName: true,
    underscored: true,
    paranoid: true,
    deletedAt: 'deleted_at',
    created_at: 'created_at',
    updated_at: 'updated_at',
    indexes: [
      {
        fields: ['groupe_id', 'nom'],
        unique: true,
        name: 'uk_compagnies_groupe_nom'
      }
    ],
    hooks: {
      beforeCreate: async (compagnie, options) => {
        try {
          // 1️⃣ NORMALIZATION
          compagnie.nom = compagnie.nom.trim();
          if (compagnie.sigle) compagnie.sigle = compagnie.sigle.toUpperCase().trim();
          if (compagnie.email) compagnie.email = compagnie.email.toLowerCase().trim();
          if (compagnie.adresse) compagnie.adresse = compagnie.adresse.trim();

          // 2️⃣ VALIDATION MÉTIER
          if (compagnie.numero_registre_commerce) {
            // Format OHADA: 14 chiffres
            const cleanRc = compagnie.numero_registre_commerce.replace(/\D/g, '');
            if (cleanRc.length !== 14) {
              throw new Error('Numéro de registre commerce invalide (14 chiffres requis)');
            }
            compagnie.numero_registre_commerce = cleanRc;
          }

          // 3️⃣ DEVISE DEFAULT
          if (!compagnie.devise || compagnie.devise.length !== 3) {
            compagnie.devise = 'XOF';
          }

          logInfo(`Compagnie.beforeCreate: Prepared compagnie ${compagnie.nom}`);
          logSecurity(`Compagnie created: ${compagnie.nom} (groupe_id: ${compagnie.groupe_id})`);
        } catch (error) {
          logError(`Compagnie.beforeCreate error: ${error.message}`);
          throw error;
        }
      },

      beforeUpdate: async (compagnie, options) => {
        try {
          // 1️⃣ NORMALIZATION (if changed)
          if (compagnie.changed('nom')) {
            compagnie.nom = compagnie.nom.trim();
          }
          if (compagnie.changed('sigle')) {
            compagnie.sigle = compagnie.sigle.toUpperCase().trim();
          }
          if (compagnie.changed('email')) {
            compagnie.email = compagnie.email.toLowerCase().trim();
          }
          if (compagnie.changed('adresse')) {
            compagnie.adresse = compagnie.adresse.trim();
          }

          // 2️⃣ REGISTRE COMMERCE VALIDATION (if changed)
          if (compagnie.changed('numero_registre_commerce') && compagnie.numero_registre_commerce) {
            const cleanRc = compagnie.numero_registre_commerce.replace(/\D/g, '');
            if (cleanRc.length !== 14) {
              throw new Error('Numéro de registre commerce invalide (14 chiffres requis)');
            }
            compagnie.numero_registre_commerce = cleanRc;
          }

          // 3️⃣ STATUS CHANGE TRACKING
          if (compagnie.changed('is_active')) {
            const newStatus = compagnie.is_active ? 'ACTIVATED' : 'DEACTIVATED';
            logSecurity(`Compagnie status changed: ${compagnie.nom} → ${newStatus}`);
          }

          logInfo(`Compagnie.beforeUpdate: Prepared update for ${compagnie.nom}`);
        } catch (error) {
          logError(`Compagnie.beforeUpdate error: ${error.message}`);
          throw error;
        }
      },

      afterCreate: async (compagnie, options) => {
        try {
          // 1️⃣ AUDIT TRAIL
          if (options.sequelize) {
            const { AuditTrail } = options.sequelize.models;
            if (AuditTrail) {
              await AuditTrail.create({
                entityType: 'Compagnie',
                entityId: compagnie.id,
                action: 'CREATE',
                changes: {
                  nom: compagnie.nom,
                  groupe_id: compagnie.groupe_id,
                  devise: compagnie.devise
                },
                user_id: options.user_id,
                ipAddress: options.ipAddress
              });
              logInfo(`Compagnie.afterCreate: Audit trail created for ${compagnie.nom}`);
            }
          }

          logInfo(`Compagnie.afterCreate: Post-creation tasks completed for ${compagnie.nom}`);
        } catch (error) {
          logError(`Compagnie.afterCreate error: ${error.message}`);
          // Don't throw - audit logging failure shouldn't rollback
        }
      }
    }
  }
);

export default Compagnie;
