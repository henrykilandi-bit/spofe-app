// src/models/role.model.js
import { DataTypes } from 'sequelize';
import { logInfo, logError, logSecurity } from '../utils/logger.js';

export default (sequelize) => {
  const Role = sequelize.define(
    'Role',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      nom: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
          len: [3, 100],
          notEmpty: true
        }
      },
      description: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      permissions: {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: {}
      },
      is_system: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
      }
    },
    {
      tableName: 'roles',
      timestamps: true,
      freezeTableName: true,
      underscored: true,
      paranoid: true,
      deletedAt: 'deleted_at',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      hooks: {
        beforeCreate: async (role, options) => {
          try {
            // 1️⃣ NAME NORMALIZATION
            role.nom = role.nom.trim().toUpperCase();
            if (role.description) role.description = role.description.trim();

            // 2️⃣ PERMISSIONS DEFAULT
            if (!role.permissions) {
              role.permissions = {};
            }

            // 3️⃣ SYSTEM ROLES PROTECTION
            const systemRoles = ['ADMIN', 'SUPER_UTILISATEUR', 'UTILISATEUR', 'SUPER_CONSULTANT', 'CONSULTANT', 'VIEWER', 'ACCOUNTANT'];
            if (systemRoles.includes(role.nom)) {
              role.is_system = true;
            }

            logInfo(`Role.beforeCreate: Role ${role.nom} prepared`);
            logSecurity(`Role created: ${role.nom}`);
          } catch (error) {
            logError(`Role.beforeCreate error: ${error.message}`);
            throw error;
          }
        },

        beforeUpdate: async (role, options) => {
          try {
            // 1️⃣ PREVENT SYSTEM ROLE NAME CHANGE
            if (role._previousDataValues.is_system === true && role.changed('nom')) {
              throw new Error('Cannot rename system roles');
            }

            // 2️⃣ NORMALIZATION (if changed)
            if (role.changed('nom')) {
              role.nom = role.nom.trim().toUpperCase();
            }
            if (role.changed('description')) {
              role.description = role.description ? role.description.trim() : null;
            }

            // 3️⃣ PERMISSIONS VALIDATION
            if (role.changed('permissions') && role.permissions) {
              if (typeof role.permissions !== 'object') {
                throw new Error('Permissions must be an object');
              }
            }

            logInfo(`Role.beforeUpdate: Role ${role.nom} prepared for update`);
          } catch (error) {
            logError(`Role.beforeUpdate error: ${error.message}`);
            throw error;
          }
        }
      }
    }
  );

  return Role;
};
