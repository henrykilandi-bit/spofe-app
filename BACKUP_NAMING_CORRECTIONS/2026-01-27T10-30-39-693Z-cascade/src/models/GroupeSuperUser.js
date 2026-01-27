/**
 * GroupeSuperUser Model
 * Représente la relation entre un groupe d'entreprises et ses super utilisateurs
 * Permet plusieurs super users par groupe (pour redondance)
 */

module.exports = (sequelize, DataTypes) => {
  const GroupeSuperUser = sequelize.define(
    'GroupeSuperUser',
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
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      assigned_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      createdAt: {
        type: DataTypes.DATE,
        field: 'created_at'
      },
      updatedAt: {
        type: DataTypes.DATE,
        field: 'updated_at'
      }
    },
    {
      sequelize,
      modelName: 'GroupeSuperUser',
      tableName: 'groupe_super_users',
      timestamps: true,
      paranoid: false,
      underscored: true,
      indexes: [
        { fields: ['groupe_id', 'user_id'], unique: true }
      ]
    }
  );

  GroupeSuperUser.associate = (models) => {
    // Super user (User model)
    GroupeSuperUser.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'superUser'
    });

    // Groupe
    GroupeSuperUser.belongsTo(models.GroupeEntreprise, {
      foreignKey: 'groupe_id',
      as: 'groupe'
    });

    // Assigné par (Admin central)
    GroupeSuperUser.belongsTo(models.User, {
      foreignKey: 'assigned_by',
      as: 'assignedByUser'
    });
  };

  return GroupeSuperUser;
};
