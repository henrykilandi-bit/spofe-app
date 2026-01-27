// src/models/auditTrail.model.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const AuditTrail = sequelize.define(
    'AuditTrail',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      table_name: {
        type: DataTypes.STRING(100),
        allowNull: false,
        index: true,
        validate: {
          notEmpty: true
        }
      },
      record_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        index: true
      },
      operation: {
        type: DataTypes.ENUM('CREATE', 'UPDATE', 'DELETE'),
        allowNull: false,
        validate: {
          isIn: [['CREATE', 'UPDATE', 'DELETE']]
        }
      },
      old_values: {
        type: DataTypes.JSON,
        allowNull: true
      },
      new_values: {
        type: DataTypes.JSON,
        allowNull: true
      },
      utilisateur_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      ip_address: {
        type: DataTypes.STRING(45),
        allowNull: true,
        validate: {
          isIP: true
        }
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        index: true
      }
    },
    {
      tableName: 'audit_trail',
      timestamps: false,
      freezeTableName: true,
      underscored: true
    }
  );

  return AuditTrail;
};
