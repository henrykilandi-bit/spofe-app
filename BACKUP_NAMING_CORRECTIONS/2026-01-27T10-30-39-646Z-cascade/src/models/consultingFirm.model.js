// src/models/consultingFirm.model.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ConsultingFirm = sequelize.define(
    'ConsultingFirm',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nom: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          len: [2, 255],
          notEmpty: true
        },
        comment: 'Nom du cabinet ou organisme'
      },
      siret: {
        type: DataTypes.STRING(14),
        allowNull: true,
        unique: true,
        validate: {
          len: [0, 14],
          is: /^[\d]{14}$/
        },
        comment: 'Numéro SIRET du cabinet'
      },
      type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Type: cabinet_comptable, coaching, audit, expertise'
      },
      adresse: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Adresse physique du cabinet'
      },
      contact_email: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isEmail: true
        },
        comment: 'Email de contact du cabinet'
      },
      contact_telephone: {
        type: DataTypes.STRING(20),
        allowNull: true,
        validate: {
          is: /^[+]?[\d\s\-()]+$/
        },
        comment: 'Téléphone de contact'
      },
      website: {
        type: DataTypes.STRING(255),
        allowNull: true,
        validate: {
          isUrl: true
        },
        comment: 'Site web du cabinet'
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description des activités et spécialités'
      },
      logo_url: {
        type: DataTypes.STRING(500),
        allowNull: true,
        comment: 'URL du logo du cabinet'
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Utilisateur qui a créé l\'organisme'
      }
    },
    {
      tableName: 'consulting_firms',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['type'],
          name: 'idx_consulting_firms_type'
        },
        {
          fields: ['created_by'],
          name: 'idx_consulting_firms_created_by'
        },
        {
          unique: true,
          fields: ['siret'],
          name: 'idx_consulting_firms_siret'
        }
      ]
    }
  );

  return ConsultingFirm;
};
