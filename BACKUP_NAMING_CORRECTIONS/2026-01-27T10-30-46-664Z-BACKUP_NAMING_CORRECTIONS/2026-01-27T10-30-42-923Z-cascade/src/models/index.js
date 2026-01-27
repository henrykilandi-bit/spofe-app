// Import des dépendances
import sequelize from '../config/database.js';
import User from './user.model.js';
import Compagnie from './compagnie.model.js';
import ChartOfAccount from './chartOfAccount.model.js';
import JournalEntry from './journalEntry.model.js';
import JournalEntryLine from './journalEntryLine.model.js';
import AccountBalance from './accountBalance.model.js';
import ThirdParty from './thirdParty.model.js';
import BusinessOperation from './businessOperation.model.js';
import OperationTemplate from './operationTemplate.model.js';
import BusinessOperationAudit from './businessOperationAudit.model.js';
import FiscalYear from './fiscalYear.model.js';
// SPOFE v2.1 - Modèles Sécurité & Organisation
import Role from './role.model.js';
import GroupeEntreprise from './groupeEntreprise.model.js';
import TwoFactorAuth from './twoFactorAuth.model.js';
import PasswordResetToken from './passwordResetToken.model.js';
import TokenBlacklist from './tokenBlacklist.model.js';
import SecurityEvent from './securityEvent.model.js';
import AuditTrail from './auditTrail.model.js';
import AppSettings from './appSettings.model.js';

// 🆕 SPOFE v2.1 - Modèles Consultants Multi-Groupes
import ConsultantGroupAssignment from './consultantGroupAssignment.model.js';
import ConsultantCompanyAccess from './consultantCompanyAccess.model.js';
import ConsultingFirm from './consultingFirm.model.js';
import FirmConsultants from './firmConsultants.model.js';

// 🆕 SPOFE v2.2 - Module Objectifs Stratégiques (Intelligence & IA)
import StrategicObjective from './strategicObjective.model.js';
import PerformanceIndicator from './performanceIndicator.model.js';
import ObjectiveAction from './objectiveAction.model.js';
import ExternalDataSource from './externalDataSource.model.js';

// Initialisation des modèles
const db = {
  sequelize,
  User,
  Compagnie,
  ChartOfAccount,
  JournalEntry,
  JournalEntryLine,
  AccountBalance,
  ThirdParty,
  BusinessOperation,
  OperationTemplate,
  BusinessOperationAudit,
  FiscalYear,
  // SPOFE v2.1 - Sécurité & Organisation
  Role,
  GroupeEntreprise,
  TwoFactorAuth,
  PasswordResetToken,
  TokenBlacklist,
  SecurityEvent,
  AuditTrail,
  AppSettings,
  // 🆕 SPOFE v2.1 - Consultants Multi-Groupes
  ConsultantGroupAssignment,
  ConsultantCompanyAccess,
  ConsultingFirm,
  FirmConsultants,
  // 🆕 SPOFE v2.2 - Module Objectifs Stratégiques
  StrategicObjective,
  PerformanceIndicator,
  ObjectiveAction,
  ExternalDataSource
};

// Définition des associations entre les modèles
Compagnie.hasMany(JournalEntry, { foreignKey: 'company_id', as: 'entries' });
JournalEntry.belongsTo(Compagnie, { foreignKey: 'company_id', as: 'company' });

Compagnie.hasMany(ChartOfAccount, { foreignKey: 'company_id', as: 'chartsOfAccounts' });
ChartOfAccount.belongsTo(Compagnie, { foreignKey: 'company_id', as: 'company' });

Compagnie.hasMany(AccountBalance, { foreignKey: 'company_id' });
AccountBalance.belongsTo(Compagnie, { foreignKey: 'company_id' });

JournalEntry.hasMany(JournalEntryLine, { foreignKey: 'journalEntryId', as: 'lines' });
JournalEntryLine.belongsTo(JournalEntry, { foreignKey: 'journalEntryId' });

ChartOfAccount.hasMany(JournalEntryLine, { foreignKey: 'accountId' });
JournalEntryLine.belongsTo(ChartOfAccount, { foreignKey: 'accountId' });

ChartOfAccount.hasMany(AccountBalance, { foreignKey: 'accountId' });
AccountBalance.belongsTo(ChartOfAccount, { foreignKey: 'accountId' });

// Relations ThirdParty
Compagnie.hasMany(ThirdParty, { foreignKey: 'company_id' });
ThirdParty.belongsTo(Compagnie, { foreignKey: 'company_id' });

JournalEntryLine.belongsTo(ThirdParty, { foreignKey: 'thirdPartyId' });
ThirdParty.hasMany(JournalEntryLine, { foreignKey: 'thirdPartyId' });

// Self-reference for hierarchical accounts
ChartOfAccount.hasMany(ChartOfAccount, {
  foreignKey: 'parentAccountId',
  as: 'subAccounts'
});
ChartOfAccount.belongsTo(ChartOfAccount, {
  foreignKey: 'parentAccountId',
  as: 'parentAccount'
});

// ==========================================
// Relations Pré-Comptabilité (Business Operations)
// ==========================================

// Relations JournalEntry (harmonisées UUID)
Company.hasMany(JournalEntry, { foreignKey: 'company_id' });
JournalEntry.belongsTo(Company, { foreignKey: 'company_id' });

// Relations User → JournalEntry (workflow) - COMMENTÉES CAR COLONNES ABSENTES EN BASE
// User.hasMany(JournalEntry, { foreignKey: 'user_id', as: 'entriesCreated' });
// User.hasMany(JournalEntry, { foreignKey: 'submittedBy', as: 'entriesSubmitted' });
// User.hasMany(JournalEntry, { foreignKey: 'approvedBy', as: 'entriesApproved' });
// JournalEntry.belongsTo(User, { foreignKey: 'user_id', as: 'creator' });
// JournalEntry.belongsTo(User, { foreignKey: 'submittedBy', as: 'submitter' });
// JournalEntry.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });

// BusinessOperation → ThirdParty
ThirdParty.hasMany(BusinessOperation, { foreignKey: 'thirdPartyId', as: 'operations' });
BusinessOperation.belongsTo(ThirdParty, { foreignKey: 'thirdPartyId', as: 'thirdParty' });

// BusinessOperation → JournalEntry
JournalEntry.hasOne(BusinessOperation, { foreignKey: 'proposedJournalEntryId', as: 'sourceOperation' });
BusinessOperation.belongsTo(JournalEntry, { foreignKey: 'proposedJournalEntryId', as: 'generatedEntry' });

// OperationTemplate → ChartOfAccount
ChartOfAccount.hasMany(OperationTemplate, { foreignKey: 'debitAccountId', as: 'templatesAsDebit' });
ChartOfAccount.hasMany(OperationTemplate, { foreignKey: 'creditAccountId', as: 'templatesAsCredit' });
OperationTemplate.belongsTo(ChartOfAccount, { foreignKey: 'debitAccountId', as: 'debitAccount' });
OperationTemplate.belongsTo(ChartOfAccount, { foreignKey: 'creditAccountId', as: 'creditAccount' });

// OperationTemplate → User (creator)
User.hasMany(OperationTemplate, { foreignKey: 'createdBy', as: 'templatesCreated' });
OperationTemplate.belongsTo(User, { foreignKey: 'createdBy', as: 'creator' });

// BusinessOperationAudit → BusinessOperation & User
BusinessOperation.hasMany(BusinessOperationAudit, { foreignKey: 'businessOperationId', as: 'audits' });
BusinessOperationAudit.belongsTo(BusinessOperation, { foreignKey: 'businessOperationId', as: 'businessOperation' });
User.hasMany(BusinessOperationAudit, { foreignKey: 'performedBy', as: 'auditActions' });
BusinessOperationAudit.belongsTo(User, { foreignKey: 'performedBy', as: 'performer' });

// FiscalYear → Company & BusinessOperation
Company.hasMany(FiscalYear, { foreignKey: 'company_id', as: 'fiscalYears' });
FiscalYear.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
FiscalYear.hasMany(BusinessOperation, { foreignKey: 'fiscalYearId', as: 'operations' });
BusinessOperation.belongsTo(FiscalYear, { foreignKey: 'fiscalYearId', as: 'fiscalYear' });

// User → JournalEntry (for audit trail)
User.hasMany(JournalEntry, { foreignKey: 'user_id', as: 'journalEntries' });
JournalEntry.belongsTo(User, { foreignKey: 'user_id', as: 'createdBy', constraints: false });

// ==========================================
// ✨ ASSOCIATIONS MODULE OBJECTIFS STRATÉGIQUES (v2.2)
// ==========================================

// StrategicObjective → Compagnie
Compagnie.hasMany(StrategicObjective, { 
  foreignKey: 'compagnie_id', 
  as: 'strategicObjectives' 
});
StrategicObjective.belongsTo(Compagnie, { 
  foreignKey: 'compagnie_id', 
  as: 'compagnie' 
});

// StrategicObjective → User (responsable)
User.hasMany(StrategicObjective, { 
  foreignKey: 'responsable_user_id', 
  as: 'objectivesResponsible' 
});
StrategicObjective.belongsTo(User, { 
  foreignKey: 'responsable_user_id', 
  as: 'responsable' 
});

// StrategicObjective → StrategicObjective (hiérarchie parent-child)
StrategicObjective.hasMany(StrategicObjective, { 
  foreignKey: 'parent_objective_id', 
  as: 'childObjectives' 
});
StrategicObjective.belongsTo(StrategicObjective, { 
  foreignKey: 'parent_objective_id', 
  as: 'parentObjective' 
});

// StrategicObjective → PerformanceIndicator
StrategicObjective.hasMany(PerformanceIndicator, { 
  foreignKey: 'strategic_objective_id', 
  as: 'indicators' 
});
PerformanceIndicator.belongsTo(StrategicObjective, { 
  foreignKey: 'strategic_objective_id', 
  as: 'objective' 
});

// StrategicObjective → ObjectiveAction
StrategicObjective.hasMany(ObjectiveAction, { 
  foreignKey: 'strategic_objective_id', 
  as: 'actions' 
});
ObjectiveAction.belongsTo(StrategicObjective, { 
  foreignKey: 'strategic_objective_id', 
  as: 'objective' 
});

// ObjectiveAction → User (assignee)
User.hasMany(ObjectiveAction, { 
  foreignKey: 'assignee_user_id', 
  as: 'assignedActions' 
});
ObjectiveAction.belongsTo(User, { 
  foreignKey: 'assignee_user_id', 
  as: 'assignee' 
});


// Exports nommés pour une meilleure clarté et cohérence
export { 
  sequelize, 
  User, 
  Compagnie,
  Compagnie as Company, // Alias for backward compatibility
  ChartOfAccount, 
  JournalEntry, 
  JournalEntryLine, 
  AccountBalance,
  ThirdParty,
  BusinessOperation,
  OperationTemplate,
  BusinessOperationAudit,
  FiscalYear,
  // SPOFE v2.1 - Sécurité & Organisation
  Role,
  GroupeEntreprise,
  TwoFactorAuth,
  PasswordResetToken,
  TokenBlacklist,
  SecurityEvent,
  AuditTrail,
  AppSettings,
  // 🆕 SPOFE v2.1 - Consultants Multi-Groupes
  ConsultantGroupAssignment,
  ConsultantCompanyAccess,
  ConsultingFirm,
  FirmConsultants,
  // 🆕 SPOFE v2.2 - Module Objectifs Stratégiques
  StrategicObjective,
  PerformanceIndicator,
  ObjectiveAction,
  ExternalDataSource,
  db 
};

// Export par défaut pour compatibilité
export default db;
