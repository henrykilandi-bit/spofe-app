import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { logInfo, logError, logSecurity } from '../utils/logger.js';

const ChartOfAccount = sequelize.define('ChartOfAccount', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'compagnies',
            key: 'id'
        }
    },
    accountNumber: {
        type: DataTypes.STRING(20),
        allowNull: false,
        comment: 'OHADA account number (e.g., 101, 201, 301)'
    },
    accountName: {
        type: DataTypes.STRING,
        allowNull: false
    },
    accountType: {
        type: DataTypes.ENUM('ASSETS', 'LIABILITIES', 'EQUITY', 'REVENUES', 'EXPENSES', 'OTHER'),
        allowNull: false
    },
    subAccountType: {
        type: DataTypes.STRING(100),
        allowNull: true,
        comment: 'Sub-classification (e.g., BANK, CASH, INVENTORY)'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true
    },
    parentAccountId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'charts_of_accounts',
            key: 'id'
        },
        comment: 'For hierarchical accounts'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    isTaxable: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    allowSubAccounts: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    level: {
        type: DataTypes.INTEGER,
        defaultValue: 1,
        comment: 'Hierarchy level (1=main, 2=sub, etc.)'
    }
}, {
    tableName: 'charts_of_accounts',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
        { fields: ['company_id'] },
        { fields: ['account_number', 'company_id'], unique: true }
    ],
    hooks: {
        beforeCreate: async (account, options) => {
            try {
                // 1️⃣ OHADA VALIDATION - Format: XXX (3 digits)
                const ohadaPattern = /^\d{1,3}$/;
                if (!ohadaPattern.test(account.accountNumber)) {
                    throw new Error(`Invalid OHADA account number: ${account.accountNumber}. Expected format: 1-3 digits (e.g., 101, 201)`);
                }

                // 2️⃣ NORMALIZATION
                account.accountNumber = account.accountNumber.trim().padStart(3, '0');
                account.accountName = account.accountName.trim();
                account.accountType = account.accountType.toUpperCase();
                if (account.description) account.description = account.description.trim();
                if (account.subAccountType) account.subAccountType = account.subAccountType.toUpperCase().trim();

                // 3️⃣ HIERARCHY LEVEL CALCULATION
                if (!account.level) {
                    account.level = account.parentAccountId ? 2 : 1;
                }

                // 4️⃣ ACTIVE BY DEFAULT
                if (account.isActive === null || account.isActive === undefined) {
                    account.isActive = true;
                }

                logInfo(`ChartOfAccount.beforeCreate: Account ${account.accountNumber} (${account.accountName}) prepared`);
                logSecurity(`Chart of account created: ${account.accountNumber} - ${account.accountName}`);
            } catch (error) {
                logError(`ChartOfAccount.beforeCreate error: ${error.message}`);
                throw error;
            }
        },

        beforeUpdate: async (account, options) => {
            try {
                // 1️⃣ ACCOUNT NUMBER VALIDATION (if changed)
                if (account.changed('accountNumber')) {
                    const ohadaPattern = /^\d{1,3}$/;
                    if (!ohadaPattern.test(account.accountNumber)) {
                        throw new Error(`Invalid OHADA account number: ${account.accountNumber}`);
                    }
                    account.accountNumber = account.accountNumber.trim().padStart(3, '0');
                }

                // 2️⃣ PREVENT PARENT CHANGE FOR MAIN ACCOUNTS
                if (account.changed('parentAccountId') && account.level === 1 && account._previousDataValues.parentAccountId === null) {
                    throw new Error('Cannot change parent for main-level accounts');
                }

                // 3️⃣ NORMALIZATION (if changed)
                if (account.changed('accountName')) {
                    account.accountName = account.accountName.trim();
                }
                if (account.changed('description')) {
                    account.description = account.description ? account.description.trim() : null;
                }

                // 4️⃣ STATUS CHANGE LOGGING
                if (account.changed('isActive')) {
                    const status = account.isActive ? 'ACTIVATED' : 'DEACTIVATED';
                    logSecurity(`Chart account status: ${account.accountNumber} → ${status}`);
                }

                logInfo(`ChartOfAccount.beforeUpdate: Account ${account.accountNumber} prepared for update`);
            } catch (error) {
                logError(`ChartOfAccount.beforeUpdate error: ${error.message}`);
                throw error;
            }
        },

        afterCreate: async (account, options) => {
            try {
                // AUDIT TRAIL
                if (options.sequelize) {
                    const { AuditTrail } = options.sequelize.models;
                    if (AuditTrail) {
                        await AuditTrail.create({
                            entityType: 'ChartOfAccount',
                            entityId: account.id,
                            action: 'CREATE',
                            changes: {
                                accountNumber: account.accountNumber,
                                accountName: account.accountName,
                                accountType: account.accountType
                            },
                            userId: options.userId,
                            ipAddress: options.ipAddress
                        });
                        logInfo(`ChartOfAccount.afterCreate: Audit trail for ${account.accountNumber}`);
                    }
                }
            } catch (error) {
                logError(`ChartOfAccount.afterCreate error: ${error.message}`);
            }
        }
    }
});

export default ChartOfAccount;
