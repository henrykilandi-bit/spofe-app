/**
 * 📋 JOURNAL ENTRY LINE DTO — SILC v1.0
 * 
 * Contrat Backend → Frontend pour l'entité JournalEntryLine
 * Transformation: Sequelize instance (snake_case) → API response (camelCase)
 */

/**
 * Transform JournalEntryLine Sequelize instance to standard API DTO
 * @param {Object} line - Sequelize JournalEntryLine instance
 * @returns {Object|null} - JournalEntryLine DTO or null if falsy
 */
export const journalEntryLineDto = (line) => {
  if (!line) return null;

  return {
    // Identity
    id: line.id,
    journalEntryId: line.journalEntryId || line.journal_entry_id || null,
    chartOfAccountId: line.chartOfAccountId || line.chart_of_account_id || line.compte_id || null,

    // Amount
    debitAmount: parseFloat(line.debitAmount || line.montant_debit || 0),
    creditAmount: parseFloat(line.creditAmount || line.montant_credit || 0),

    // Details
    description: line.description || null,
    reference: line.reference || null,

    // Timestamps (ISO-8601)
    createdAt: line.created_at ? line.created_at.toISOString() : null,
    updatedAt: line.updated_at ? line.updated_at.toISOString() : null
  };
};

/**
 * Transform array of JournalEntryLines to DTOs
 */
export const journalEntryLineDtoArray = (lines) => {
  return Array.isArray(lines)
    ? lines.map(journalEntryLineDto).filter(Boolean)
    : [];
};

/**
 * Minimal JournalEntryLine DTO
 */
export const journalEntryLineDtoMinimal = (line) => {
  if (!line) return null;

  return {
    id: line.id,
    chartOfAccountId: line.chartOfAccountId || line.chart_of_account_id,
    debitAmount: parseFloat(line.debitAmount || line.montant_debit || 0),
    creditAmount: parseFloat(line.creditAmount || line.montant_credit || 0)
  };
};
