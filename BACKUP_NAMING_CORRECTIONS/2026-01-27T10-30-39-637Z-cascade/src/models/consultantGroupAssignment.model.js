// src/models/consultantGroupAssignment.model.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const ConsultantGroupAssignment = sequelize.define(
    'ConsultantGroupAssignment',
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
      groupe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Référence vers le groupe d\'entreprises'
      },
      status: {
        type: DataTypes.ENUM('active', 'pending', 'suspended', 'terminated'),
        defaultValue: 'pending',
        comment: 'Statut de l\'affectation'
      },
      contract_type: {
        type: DataTypes.STRING(50),
        allowNull: true,
        comment: 'Type de contrat: audit, coaching, expertise, accompagnement'
      },
      contract_reference: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Référence du contrat'
      },
      start_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de début du contrat'
      },
      end_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date de fin du contrat'
      },
      billing_rate: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
          min: 0,
          max: 999999.99
        },
        comment: 'Taux horaire/journalier en FCFA'
      },
      created_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Utilisateur qui a créé l\'affectation'
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        comment: 'Utilisateur qui a approuvé l\'affectation'
      }
    },
    {
      tableName: 'consultant_group_assignments',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          unique: true,
          fields: ['consultant_id', 'groupe_id'],
          name: 'unique_consultant_group'
        },
        {
          fields: ['consultant_id'],
          name: 'idx_consultant_group_consultant'
        },
        {
          fields: ['groupe_id'],
          name: 'idx_consultant_group_groupe'
        },
        {
          fields: ['status'],
          name: 'idx_consultant_group_status'
        }
      ]
    }
  );

  return ConsultantGroupAssignment;
};
