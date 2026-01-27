/**
 * 📋 FIRM_CONSULTANTS DTO — SILC v1.0
 */
export const firmConsultantsDto = (firmConsult) => {
  if (!firmConsult) return null;
  return {
    id: firmConsult.id,
    firmId: firmConsult.firm_id,
    consultantId: firmConsult.consultant_id,
    consultantName: firmConsult.consultant_name || null,
    role: firmConsult.role || 'CONSULTANT',
    startDate: firmConsult.start_date ? firmConsult.start_date.toISOString() : null,
    endDate: firmConsult.end_date ? firmConsult.end_date.toISOString() : null,
    isActive: firmConsult.is_active !== false,
    createdAt: firmConsult.created_at ? firmConsult.created_at.toISOString() : null,
    updatedAt: firmConsult.updated_at ? firmConsult.updated_at.toISOString() : null
  };
};

export const firmConsultantsDtoArray = (firmConsults) => {
  if (!Array.isArray(firmConsults)) return [];
  return firmConsults.map(firmConsultantsDto);
};

export const firmConsultantsDtoMinimal = (firmConsult) => {
  if (!firmConsult) return null;
  return {
    id: firmConsult.id,
    firmId: firmConsult.firm_id,
    consultantId: firmConsult.consultant_id,
    role: firmConsult.role
  };
};

export default firmConsultantsDto;
