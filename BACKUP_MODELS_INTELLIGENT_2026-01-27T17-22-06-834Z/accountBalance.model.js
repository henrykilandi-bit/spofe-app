import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { logInfo, logError, logSecurity } from '../utils/logger.js';

const AccountBalance = sequelize.define('AccountBalance', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    accountId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'chartsOfAccounts',
            key: 'id'
        }
    },
    company_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    periodMonth: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Month (1-12)'
    },
    periodYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Fiscal year'
    },
    openingBalance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    debitMovement: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    creditMovement: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    closingBalance: {
        type: DataTypes.DECIMAL(15, 2),
        defaultValue: 0
    },
    isLocked: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Period is locked for further entries'
    },
    lockedDate: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, {
    tableName: 'accountBalances',
    timestamps: true,
    underscored: true,
    created_at: 'created_at',
    updated_at: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
        { fields: ['account_id'] },
        { fields: ['company_id'] },
        { fields: ['period_year', 'period_month'] },
        { fields: ['account_id', 'company_id', 'period_year', 'period_month'], unique: true }
    ],
    hooks: {
        beforeCreate: async (balance, options) => {
            try {
                // 1️⃣ PERIOD VALIDATION
                if (!balance.periodMonth || balance.periodMonth < 1 || balance.periodMonth > 12) {
                    throw new Error(`Invalid month: ${balance.periodMonth}. Must be 1-12`);
                }
                if (!balance.periodYear || balance.periodYear < 2000 || balance.periodYear > 2100) {
                    throw new Error(`Invalid year: ${balance.periodYear}`);
                }

                // 2️⃣ BALANCE CALCULATION
                const openingBalance = parseFloat(balance.openingBalance || 0);
                const debitMov = parseFloat(balance.debitMovement || 0);
                const creditMov = parseFloat(balance.creditMovement || 0);
                balance.closingBalance = parseFloat((openingBalance + debitMov - creditMov).toFixed(2));

                // 3️⃣ DEFAULTS
                balance.isLocked = false;
                balance.lockedDate = null;

                // 4️⃣ PRECISION
                balance.openingBalance = parseFloat((openingBalance).toFixed(2));
                balance.debitMovement = parseFloat((debitMov).toFixed(2));
                balance.creditMovement = parseFloat((creditMov).toFixed(2));

                logInfo(`AccountBalance.beforeCreate: Balance calculated for period ${balance.periodYear}-${balance.periodMonth}`);
            } catch (error) {
                logError(`AccountBalance.beforeCreate error: ${error.message}`);
                throw error;
            }
        },

        beforeUpdate: async (balance, options) => {
            try {
                // 1️⃣ PREVENT UPDATES IF LOCKED
                if (balance._previousDataValues.isLocked === true) {
                    throw new Error('Cannot update locked period balances. Unlock period first.');
                }

                // 2️⃣ RECALCULATE CLOSING BALANCE (if movements changed)
                if (balance.changed('openingBalance') || balance.changed('debitMovement') || balance.changed('creditMovement')) {
                    const openingBalance = parseFloat(balance.openingBalance || 0);
                    const debitMov = parseFloat(balance.debitMovement || 0);
                    const creditMov = parseFloat(balance.creditMovement || 0);
                    balance.closingBalance = parseFloat((openingBalance + debitMov - creditMov).toFixed(2));

                    // Precision
                    balance.openingBalance = parseFloat((openingBalance).toFixed(2));
                    balance.debitMovement = parseFloat((debitMov).toFixed(2));
                    balance.creditMovement = parseFloat((creditMov).toFixed(2));
                }

                // 3️⃣ LOCK DATE MANAGEMENT
                if (balance.changed('isLocked')) {
                    if (balance.isLocked === true) {
                        balance.lockedDate = new Date();
                        logSecurity(`AccountBalance locked: ${balance.periodYear}-${balance.periodMonth}`);
                    } else {
                        balance.lockedDate = null;
                        logSecurity(`AccountBalance unlocked: ${balance.periodYear}-${balance.periodMonth}`);
                    }
                }

                logInfo(`AccountBalance.beforeUpdate: Balance prepared for update`);
            } catch (error) {
                logError(`AccountBalance.beforeUpdate error: ${error.message}`);
                throw error;
            }
        }
    }
});

export default AccountBalance;
