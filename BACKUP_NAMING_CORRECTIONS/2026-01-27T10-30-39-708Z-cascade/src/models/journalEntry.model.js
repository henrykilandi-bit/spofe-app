import { DataTypes } from 'sequelize';
import sequelize from '../config/database.js';
import { logInfo, logError, logSecurity } from '../utils/logger.js';

const JournalEntry = sequelize.define('JournalEntry', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
    allowNull: false,
  },

  companyId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    field: 'company_id',
    references: {
      model: 'companies',
      key: 'id',
    },
    onDelete: 'CASCADE',
  },

  journalCode: {
    type: DataTypes.STRING(10),
    allowNull: false,
    field: 'journal_code',
    comment: 'Code du journal (OD, AC, AN, etc.)',
  },

  entryNumber: {
    type: DataTypes.STRING(50),
    allowNull: false,
    unique: true,
    field: 'entry_number',
    comment: 'Numéro unique de l\'écriture comptable',
  },

  entryDate: {
    type: DataTypes.DATEONLY,
    allowNull: false,
    field: 'entry_date',
    comment: 'Date de l\'écriture comptable',
  },

  description: {
    type: DataTypes.STRING(255),
    allowNull: true,
    comment: 'Description ou libellé de l\'écriture',
  },

  status: {
    type: DataTypes.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'POSTED', 'REVERSED'),
    defaultValue: 'POSTED',
    allowNull: false,
  },

  totalDebit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'total_debit',
    defaultValue: 0.00,
    comment: 'Total du débit pour cette écriture',
  },

  totalCredit: {
    type: DataTypes.DECIMAL(15, 2),
    allowNull: false,
    field: 'total_credit',
    defaultValue: 0.00,
    comment: 'Total du crédit pour cette écriture',
  },
}, {
  tableName: 'journal_entries',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  paranoid: true,
  deletedAt: 'deleted_at',
  indexes: [
    { fields: ['company_id'] },
    { fields: ['entry_date'] },
    { fields: ['status'] },
    {
      unique: true,
      fields: ['company_id', 'entry_number'],
      name: 'idx_journal_company_number',
    },
  ],
  hooks: {
    beforeCreate: async (entry, options) => {
      try {
        // 1️⃣ ENTRY NUMBER GENERATION (if not provided)
        if (!entry.entryNumber) {
          const Sequelize = require('sequelize');
          const count = await JournalEntry.count({
            where: { companyId: entry.companyId },
            raw: true
          });
          const year = new Date().getFullYear();
          entry.entryNumber = `${entry.journalCode}-${year}-${String(count + 1).padStart(5, '0')}`;
        }

        // 2️⃣ NORMALIZATION
        entry.journalCode = entry.journalCode.toUpperCase().trim();
        entry.description = entry.description ? entry.description.trim() : null;

        // 3️⃣ INITIAL STATUS SET
        if (!entry.status) {
          entry.status = 'DRAFT';
        }

        // 4️⃣ DEBIT/CREDIT INITIALIZATION
        if (entry.totalDebit === null || entry.totalDebit === undefined) {
          entry.totalDebit = 0.00;
        }
        if (entry.totalCredit === null || entry.totalCredit === undefined) {
          entry.totalCredit = 0.00;
        }

        logInfo(`JournalEntry.beforeCreate: Entry ${entry.entryNumber} prepared for company ${entry.companyId}`);
        logSecurity(`Journal entry created: ${entry.entryNumber} (${entry.journalCode}) on ${entry.entryDate}`);
      } catch (error) {
        logError(`JournalEntry.beforeCreate error: ${error.message}`);
        throw new Error(`Journal entry creation failed: ${error.message}`);
      }
    },

    beforeUpdate: async (entry, options) => {
      try {
        // 1️⃣ STATUS WORKFLOW VALIDATION
        const validTransitions = {
          'DRAFT': ['SUBMITTED', 'REVERSED'],
          'SUBMITTED': ['APPROVED', 'DRAFT', 'REVERSED'],
          'APPROVED': ['POSTED', 'REVERSED'],
          'POSTED': ['REVERSED'],
          'REVERSED': []
        };

        if (entry.changed('status')) {
          const oldStatus = entry._previousDataValues.status;
          const newStatus = entry.status;
          const allowed = validTransitions[oldStatus] || [];

          if (!allowed.includes(newStatus)) {
            throw new Error(`Invalid status transition: ${oldStatus} → ${newStatus}`);
          }

          logSecurity(`JournalEntry status changed: ${entry.entryNumber} ${oldStatus} → ${newStatus}`);
        }

        // 2️⃣ DEBIT/CREDIT EQUALITY CHECK
        // Tolerance: 0.01 due to rounding
        const difference = Math.abs(
          parseFloat(entry.totalDebit || 0) - parseFloat(entry.totalCredit || 0)
        );
        if (entry.status === 'POSTED' && difference > 0.01) {
          throw new Error(`Debit and credit must be equal. Difference: ${difference.toFixed(2)}`);
        }

        // 3️⃣ NORMALIZATION (if changed)
        if (entry.changed('journalCode')) {
          entry.journalCode = entry.journalCode.toUpperCase().trim();
        }
        if (entry.changed('description')) {
          entry.description = entry.description ? entry.description.trim() : null;
        }

        // 4️⃣ PREVENT EDIT AFTER POSTING
        if (entry._previousDataValues.status === 'POSTED' && entry.changed('status') === false) {
          throw new Error('Cannot modify posted entries. Use reversal instead.');
        }

        logInfo(`JournalEntry.beforeUpdate: Entry ${entry.entryNumber} prepared for update`);
      } catch (error) {
        logError(`JournalEntry.beforeUpdate error: ${error.message}`);
        throw error;
      }
    },

    afterCreate: async (entry, options) => {
      try {
        // 1️⃣ AUDIT TRAIL
        if (options.sequelize) {
          const { AuditTrail } = options.sequelize.models;
          if (AuditTrail) {
            await AuditTrail.create({
              entityType: 'JournalEntry',
              entityId: entry.id,
              action: 'CREATE',
              changes: {
                entryNumber: entry.entryNumber,
                journalCode: entry.journalCode,
                status: entry.status,
                totalDebit: entry.totalDebit,
                totalCredit: entry.totalCredit
              },
              userId: options.userId,
              ipAddress: options.ipAddress
            });
            logInfo(`JournalEntry.afterCreate: Audit trail created for ${entry.entryNumber}`);
          }
        }

        logInfo(`JournalEntry.afterCreate: Post-creation tasks completed for ${entry.entryNumber}`);
      } catch (error) {
        logError(`JournalEntry.afterCreate error: ${error.message}`);
        // Don't throw
      }
    }
  }
});

export default JournalEntry;
