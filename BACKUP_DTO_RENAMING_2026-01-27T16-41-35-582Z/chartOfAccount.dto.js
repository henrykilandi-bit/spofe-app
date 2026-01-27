/**
 * 📋 CHART OF ACCOUNT DTO — SILC v1.0
 * 
 * Contrat Backend → Frontend pour l'entité ChartOfAccount
 * Transformation: Sequelize instance (snake_case) → API response (camelCase)
 */

/**
 * Transform ChartOfAccount Sequelize instance to standard API DTO
 * @param {Object} account - Sequelize ChartOfAccount instance
 * @returns {Object|null} - ChartOfAccount DTO or null if falsy
 */
export const chartOfAccountDto = (account) => {
  if (!account) return null;

  return {
    // Identity
    id: account.id,
    companyId: account.company_id || null,

    // Account Info
    accountNumber: account.accountNumber || account.numero_compte || null,
    accountName: account.accountName || account.libelle || null,
    description: account.description || null,

    // Classification
    accountType: account.accountType || account.type_compte || 'OTHER',
    subAccountType: account.subAccountType || account.sous_type_compte || null,

    // Hierarchy
    parentAccountId: account.parentAccountId || account.parent_account_id || null,

    // Flags
    isActive: account.is_active !== false,
    isTaxable: account.isTaxable || account.est_imposable || false,
    allowSubAccounts: account.allowSubAccounts !== false,

    // Timestamps (ISO-8601)
    createdAt: account.created_at ? account.created_at.toISOString() : null,
    updatedAt: account.updated_at ? account.updated_at.toISOString() : null
  };
};

/**
 * Transform array of ChartOfAccounts to DTOs
 */
export const chartOfAccountDtoArray = (accounts) => {
  return Array.isArray(accounts)
    ? accounts.map(chartOfAccountDto).filter(Boolean)
    : [];
};

/**
 * Minimal ChartOfAccount DTO (for dropdowns)
 */
export const chartOfAccountDtoMinimal = (account) => {
  if (!account) return null;

  return {
    id: account.id,
    accountNumber: account.accountNumber || account.numero_compte,
    accountName: account.accountName || account.libelle,
    accountType: account.accountType || account.type_compte
  };
};
