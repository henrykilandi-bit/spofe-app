// src/models/associations.js - Associations Sequelize pour SPOFE v2.1
export const defineAssociations = (models) => {
  const {
    User,
    Role,
    GroupeEntreprise,
    Compagnie,
    AppSetting,
    AuditTrail,
    Compagnie,
    JournalEntry,
    ChartOfAccount,
    JournalEntryLine
  } = models;

  // ===== ROLE Associations =====
  Role.hasMany(User, {
    foreignKey: 'role_id',
    as: 'users',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });

  // ===== GROUPE_ENTREPRISE Associations =====
  GroupeEntreprise.hasMany(User, {
    foreignKey: 'groupe_id',
    as: 'utilisateurs',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  GroupeEntreprise.hasMany(Compagnie, {
    foreignKey: 'groupe_id',
    as: 'compagnies',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  GroupeEntreprise.hasMany(AppSetting, {
    foreignKey: 'groupe_id',
    as: 'settings',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // ===== USER Associations =====
  User.belongsTo(Role, {
    foreignKey: 'role_id',
    as: 'role',
    onDelete: 'RESTRICT',
    onUpdate: 'CASCADE'
  });

  User.belongsTo(GroupeEntreprise, {
    foreignKey: 'groupe_id',
    as: 'groupe',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  User.hasMany(AuditTrail, {
    foreignKey: 'utilisateur_id',
    as: 'audits',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // ===== COMPAGNIE Associations =====
  Compagnie.belongsTo(GroupeEntreprise, {
    foreignKey: 'groupe_id',
    as: 'groupe',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // ===== APP_SETTING Associations =====
  AppSetting.belongsTo(GroupeEntreprise, {
    foreignKey: 'groupe_id',
    as: 'groupe',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });

  // ===== AUDIT_TRAIL Associations =====
  AuditTrail.belongsTo(User, {
    foreignKey: 'utilisateur_id',
    as: 'utilisateur',
    onDelete: 'SET NULL',
    onUpdate: 'CASCADE'
  });

  // ===== COMPANY Associations =====
  if (Compagnie && JournalEntry) {
    Compagnie.hasMany(JournalEntry, {
      foreignKey: 'company_id',
      as: 'journalEntries',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    JournalEntry.belongsTo(Compagnie, {
      foreignKey: 'company_id',
      as: 'company',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }

  if (Compagnie && ChartOfAccount) {
    Compagnie.hasMany(ChartOfAccount, {
      foreignKey: 'company_id',
      as: 'chartsOfAccounts',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    ChartOfAccount.belongsTo(Compagnie, {
      foreignKey: 'company_id',
      as: 'company',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }

  // ===== USER Associations =====
  if (User && JournalEntry) {
    User.hasMany(JournalEntry, {
      foreignKey: 'user_id',
      as: 'journalEntries',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });

    JournalEntry.belongsTo(User, {
      foreignKey: 'user_id',
      as: 'createdBy',
      onDelete: 'SET NULL',
      onUpdate: 'CASCADE'
    });
  }

  // ===== JOURNAL_ENTRY Associations =====
  if (JournalEntry && JournalEntryLine) {
    JournalEntry.hasMany(JournalEntryLine, {
      foreignKey: 'entry_id',
      as: 'lines',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });

    JournalEntryLine.belongsTo(JournalEntry, {
      foreignKey: 'entry_id',
      as: 'entry',
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE'
    });
  }
};
