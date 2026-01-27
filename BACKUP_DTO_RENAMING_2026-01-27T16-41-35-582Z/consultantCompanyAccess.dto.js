/**
 * 📋 CONSULTANT_COMPANY_ACCESS DTO — SILC v1.0
 */
export const consultantCompanyAccessDto = (access) => {
  if (!access) return null;
  return {
    id: access.id,
    consultantId: access.consultant_id,
    companyId: access.company_id,
    accessLevel: access.access_level || 'READ',
    accessStartDate: access.access_start_date ? access.access_start_date.toISOString() : null,
    accessEndDate: access.access_end_date ? access.access_end_date.toISOString() : null,
    isActive: access.is_active !== false,
    createdAt: access.created_at ? access.created_at.toISOString() : null,
    updatedAt: access.updated_at ? access.updated_at.toISOString() : null
  };
};

export const consultantCompanyAccessDtoArray = (accesses) => {
  if (!Array.isArray(accesses)) return [];
  return accesses.map(consultantCompanyAccessDto);
};

export const consultantCompanyAccessDtoMinimal = (access) => {
  if (!access) return null;
  return {
    id: access.id,
    consultantId: access.consultant_id,
    companyId: access.company_id,
    accessLevel: access.access_level
  };
};

export default consultantCompanyAccessDto;
