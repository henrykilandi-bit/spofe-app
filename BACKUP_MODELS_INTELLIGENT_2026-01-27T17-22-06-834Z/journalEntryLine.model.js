import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { logInfo, logError, logSecurity } from '../utils/logger.js';

const JournalEntryLine = sequelize.define('JournalEntryLine', {
    id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    journalEntryId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'journal_entry_id',
        references: {
            model: 'journal_entries',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    },
    accountId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'account_id',
        references: {
            model: 'chartsOfAccounts',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'RESTRICT'
    },
    thirdPartyId: {
        type: DataTypes.UUID,
        allowNull: true,
        field: 'third_party_id',
        references: {
            model: 'third_parties',
            key: 'id'
        },
        comment: 'Customer, supplier, or other third party'
    },
    lineDescription: {
        type: DataTypes.TEXT,
        allowNull: true,
        field: 'line_description'
    },
    amount: {
        type: DataTypes.DECIMAL(15, 2),
        allowNull: false,
        comment: 'Montant de la ligne'
    },
    type: {
        type: DataTypes.ENUM('DEBIT', 'CREDIT'),
        allowNull: false,
        comment: 'Type de ligne: DEBIT ou CREDIT'
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Description détaillée de la ligne'
    },
    isReconciled: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        allowNull: false,
        field: 'is_reconciled',
        comment: 'Indique si la ligne est réconciliée'
    },
    // Champs additionnels pour compatibilité
    debit: {
        type: DataTypes.VIRTUAL(DataTypes.DECIMAL(15, 2)),
        get() {
            return this.type === 'DEBIT' ? this.amount : 0;
        },
        set(value) {
            if (value > 0) {
                this.setDataValue('amount', value);
                this.setDataValue('type', 'DEBIT');
            }
        }
    },
    credit: {
        type: DataTypes.VIRTUAL(DataTypes.DECIMAL(15, 2)),
        get() {
            return this.type === 'CREDIT' ? this.amount : 0;
        },
        set(value) {
            if (value > 0) {
                this.setDataValue('amount', value);
                this.setDataValue('type', 'CREDIT');
            }
        }
    }
}, {
    tableName: 'journal_entry_lines',
    timestamps: true,
    underscored: true,
    created_at: 'created_at',
    updated_at: 'updated_at',
    paranoid: true,
    deletedAt: 'deleted_at',
    indexes: [
        { fields: ['journal_entry_id'] },
        { fields: ['account_id'] },
        { fields: ['third_party_id'] },
        { fields: ['type'] },
        { fields: ['is_reconciled'] }
    ],
    hooks: {
        beforeCreate: async (line, options) => {
            try {
                // 1️⃣ TYPE VALIDATION & NORMALIZATION
                const validTypes = ['DEBIT', 'CREDIT'];
                if (!validTypes.includes(line.type)) {
                    throw new Error(`Invalid line type: ${line.type}. Must be DEBIT or CREDIT`);
                }
                line.type = line.type.toUpperCase();

                // 2️⃣ AMOUNT VALIDATION
                if (!line.amount || line.amount <= 0) {
                    throw new Error('Amount must be greater than 0');
                }
                line.amount = parseFloat(line.amount).toFixed(2);

                // 3️⃣ DESCRIPTION NORMALIZATION
                if (line.lineDescription) {
                    line.lineDescription = line.lineDescription.trim();
                }
                if (line.description) {
                    line.description = line.description.trim();
                }

                // 4️⃣ RECONCILIATION DEFAULT
                if (line.isReconciled === null || line.isReconciled === undefined) {
                    line.isReconciled = false;
                }

                logInfo(`JournalEntryLine.beforeCreate: Line prepared (${line.type} ${line.amount})`);
            } catch (error) {
                logError(`JournalEntryLine.beforeCreate error: ${error.message}`);
                throw error;
            }
        },

        beforeUpdate: async (line, options) => {
            try {
                // 1️⃣ PREVENT TYPE CHANGE (XOR constraint)
                if (line.changed('type')) {
                    throw new Error('Cannot change line type after creation. Use reversal instead.');
                }

                // 2️⃣ AMOUNT VALIDATION (if changed)
                if (line.changed('amount')) {
                    if (!line.amount || line.amount <= 0) {
                        throw new Error('Amount must be greater than 0');
                    }
                    line.amount = parseFloat(line.amount).toFixed(2);
                }

                // 3️⃣ NORMALIZATION (if changed)
                if (line.changed('description')) {
                    line.description = line.description ? line.description.trim() : null;
                }
                if (line.changed('lineDescription')) {
                    line.lineDescription = line.lineDescription ? line.lineDescription.trim() : null;
                }

                logInfo(`JournalEntryLine.beforeUpdate: Line prepared for update`);
            } catch (error) {
                logError(`JournalEntryLine.beforeUpdate error: ${error.message}`);
                throw error;
            }
        }
    }
});

export default JournalEntryLine;
