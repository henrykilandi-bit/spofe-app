/**
 * 📋 JOURNAL ENTRY DTO — SILC v1.0
 * 
 * Contrat Backend → Frontend pour l'entité JournalEntry
 * Transformation: Sequelize instance (snake_case) → API response (camelCase)
 * 
 * Spécification: SILC v1.0 - Mapping pur, pas de logique métier
 * Conforme: SPOFE v2.2 + conventions camelCase
 */

/**
 * Transform JournalEntry Sequelize instance to standard API DTO
 * @param {Object} entry - Sequelize JournalEntry instance
 * @returns {Object|null} - JournalEntry DTO or null if falsy
 */
export const journalEntryDto = (entry) => {
  if (!entry) return null;

  return {
    // Identity
    id: entry.id,
    companyId: entry.company_id || null,

    // Entry Info
    journalCode: entry.journal_code || null,
    entryNumber: entry.entry_number || null,
    description: entry.description || null,

    // Dates & Status
    entryDate: entry.entry_date ? new Date(entry.entry_date).toISOString().split('T')[0] : null,
    status: entry.status || 'POSTED',

    // Amounts
    totalDebit: parseFloat(entry.total_debit || 0),
    totalCredit: parseFloat(entry.total_credit || 0),

    // Timestamps (ISO-8601)
    createdAt: entry.created_at ? entry.created_at.toISOString() : null,
    updatedAt: entry.updated_at ? entry.updated_at.toISOString() : null
  };
};

/**
 * Transform array of JournalEntries to DTOs
 * @param {Array} entries - Array of Sequelize JournalEntry instances
 * @returns {Array} - Array of JournalEntry DTOs
 */
export const journalEntryDtoArray = (entries) => {
  return Array.isArray(entries)
    ? entries.map(journalEntryDto).filter(Boolean)
    : [];
};

/**
 * Minimal JournalEntry DTO (for lists)
 */
export const journalEntryDtoMinimal = (entry) => {
  if (!entry) return null;

  return {
    id: entry.id,
    entryNumber: entry.entry_number,
    entryDate: entry.entry_date ? new Date(entry.entry_date).toISOString().split('T')[0] : null,
    status: entry.status || 'POSTED',
    totalDebit: parseFloat(entry.total_debit || 0),
    totalCredit: parseFloat(entry.total_credit || 0)
  };
};
