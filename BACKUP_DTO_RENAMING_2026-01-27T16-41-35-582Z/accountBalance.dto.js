/**
 * 📋 ACCOUNT BALANCE DTO — SILC v1.0
 * 
 * Contrat Backend → Frontend pour l'entité AccountBalance
 * Transformation: Sequelize instance (snake_case) → API response (camelCase)
 */

/**
 * Transform AccountBalance Sequelize instance to standard API DTO
 * @param {Object} balance - Sequelize AccountBalance instance
 * @returns {Object|null} - AccountBalance DTO or null if falsy
 */
export const accountBalanceDto = (balance) => {
  if (!balance) return null;

  return {
    // Identity
    id: balance.id,
    chartOfAccountId: balance.chartOfAccountId || balance.chart_of_account_id || balance.compte_id || null,

    // Balance
    debitBalance: parseFloat(balance.debitBalance || balance.solde_debit || 0),
    creditBalance: parseFloat(balance.creditBalance || balance.solde_credit || 0),
    netBalance: parseFloat((balance.debitBalance || balance.solde_debit || 0) - (balance.creditBalance || balance.solde_credit || 0)),

    // Period
    period: balance.period || balance.periode || null,
    fiscalYear: balance.fiscalYear || balance.fiscal_year || null,

    // Timestamps (ISO-8601)
    createdAt: balance.created_at ? balance.created_at.toISOString() : null,
    updatedAt: balance.updated_at ? balance.updated_at.toISOString() : null
  };
};

/**
 * Transform array of AccountBalances to DTOs
 */
export const accountBalanceDtoArray = (balances) => {
  return Array.isArray(balances)
    ? balances.map(accountBalanceDto).filter(Boolean)
    : [];
};

/**
 * Minimal AccountBalance DTO
 */
export const accountBalanceDtoMinimal = (balance) => {
  if (!balance) return null;

  return {
    id: balance.id,
    chartOfAccountId: balance.chartOfAccountId || balance.chart_of_account_id,
    debitBalance: parseFloat(balance.debitBalance || balance.solde_debit || 0),
    creditBalance: parseFloat(balance.creditBalance || balance.solde_credit || 0)
  };
};
