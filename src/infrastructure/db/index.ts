// ==================================================================================
// SPOFE Database Infrastructure — Index
// ==================================================================================
// Exporte les classes et fonctions publiques du module db
// ==================================================================================

// Pool management
export { pgPool, createPgPool, closePgPool } from './PgPool';

// DbClient implementation
export { PostgresDbClient, createPostgresDbClient } from './PostgresDbClient';
