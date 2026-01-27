/**
 * 📋 OPERATION_TEMPLATE DTO — SILC v1.0
 */
export const operationTemplateDto = (template) => {
  if (!template) return null;
  return {
    id: template.id,
    templateName: template.template_name,
    templateCode: template.template_code,
    description: template.description || null,
    templateType: template.template_type || null,
    operationCount: template.operation_count || 0,
    lastUsedDate: template.last_used_date ? template.last_used_date.toISOString() : null,
    isActive: template.is_active !== false,
    createdAt: template.created_at ? template.created_at.toISOString() : null,
    updatedAt: template.updated_at ? template.updated_at.toISOString() : null
  };
};

export const operationTemplateDtoArray = (templates) => {
  if (!Array.isArray(templates)) return [];
  return templates.map(operationTemplateDto);
};

export const operationTemplateDtoMinimal = (template) => {
  if (!template) return null;
  return {
    id: template.id,
    templateName: template.template_name,
    templateCode: template.template_code,
    templateType: template.template_type
  };
};

export default operationTemplateDto;
