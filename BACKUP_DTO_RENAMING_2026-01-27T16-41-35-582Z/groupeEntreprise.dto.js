/**
 * 📋 GROUPE_ENTREPRISE DTO — SILC v1.0
 */
export const groupeEntrepriseDto = (group) => {
  if (!group) return null;
  return {
    id: group.id,
    groupName: group.group_name,
    description: group.description || null,
    parentGroupId: group.parent_group_id || null,
    headquartersAddress: group.headquarters_address || null,
    email: group.email || null,
    phoneNumber: group.phone_number || null,
    isActive: group.is_active !== false,
    createdAt: group.created_at ? group.created_at.toISOString() : null,
    updatedAt: group.updated_at ? group.updated_at.toISOString() : null
  };
};

export const groupeEntrepriseDtoArray = (groups) => {
  if (!Array.isArray(groups)) return [];
  return groups.map(groupeEntrepriseDto);
};

export const groupeEntrepriseDtoMinimal = (group) => {
  if (!group) return null;
  return {
    id: group.id,
    groupName: group.group_name,
    parentGroupId: group.parent_group_id
  };
};

export default groupeEntrepriseDto;
