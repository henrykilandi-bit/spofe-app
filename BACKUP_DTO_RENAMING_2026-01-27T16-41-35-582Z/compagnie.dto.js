/**
 * 📋 COMPAGNIE DTO — SILC v1.0
 */
export const compagnieDto = (company) => {
  if (!company) return null;
  return {
    id: company.id,
    companyName: company.company_name,
    siret: company.siret || null,
    address: company.address || null,
    city: company.city || null,
    postalCode: company.postal_code || null,
    country: company.country || null,
    phoneNumber: company.phone_number || null,
    email: company.email || null,
    isActive: company.is_active !== false,
    createdAt: company.created_at ? company.created_at.toISOString() : null,
    updatedAt: company.updated_at ? company.updated_at.toISOString() : null
  };
};

export const compagnieDtoArray = (companies) => {
  if (!Array.isArray(companies)) return [];
  return companies.map(compagnieDto);
};

export const compagnieDtoMinimal = (company) => {
  if (!company) return null;
  return {
    id: company.id,
    companyName: company.company_name,
    siret: company.siret
  };
};

export default compagnieDto;
