/**
 * PendingApproval Model
 * Représente les inscriptions utilisateurs en attente d'approbation
 * par le super user du groupe concerné
 */

module.exports = (sequelize, DataTypes) => {
  const PendingApproval = sequelize.define(
    'PendingApproval',
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      groupe_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'groupes_entreprises',
          key: 'id'
        }
      },
      company_id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'compagnies',
          key: 'id'
        }
      },
      status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        defaultValue: 'pending',
        allowNull: false
      },
      rejection_reason: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      approved_by: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
          model: 'users',
          key: 'id'
        }
      },
      approved_at: {
        type: DataTypes.DATE,
        allowNull: true
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
      modelName: 'PendingApproval',
      tableName: 'pending_approvals',
      timestamps: true,
      paranoid: false,
      underscored: true,
      indexes: [
        { fields: ['user_id'] },
        { fields: ['groupe_id'] },
        { fields: ['status'] },
        { fields: ['created_at'] }
      ]
    }
  );

  PendingApproval.associate = (models) => {
    // Utilisateur à approuver
    PendingApproval.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'user'
    });

    // Groupe concerné
    PendingApproval.belongsTo(models.GroupeEntreprise, {
      foreignKey: 'groupe_id',
      as: 'groupe'
    });

    // Entreprise
    PendingApproval.belongsTo(models.Compagnie, {
      foreignKey: 'company_id',
      as: 'company'
    });

    // Super user qui approuve/rejette
    PendingApproval.belongsTo(models.User, {
      foreignKey: 'approved_by',
      as: 'approvedByUser'
    });
  };

  return PendingApproval;
};
