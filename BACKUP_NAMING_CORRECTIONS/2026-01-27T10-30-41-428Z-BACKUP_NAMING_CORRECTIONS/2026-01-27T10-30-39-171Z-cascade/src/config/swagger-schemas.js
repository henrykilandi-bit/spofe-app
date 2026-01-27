// Schémas de données complets pour Swagger/OpenAPI
export const swaggerSchemas = {
  // ========== AUTH & USER ==========
  User: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid', example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' },
      username: { type: 'string', example: 'john_doe' },
      email: { type: 'string', format: 'email', example: 'john@example.com' },
      role: { type: 'string', enum: ['user', 'admin', 'accountant', 'auditor'], example: 'user' },
      isActive: { type: 'boolean', example: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },

  LoginRequest: {
    type: 'object',
    required: ['email', 'password'],
    properties: {
      email: { type: 'string', format: 'email', example: 'admin@spofe.local' },
      password: { type: 'string', example: 'admin123' }
    }
  },

  LoginResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Connexion réussie' },
      data: {
        type: 'object',
        properties: {
          user: { $ref: '#/components/schemas/User' },
          token: { type: 'string', example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' },
          refreshToken: { type: 'string' }
        }
      }
    }
  },

  // ========== CHART OF ACCOUNTS (Plan Comptable) ==========
  Account: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      code: { type: 'string', example: '101000', description: 'Code compte OHADA' },
      label: { type: 'string', example: 'Capital social' },
      type: { 
        type: 'string', 
        enum: ['ASSET', 'LIABILITY', 'EQUITY', 'INCOME', 'EXPENSE'],
        example: 'EQUITY' 
      },
      nature: { 
        type: 'string', 
        enum: ['DEBIT', 'CREDIT'],
        example: 'CREDIT' 
      },
      class: { type: 'integer', minimum: 1, maximum: 8, example: 1 },
      parent_id: { type: 'string', format: 'uuid', nullable: true },
      is_active: { type: 'boolean', example: true },
      is_reconcilable: { type: 'boolean', example: false },
      company_id: { type: 'string', format: 'uuid' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },

  AccountListResponse: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      data: {
        type: 'array',
        items: { $ref: '#/components/schemas/Account' }
      },
      pagination: {
        type: 'object',
        properties: {
          total: { type: 'integer', example: 150 },
          page: { type: 'integer', example: 1 },
          pageSize: { type: 'integer', example: 50 }
        }
      }
    }
  },

  // ========== JOURNAL ENTRIES (Écritures) ==========
  JournalEntry: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      entry_number: { type: 'string', example: 'OD-2026-001' },
      entry_date: { type: 'string', format: 'date', example: '2026-01-17' },
      description: { type: 'string', example: 'Achat marchandises' },
      journal_type: { 
        type: 'string', 
        enum: ['AC', 'VE', 'TR', 'BQ', 'CA', 'OD'],
        example: 'AC',
        description: 'AC=Achat, VE=Vente, TR=Trésorerie, BQ=Banque, CA=Caisse, OD=Opérations diverses'
      },
      status: { 
        type: 'string', 
        enum: ['DRAFT', 'VALIDATED', 'POSTED', 'CANCELLED'],
        example: 'DRAFT' 
      },
      total_debit: { type: 'number', format: 'decimal', example: 1000.00 },
      total_credit: { type: 'number', format: 'decimal', example: 1000.00 },
      company_id: { type: 'string', format: 'uuid' },
      fiscal_year_id: { type: 'string', format: 'uuid' },
      created_by: { type: 'string', format: 'uuid' },
      validated_by: { type: 'string', format: 'uuid', nullable: true },
      validated_at: { type: 'string', format: 'date-time', nullable: true },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
      lines: {
        type: 'array',
        items: { $ref: '#/components/schemas/JournalEntryLine' }
      }
    }
  },

  JournalEntryLine: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      journal_entry_id: { type: 'string', format: 'uuid' },
      account_id: { type: 'string', format: 'uuid' },
      account_code: { type: 'string', example: '601100' },
      account_label: { type: 'string', example: 'Achats de marchandises' },
      debit: { type: 'number', format: 'decimal', example: 1000.00 },
      credit: { type: 'number', format: 'decimal', example: 0.00 },
      description: { type: 'string', example: 'Achat du 17/01/2026' },
      third_party_id: { type: 'string', format: 'uuid', nullable: true },
      line_number: { type: 'integer', example: 1 }
    }
  },

  // ========== GENERAL LEDGER (Grand Livre) ==========
  GeneralLedger: {
    type: 'object',
    properties: {
      account_code: { type: 'string', example: '601100' },
      account_label: { type: 'string', example: 'Achats de marchandises' },
      opening_balance: { type: 'number', format: 'decimal', example: 0.00 },
      total_debit: { type: 'number', format: 'decimal', example: 15000.00 },
      total_credit: { type: 'number', format: 'decimal', example: 2000.00 },
      closing_balance: { type: 'number', format: 'decimal', example: 13000.00 },
      movements: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            date: { type: 'string', format: 'date' },
            entry_number: { type: 'string' },
            description: { type: 'string' },
            debit: { type: 'number', format: 'decimal' },
            credit: { type: 'number', format: 'decimal' },
            balance: { type: 'number', format: 'decimal' }
          }
        }
      }
    }
  },

  // ========== TRIAL BALANCE (Balance) ==========
  TrialBalance: {
    type: 'object',
    properties: {
      fiscal_year: { type: 'string', example: '2026' },
      period_start: { type: 'string', format: 'date' },
      period_end: { type: 'string', format: 'date' },
      accounts: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            account_code: { type: 'string' },
            account_label: { type: 'string' },
            opening_debit: { type: 'number', format: 'decimal' },
            opening_credit: { type: 'number', format: 'decimal' },
            period_debit: { type: 'number', format: 'decimal' },
            period_credit: { type: 'number', format: 'decimal' },
            closing_debit: { type: 'number', format: 'decimal' },
            closing_credit: { type: 'number', format: 'decimal' }
          }
        }
      },
      totals: {
        type: 'object',
        properties: {
          opening_debit: { type: 'number', format: 'decimal' },
          opening_credit: { type: 'number', format: 'decimal' },
          period_debit: { type: 'number', format: 'decimal' },
          period_credit: { type: 'number', format: 'decimal' },
          closing_debit: { type: 'number', format: 'decimal' },
          closing_credit: { type: 'number', format: 'decimal' }
        }
      }
    }
  },

  // ========== FINANCIAL STATEMENTS (États financiers) ==========
  BalanceSheet: {
    type: 'object',
    properties: {
      fiscal_year: { type: 'string', example: '2026' },
      date: { type: 'string', format: 'date' },
      assets: {
        type: 'object',
        properties: {
          non_current_assets: { type: 'number', format: 'decimal' },
          current_assets: { type: 'number', format: 'decimal' },
          total_assets: { type: 'number', format: 'decimal' }
        }
      },
      liabilities: {
        type: 'object',
        properties: {
          equity: { type: 'number', format: 'decimal' },
          non_current_liabilities: { type: 'number', format: 'decimal' },
          current_liabilities: { type: 'number', format: 'decimal' },
          total_liabilities: { type: 'number', format: 'decimal' }
        }
      }
    }
  },

  IncomeStatement: {
    type: 'object',
    properties: {
      fiscal_year: { type: 'string', example: '2026' },
      period_start: { type: 'string', format: 'date' },
      period_end: { type: 'string', format: 'date' },
      revenue: { type: 'number', format: 'decimal', example: 500000.00 },
      cost_of_sales: { type: 'number', format: 'decimal', example: 300000.00 },
      gross_profit: { type: 'number', format: 'decimal', example: 200000.00 },
      operating_expenses: { type: 'number', format: 'decimal', example: 120000.00 },
      operating_income: { type: 'number', format: 'decimal', example: 80000.00 },
      financial_income: { type: 'number', format: 'decimal', example: 5000.00 },
      financial_expenses: { type: 'number', format: 'decimal', example: 10000.00 },
      net_income_before_tax: { type: 'number', format: 'decimal', example: 75000.00 },
      tax: { type: 'number', format: 'decimal', example: 22500.00 },
      net_income: { type: 'number', format: 'decimal', example: 52500.00 }
    }
  },

  // ========== THIRD PARTIES (Tiers) ==========
  ThirdParty: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      code: { type: 'string', example: 'CL-001' },
      name: { type: 'string', example: 'SARL ACME' },
      type: { 
        type: 'string', 
        enum: ['CUSTOMER', 'SUPPLIER', 'BOTH'],
        example: 'CUSTOMER' 
      },
      email: { type: 'string', format: 'email' },
      phone: { type: 'string' },
      address: { type: 'string' },
      tax_id: { type: 'string', example: 'FR12345678901' },
      customer_account: { type: 'string', example: '411000', nullable: true },
      supplier_account: { type: 'string', example: '401000', nullable: true },
      is_active: { type: 'boolean', example: true },
      company_id: { type: 'string', format: 'uuid' },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' }
    }
  },

  // ========== COMPANY (Société) ==========
  Company: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      code: { type: 'string', example: 'SOC001' },
      name: { type: 'string', example: 'SPOFE SARL' },
      legal_form: { type: 'string', example: 'SARL' },
      tax_id: { type: 'string', example: 'FR12345678901' },
      currency: { type: 'string', example: 'XOF', description: 'ISO 4217' },
      fiscal_year_start: { type: 'string', format: 'date', example: '2026-01-01' },
      fiscal_year_end: { type: 'string', format: 'date', example: '2026-12-31' },
      address: { type: 'string' },
      is_active: { type: 'boolean', example: true }
    }
  },

  // ========== FISCAL YEAR (Exercice) ==========
  FiscalYear: {
    type: 'object',
    properties: {
      id: { type: 'string', format: 'uuid' },
      company_id: { type: 'string', format: 'uuid' },
      year: { type: 'string', example: '2026' },
      start_date: { type: 'string', format: 'date', example: '2026-01-01' },
      end_date: { type: 'string', format: 'date', example: '2026-12-31' },
      status: { 
        type: 'string', 
        enum: ['OPEN', 'CLOSED', 'ARCHIVED'],
        example: 'OPEN' 
      },
      is_current: { type: 'boolean', example: true }
    }
  },

  // ========== ERROR ==========
  Error: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: false },
      message: { type: 'string', example: 'Une erreur est survenue' },
      errors: { 
        type: 'object',
        additionalProperties: { type: 'string' }
      }
    }
  },

  // ========== SUCCESS ==========
  Success: {
    type: 'object',
    properties: {
      success: { type: 'boolean', example: true },
      message: { type: 'string', example: 'Opération réussie' },
      data: { type: 'object' }
    }
  }
};

export default swaggerSchemas;
