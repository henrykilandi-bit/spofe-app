/**
 * 📋 CONSULTANT_GROUP_ASSIGNMENT DTO — SILC v1.0
 */
export const consultantGroupAssignmentDto = (assign) => {
  if (!assign) return null;
  return {
    id: assign.id,
    consultantId: assign.consultant_id,
    groupId: assign.group_id,
    role: assign.role || 'MEMBER',
    assignmentDate: assign.assignment_date ? assign.assignment_date.toISOString() : null,
    isActive: assign.is_active !== false,
    createdAt: assign.created_at ? assign.created_at.toISOString() : null,
    updatedAt: assign.updated_at ? assign.updated_at.toISOString() : null
  };
};

export const consultantGroupAssignmentDtoArray = (assigns) => {
  if (!Array.isArray(assigns)) return [];
  return assigns.map(consultantGroupAssignmentDto);
};

export const consultantGroupAssignmentDtoMinimal = (assign) => {
  if (!assign) return null;
  return {
    id: assign.id,
    consultantId: assign.consultant_id,
    groupId: assign.group_id,
    role: assign.role
  };
};

export default consultantGroupAssignmentDto;
