/**
 * 📋 CONSULTING_FIRM DTO — SILC v1.0
 */
export const consultingFirmDto = (firm) => {
  if (!firm) return null;
  return {
    id: firm.id,
    firmName: firm.firm_name,
    siret: firm.siret || null,
    address: firm.address || null,
    city: firm.city || null,
    postalCode: firm.postal_code || null,
    country: firm.country || null,
    phoneNumber: firm.phone_number || null,
    email: firm.email || null,
    website: firm.website || null,
    isActive: firm.is_active !== false,
    createdAt: firm.created_at ? firm.created_at.toISOString() : null,
    updatedAt: firm.updated_at ? firm.updated_at.toISOString() : null
  };
};

export const consultingFirmDtoArray = (firms) => {
  if (!Array.isArray(firms)) return [];
  return firms.map(consultingFirmDto);
};

export const consultingFirmDtoMinimal = (firm) => {
  if (!firm) return null;
  return {
    id: firm.id,
    firmName: firm.firm_name,
    siret: firm.siret
  };
};

export default consultingFirmDto;
