/**
 * 📋 BUSINESS_OPERATION DTO — SILC v1.0
 */
export const businessOperationDto = (op) => {
  if (!op) return null;
  return {
    id: op.id,
    operationCode: op.operation_code,
    description: op.description || null,
    operationType: op.operation_type || null,
    amount: op.amount || 0,
    operationDate: op.operation_date ? op.operation_date.toISOString() : null,
    isActive: op.is_active !== false,
    createdAt: op.created_at ? op.created_at.toISOString() : null,
    updatedAt: op.updated_at ? op.updated_at.toISOString() : null
  };
};

export const businessOperationDtoArray = (ops) => {
  if (!Array.isArray(ops)) return [];
  return ops.map(businessOperationDto);
};

export const businessOperationDtoMinimal = (op) => {
  if (!op) return null;
  return {
    id: op.id,
    operationCode: op.operation_code,
    description: op.description
  };
};

export default businessOperationDto;
