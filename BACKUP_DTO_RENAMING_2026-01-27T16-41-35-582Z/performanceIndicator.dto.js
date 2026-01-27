/**
 * 📋 PERFORMANCE_INDICATOR DTO — SILC v1.0
 */
export const performanceIndicatorDto = (indicator) => {
  if (!indicator) return null;
  return {
    id: indicator.id,
    indicatorCode: indicator.indicator_code,
    indicatorName: indicator.indicator_name,
    description: indicator.description || null,
    indicatorType: indicator.indicator_type || null,
    targetValue: indicator.target_value || 0,
    currentValue: indicator.current_value || 0,
    unitMeasure: indicator.unit_measure || null,
    frequency: indicator.frequency || 'MONTHLY',
    lastUpdatedDate: indicator.last_updated_date ? indicator.last_updated_date.toISOString() : null,
    isActive: indicator.is_active !== false,
    createdAt: indicator.created_at ? indicator.created_at.toISOString() : null,
    updatedAt: indicator.updated_at ? indicator.updated_at.toISOString() : null
  };
};

export const performanceIndicatorDtoArray = (indicators) => {
  if (!Array.isArray(indicators)) return [];
  return indicators.map(performanceIndicatorDto);
};

export const performanceIndicatorDtoMinimal = (indicator) => {
  if (!indicator) return null;
  return {
    id: indicator.id,
    indicatorCode: indicator.indicator_code,
    currentValue: indicator.current_value,
    targetValue: indicator.target_value
  };
};

export default performanceIndicatorDto;
