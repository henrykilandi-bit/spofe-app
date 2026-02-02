// ==================================================================================
// SPOFE — PgPool.ts
// Initialisation du pool PostgreSQL
// ==================================================================================
// Configuration minimale, prévisible, sans auto-commit ni retry magique
// ==================================================================================

import { Pool, PoolConfig } from 'pg';

/**
 * Configuration PostgreSQL pour SPOFE
 * 
 * Paramètres explicites (pas de defaults "magiques")
 */
export function createPgPool(overrides?: Partial<PoolConfig>): Pool {
  const config: PoolConfig = {
    // Connexion
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    database: process.env.DB_NAME || 'spofe',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'spofe_secure_pwd_2026',

    // Pool configuration
    max: 10,                        // Max connections
    idleTimeoutMillis: 30_000,      // 30s inactivity
    connectionTimeoutMillis: 5_000, // 5s to connect
    
    // Transactions
    // ⚠️ NO autocommit handling — explicit transaction control only
    // ⚠️ NO statement timeout — relies on application logic
    
    // SSL
    ssl: process.env.DB_SSL === 'true'
      ? { rejectUnauthorized: false }
      : false,

    ...overrides,
  };

  return new Pool(config);
}

/**
 * Instance de pool par défaut
 * 
 * Utilisation:
 *   import { pgPool } from '@spofe/db-postgres';
 *   const client = new PostgresDbClient(pgPool);
 */
export const pgPool = createPgPool();

/**
 * Fermer le pool (ex: lors du shutdown de l'application)
 */
export async function closePgPool(): Promise<void> {
  await pgPool.end();
}
