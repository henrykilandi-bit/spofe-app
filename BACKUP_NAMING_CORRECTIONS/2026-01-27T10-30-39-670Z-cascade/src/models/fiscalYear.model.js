/**
 * Model: Fiscal Year
 * Table: fiscal_years
 */

import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const FiscalYear = sequelize.define('FiscalYear', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'company_id'
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'start_date'
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'end_date'
  },
  status: {
    type: DataTypes.ENUM('OPEN', 'CLOSED', 'ARCHIVED'),
    defaultValue: 'OPEN'
  },
  isCurrent: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    field: 'is_current'
  },
  closedAt: {
    type: DataTypes.DATE,
    allowNull: true,
    field: 'closed_at'
  },
  closedBy: {
    type: DataTypes.INTEGER,
    allowNull: true,
    field: 'closed_by'
  }
}, {
  tableName: 'fiscal_years',
  underscored: true,
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  indexes: [
    { fields: ['company_id'] },
    { fields: ['status'] },
    { fields: ['is_current'] }
  ]
});

export default FiscalYear;
