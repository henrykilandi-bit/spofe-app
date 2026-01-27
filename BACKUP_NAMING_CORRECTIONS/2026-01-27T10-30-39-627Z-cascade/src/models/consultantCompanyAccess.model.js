// src/models/consultantCompanyAccess.model.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ConsultantCompanyAccess = sequelize.define(
    'ConsultantCompanyAccess',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      consultant_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Référence vers l\'utilisateur consultant'
      },
      compagnie_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Référence vers la compagnie'
      },
      groupe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Référence vers le groupe (redondant mais utile pour requêtes)'
      },
      access_level: {
        type: DataTypes.ENUM('read', 'write', 'audit', 'review'),
        defaultValue: 'read',
        comment: 'Niveau d\'accès: read, write, audit, review'
      },
      specific_permissions: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Permissions spécifiques supplémentaires'
      },
      reason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Raison de l\'accès accordé'
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Admin compagnie ou groupe qui a approuvé l\'accès'
      },
      expires_at: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date d\'expiration de l\'accès (null = permanent)'
      }
    },
    {
      tableName: 'consultant_company_access',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['consultant_id', 'compagnie_id'],
          name: 'unique_consultant_company'
        },
        {
          fields: ['consultant_id'],
          name: 'idx_consultant_company_consultant'
        },
        {
          fields: ['compagnie_id'],
          name: 'idx_consultant_company_compagnie'
        },
        {
          fields: ['groupe_id'],
          name: 'idx_consultant_company_groupe'
        },
        {
          fields: ['expires_at'],
          name: 'idx_consultant_company_expires'
        }
      ]
    }
  );

  return ConsultantCompanyAccess;
};
