/**
 * 📋 BUSINESS_OPERATION_AUDIT DTO — SILC v1.0
 */
export const businessOperationAuditDto = (audit) => {
  if (!audit) return null;
  return {
    id: audit.id,
    operationId: audit.operation_id,
    userId: audit.user_id,
    actionType: audit.action_type || null,
    changedFields: audit.changed_fields || {},
    previousValues: audit.previous_values || {},
    newValues: audit.new_values || {},
    auditDate: audit.audit_date ? audit.audit_date.toISOString() : null,
    createdAt: audit.created_at ? audit.created_at.toISOString() : null
  };
};

export const businessOperationAuditDtoArray = (audits) => {
  if (!Array.isArray(audits)) return [];
  return audits.map(businessOperationAuditDto);
};

export const businessOperationAuditDtoMinimal = (audit) => {
  if (!audit) return null;
  return {
    id: audit.id,
    operationId: audit.operation_id,
    actionType: audit.action_type,
    auditDate: audit.audit_date ? audit.audit_date.toISOString() : null
  };
};

export default businessOperationAuditDto;
