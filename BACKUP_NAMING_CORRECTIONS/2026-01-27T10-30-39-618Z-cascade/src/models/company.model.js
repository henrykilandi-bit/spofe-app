import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';

const Compagnie = sequelize.define('Compagnie', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    registrationNumber: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true
    },
    city: {
        type: DataTypes.STRING,
        allowNull: true
    },
    country: {
        type: DataTypes.STRING,
        defaultValue: 'Côte d\'Ivoire'
    },
    fiscalYearStart: {
        type: DataTypes.INTEGER,
        defaultValue: 1, // January
        comment: 'Month when fiscal year starts (1-12)'
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'XOF' // West African franc
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'compagnies',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    deletedAt: 'deleted_at',
    paranoid: true
});

export default Compagnie;
