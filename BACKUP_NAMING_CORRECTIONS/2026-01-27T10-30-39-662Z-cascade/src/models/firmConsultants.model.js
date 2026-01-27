// src/models/firmConsultants.model.js
import { DataTypes } from 'sequelize';

export default (sequelize) => {
  const FirmConsultants = sequelize.define(
    'FirmConsultants',
    {
      consultant_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        allowNull: false,
        comment: 'Référence vers l\'utilisateur consultant'
      },
      firm_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Référence vers le cabinet d\'expertise'
      },
      position: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Position dans le cabinet: associé, salarié, collaborateur'
      },
      join_date: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Date d\'entrée dans le cabinet'
      }
    },
    {
      tableName: 'firm_consultants',
      timestamps: true,
      underscored: true,
      createdAt: 'created_at',
      updatedAt: 'updated_at',
      indexes: [
        {
          fields: ['firm_id'],
          name: 'idx_firm_consultants_firm'
        },
        {
          fields: ['position'],
          name: 'idx_firm_consultants_position'
        },
        {
          fields: ['join_date'],
          name: 'idx_firm_consultants_join_date'
        }
      ]
    }
  );

  return FirmConsultants;
};
