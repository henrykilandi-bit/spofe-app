// src/database/migrations/001-create-tables.js
// Create database tables for SPOFE OHADA accounting system

/**
 * Migration 001: Create all database tables
 * Creates Users, Companies, ChartOfAccounts, JournalEntries, JournalEntryLines, AccountBalances
 */

export default {
  up: async (queryInterface, Sequelize) => {
    try {
      // 1. Create User table (already exists but ensure consistency)
      await queryInterface.createTable('Users', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        username: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true
        },
        email: {
          type: Sequelize.STRING(100),
          allowNull: false,
          unique: true
        },
        password: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        role: {
          type: Sequelize.ENUM('ADMIN', 'ACCOUNTANT', 'MANAGER', 'VIEWER'),
          defaultValue: 'VIEWER'
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        lastLogin: {
          type: Sequelize.DATE,
          allowNull: true
        },
        loginAttempts: {
          type: Sequelize.INTEGER,
          defaultValue: 0
        },
        lockUntil: {
          type: Sequelize.DATE,
          allowNull: true
        },
        created_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        updated_at: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      }, {
        ifNotExists: true
      });

      // 2. Create Company table
      await queryInterface.createTable('Companies', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        companyName: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        registrationNumber: {
          type: Sequelize.STRING(50),
          unique: true
        },
        fiscalYearStart: {
          type: Sequelize.INTEGER,
          comment: 'Month number (1-12) when fiscal year starts'
        },
        currency: {
          type: Sequelize.STRING(3),
          defaultValue: 'XOF'
        },
        country: {
          type: Sequelize.STRING(100)
        },
        taxIdentificationNumber: {
          type: Sequelize.STRING(50)
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        date_creation: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        date_modification: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      });

      // 3. Create Chart of Accounts table
      await queryInterface.createTable('ChartOfAccounts', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        company_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Companies', key: 'id' },
          onDelete: 'CASCADE'
        },
        accountNumber: {
          type: Sequelize.STRING(20),
          allowNull: false
        },
        accountName: {
          type: Sequelize.STRING(255),
          allowNull: false
        },
        accountType: {
          type: Sequelize.ENUM('ASSET', 'LIABILITY', 'EQUITY', 'REVENUE', 'EXPENSE'),
          allowNull: false
        },
        category: {
          type: Sequelize.STRING(100)
        },
        level: {
          type: Sequelize.INTEGER,
          comment: 'Hierarchical level: 1 (main), 2 (sub), 3 (detail)'
        },
        parentAccountNumber: {
          type: Sequelize.STRING(20),
          allowNull: true
        },
        allowSubAccounts: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        is_active: {
          type: Sequelize.BOOLEAN,
          defaultValue: true
        },
        date_creation: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        date_modification: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      });

      // Create unique index for account number per company
      await queryInterface.addIndex('ChartOfAccounts', ['company_id', 'accountNumber'], {
        name: 'idx_company_account_number',
        unique: true
      });

      // 4. Create Journal Entry table
      await queryInterface.createTable('JournalEntries', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        company_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Companies', key: 'id' },
          onDelete: 'CASCADE'
        },
        journalCode: {
          type: Sequelize.STRING(20),
          allowNull: false
        },
        entryReference: {
          type: Sequelize.STRING(50),
          unique: true
        },
        entryDate: {
          type: Sequelize.DATE,
          allowNull: false
        },
        description: {
          type: Sequelize.TEXT
        },
        status: {
          type: Sequelize.ENUM('DRAFT', 'SUBMITTED', 'APPROVED', 'POSTED', 'REVERSED'),
          defaultValue: 'DRAFT'
        },
        createdBy: {
          type: Sequelize.INTEGER,
          references: { model: 'Users', key: 'id' },
          onDelete: 'SET NULL'
        },
        approvedBy: {
          type: Sequelize.INTEGER,
          allowNull: true,
          references: { model: 'Users', key: 'id' },
          onDelete: 'SET NULL'
        },
        approvalDate: {
          type: Sequelize.DATE,
          allowNull: true
        },
        totalDebit: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        totalCredit: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        isBalanced: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        date_creation: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        date_modification: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      });

      // Create indexes for entry queries
      await queryInterface.addIndex('JournalEntries', ['company_id']);
      await queryInterface.addIndex('JournalEntries', ['entryDate']);
      await queryInterface.addIndex('JournalEntries', ['status']);

      // 5. Create Journal Entry Lines table
      await queryInterface.createTable('JournalEntryLines', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        journalEntryId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'JournalEntries', key: 'id' },
          onDelete: 'CASCADE'
        },
        accountId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'ChartOfAccounts', key: 'id' },
          onDelete: 'RESTRICT'
        },
        debitAmount: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        creditAmount: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        thirdPartyReference: {
          type: Sequelize.STRING(100),
          allowNull: true
        },
        description: {
          type: Sequelize.TEXT
        },
        isReconciled: {
          type: Sequelize.BOOLEAN,
          defaultValue: false
        },
        reconcileDate: {
          type: Sequelize.DATE,
          allowNull: true
        },
        date_creation: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        date_modification: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      });

      // 6. Create Account Balance table
      await queryInterface.createTable('AccountBalances', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true
        },
        company_id: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'Companies', key: 'id' },
          onDelete: 'CASCADE'
        },
        accountId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: { model: 'ChartOfAccounts', key: 'id' },
          onDelete: 'RESTRICT'
        },
        fiscalYear: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        monthNumber: {
          type: Sequelize.INTEGER,
          allowNull: false
        },
        openingBalance: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        debitMovement: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        creditMovement: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        closingBalance: {
          type: Sequelize.DECIMAL(15, 2),
          defaultValue: 0
        },
        date_creation: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        },
        date_modification: {
          type: Sequelize.DATE,
          defaultValue: Sequelize.NOW
        }
      });

      // Create unique index for balance tracking
      await queryInterface.addIndex('AccountBalances', ['company_id', 'accountId', 'fiscalYear', 'monthNumber'], {
        name: 'idx_balance_tracking',
        unique: true
      });

      console.log('✅ All tables created successfully');
    } catch (error) {
      console.error('❌ Migration error:', error);
      throw error;
    }
  },

  down: async (queryInterface, Sequelize) => {
    try {
      // Drop tables in reverse order of creation
      await queryInterface.dropTable('AccountBalances', { ifExists: true });
      await queryInterface.dropTable('JournalEntryLines', { ifExists: true });
      await queryInterface.dropTable('JournalEntries', { ifExists: true });
      await queryInterface.dropTable('ChartOfAccounts', { ifExists: true });
      await queryInterface.dropTable('Companies', { ifExists: true });
      // User table might be used elsewhere, so be careful
      
      console.log('✅ Migration rolled back');
    } catch (error) {
      console.error('❌ Rollback error:', error);
      throw error;
    }
  }
};
