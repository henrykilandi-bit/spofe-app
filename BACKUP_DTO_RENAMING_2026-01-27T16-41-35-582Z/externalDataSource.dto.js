/**
 * 📋 EXTERNAL_DATA_SOURCE DTO — SILC v1.0
 */
export const externalDataSourceDto = (source) => {
  if (!source) return null;
  return {
    id: source.id,
    sourceName: source.source_name,
    sourceType: source.source_type || null,
    connectionString: source.connection_string ? '***MASKED***' : null,
    isConnected: source.is_connected || false,
    lastSyncDate: source.last_sync_date ? source.last_sync_date.toISOString() : null,
    isActive: source.is_active !== false,
    createdAt: source.created_at ? source.created_at.toISOString() : null,
    updatedAt: source.updated_at ? source.updated_at.toISOString() : null
  };
};

export const externalDataSourceDtoArray = (sources) => {
  if (!Array.isArray(sources)) return [];
  return sources.map(externalDataSourceDto);
};

export const externalDataSourceDtoMinimal = (source) => {
  if (!source) return null;
  return {
    id: source.id,
    sourceName: source.source_name,
    sourceType: source.source_type,
    isConnected: source.is_connected
  };
};

export default externalDataSourceDto;
