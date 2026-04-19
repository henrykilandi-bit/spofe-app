import { PoolConfig } from 'pg';
import fs from 'fs';
import path from 'path';

function firstDefined(...values: Array<string | undefined>): string | undefined {
  return values.find(value => value !== undefined && value !== '');
}

let cachedLocalEnv: Record<string, string> | null = null;

function readLocalEnv(): Record<string, string> {
  if (cachedLocalEnv) {
    return cachedLocalEnv;
  }

  const envPath = path.resolve(process.cwd(), '.env');
  if (!fs.existsSync(envPath)) {
    cachedLocalEnv = {};
    return cachedLocalEnv;
  }

  const entries = fs
    .readFileSync(envPath, 'utf8')
    .split(/\r?\n/)
    .map(line => line.trim())
    .filter(line => line.length > 0 && !line.startsWith('#'))
    .map(line => {
      const separator = line.indexOf('=');
      if (separator === -1) {
        return null;
      }

      return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()] as const;
    })
    .filter((entry): entry is readonly [string, string] => entry !== null);

  cachedLocalEnv = Object.fromEntries(entries);
  return cachedLocalEnv;
}

export function resolveDatabaseNameFromEnv(prefix?: string): string {
  const scoped = prefix ? `${prefix}_` : '';
  const localEnv = readLocalEnv();

  return (
    firstDefined(
      process.env[`${scoped}DATABASE`],
      process.env[`${scoped}DB_DATABASE`],
      process.env[`${scoped}DB_NAME`],
      process.env.DATABASE_NAME,
      process.env.DB_DATABASE,
      process.env.DB_NAME,
      localEnv[`${scoped}DATABASE`],
      localEnv[`${scoped}DB_DATABASE`],
      localEnv[`${scoped}DB_NAME`],
      localEnv.DATABASE_NAME,
      localEnv.DB_DATABASE,
      localEnv.DB_NAME
    ) ?? 'spofe'
  );
}

export function buildDatabaseUrlFromEnv(prefix?: string): string {
  const scoped = prefix ? `${prefix}_` : '';
  const localEnv = readLocalEnv();

  const explicitUrl = firstDefined(
    process.env[`${scoped}DATABASE_URL`],
    process.env.DATABASE_URL,
    localEnv[`${scoped}DATABASE_URL`],
    localEnv.DATABASE_URL
  );

  if (explicitUrl) {
    return explicitUrl;
  }

  const user =
    firstDefined(
      process.env[`${scoped}DB_USER`],
      process.env.DB_USER,
      localEnv[`${scoped}DB_USER`],
      localEnv.DB_USER
    ) ?? 'postgres';
  const password =
    firstDefined(
      process.env[`${scoped}DB_PASSWORD`],
      process.env.DB_PASSWORD,
      localEnv[`${scoped}DB_PASSWORD`],
      localEnv.DB_PASSWORD
    ) ?? '';
  const host =
    firstDefined(
      process.env[`${scoped}DB_HOST`],
      process.env.DB_HOST,
      localEnv[`${scoped}DB_HOST`],
      localEnv.DB_HOST
    ) ?? 'localhost';
  const port =
    firstDefined(
      process.env[`${scoped}DB_PORT`],
      process.env.DB_PORT,
      localEnv[`${scoped}DB_PORT`],
      localEnv.DB_PORT
    ) ?? '5432';
  const database = resolveDatabaseNameFromEnv(prefix);
  const credentials = password ? `${user}:${password}` : user;

  return `postgresql://${credentials}@${host}:${port}/${database}`;
}

export function buildPoolConfigFromEnv(
  overrides?: Partial<PoolConfig>,
  prefix?: string
): PoolConfig {
  const scoped = prefix ? `${prefix}_` : '';
  const database = resolveDatabaseNameFromEnv(prefix);
  const localEnv = readLocalEnv();

  return {
    host:
      firstDefined(
        process.env[`${scoped}DB_HOST`],
        process.env.DB_HOST,
        localEnv[`${scoped}DB_HOST`],
        localEnv.DB_HOST
      ) ?? 'localhost',
    port: parseInt(
      firstDefined(
        process.env[`${scoped}DB_PORT`],
        process.env.DB_PORT,
        localEnv[`${scoped}DB_PORT`],
        localEnv.DB_PORT
      ) ?? '5432',
      10
    ),
    database,
    user:
      firstDefined(
        process.env[`${scoped}DB_USER`],
        process.env.DB_USER,
        localEnv[`${scoped}DB_USER`],
        localEnv.DB_USER
      ) ?? 'postgres',
    password:
      firstDefined(
        process.env[`${scoped}DB_PASSWORD`],
        process.env.DB_PASSWORD,
        localEnv[`${scoped}DB_PASSWORD`],
        localEnv.DB_PASSWORD
      ) ??
      'spofe_secure_pwd_2026',
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
    ssl: process.env.DB_SSL === 'true' ? { rejectUnauthorized: false } : false,
    ...overrides,
  };
}
