/**
 * 📋 THIRD_PARTY DTO — SILC v1.0
 */
export const thirdPartyDto = (party) => {
  if (!party) return null;
  return {
    id: party.id,
    partyCode: party.party_code,
    partyName: party.party_name,
    partyType: party.party_type || 'SUPPLIER',
    address: party.address || null,
    city: party.city || null,
    postalCode: party.postal_code || null,
    country: party.country || null,
    email: party.email || null,
    phoneNumber: party.phone_number || null,
    taxId: party.tax_id || null,
    siret: party.siret || null,
    isActive: party.is_active !== false,
    createdAt: party.created_at ? party.created_at.toISOString() : null,
    updatedAt: party.updated_at ? party.updated_at.toISOString() : null
  };
};

export const thirdPartyDtoArray = (parties) => {
  if (!Array.isArray(parties)) return [];
  return parties.map(thirdPartyDto);
};

export const thirdPartyDtoMinimal = (party) => {
  if (!party) return null;
  return {
    id: party.id,
    partyCode: party.party_code,
    partyName: party.party_name,
    partyType: party.party_type
  };
};

export default thirdPartyDto;
