/**
 * 📋 STRATEGIC_OBJECTIVE DTO — SILC v1.0
 */
export const strategicObjectiveDto = (objective) => {
  if (!objective) return null;
  return {
    id: objective.id,
    objectiveCode: objective.objective_code,
    objectiveName: objective.objective_name,
    description: objective.description || null,
    objectiveType: objective.objective_type || null,
    priority: objective.priority || 'MEDIUM',
    status: objective.status || 'PLANNED',
    startDate: objective.start_date ? objective.start_date.toISOString() : null,
    endDate: objective.end_date ? objective.end_date.toISOString() : null,
    owner: objective.owner || null,
    progressPercentage: objective.progress_percentage || 0,
    isActive: objective.is_active !== false,
    createdAt: objective.created_at ? objective.created_at.toISOString() : null,
    updatedAt: objective.updated_at ? objective.updated_at.toISOString() : null
  };
};

export const strategicObjectiveDtoArray = (objectives) => {
  if (!Array.isArray(objectives)) return [];
  return objectives.map(strategicObjectiveDto);
};

export const strategicObjectiveDtoMinimal = (objective) => {
  if (!objective) return null;
  return {
    id: objective.id,
    objectiveCode: objective.objective_code,
    objectiveName: objective.objective_name,
    status: objective.status,
    priority: objective.priority,
    progressPercentage: objective.progress_percentage
  };
};

export default strategicObjectiveDto;
