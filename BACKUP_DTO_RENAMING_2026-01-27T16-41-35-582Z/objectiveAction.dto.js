/**
 * 📋 OBJECTIVE_ACTION DTO — SILC v1.0
 */
export const objectiveActionDto = (action) => {
  if (!action) return null;
  return {
    id: action.id,
    objectiveId: action.objective_id,
    actionCode: action.action_code,
    actionName: action.action_name,
    description: action.description || null,
    actionType: action.action_type || null,
    status: action.status || 'PENDING',
    targetDate: action.target_date ? action.target_date.toISOString() : null,
    completionDate: action.completion_date ? action.completion_date.toISOString() : null,
    priority: action.priority || 'MEDIUM',
    isActive: action.is_active !== false,
    createdAt: action.created_at ? action.created_at.toISOString() : null,
    updatedAt: action.updated_at ? action.updated_at.toISOString() : null
  };
};

export const objectiveActionDtoArray = (actions) => {
  if (!Array.isArray(actions)) return [];
  return actions.map(objectiveActionDto);
};

export const objectiveActionDtoMinimal = (action) => {
  if (!action) return null;
  return {
    id: action.id,
    objectiveId: action.objective_id,
    actionCode: action.action_code,
    status: action.status,
    priority: action.priority
  };
};

export default objectiveActionDto;
