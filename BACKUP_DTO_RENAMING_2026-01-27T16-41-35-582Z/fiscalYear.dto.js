/**
 * 📋 FISCAL_YEAR DTO — SILC v1.0
 */
export const fiscalYearDto = (fiscal) => {
  if (!fiscal) return null;
  return {
    id: fiscal.id,
    fiscalYearCode: fiscal.fiscal_year_code,
    startDate: fiscal.start_date ? fiscal.start_date.toISOString() : null,
    endDate: fiscal.end_date ? fiscal.end_date.toISOString() : null,
    isClosed: fiscal.is_closed || false,
    closureDate: fiscal.closure_date ? fiscal.closure_date.toISOString() : null,
    description: fiscal.description || null,
    isActive: fiscal.is_active !== false,
    createdAt: fiscal.created_at ? fiscal.created_at.toISOString() : null,
    updatedAt: fiscal.updated_at ? fiscal.updated_at.toISOString() : null
  };
};

export const fiscalYearDtoArray = (fiscals) => {
  if (!Array.isArray(fiscals)) return [];
  return fiscals.map(fiscalYearDto);
};

export const fiscalYearDtoMinimal = (fiscal) => {
  if (!fiscal) return null;
  return {
    id: fiscal.id,
    fiscalYearCode: fiscal.fiscal_year_code,
    startDate: fiscal.start_date ? fiscal.start_date.toISOString() : null,
    endDate: fiscal.end_date ? fiscal.end_date.toISOString() : null
  };
};

export default fiscalYearDto;
