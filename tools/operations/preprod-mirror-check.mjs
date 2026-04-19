import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { parseEnvFile } from '../runtime/env-utils.mjs';

const REQUIRED_KEYS = [
  'DB_HOST',
  'DB_PORT',
  'DB_NAME',
  'DB_USER',
  'DB_PASSWORD',
  'DB_SSL',
  'PORT',
  'NODE_ENV',
  'LOG_LEVEL',
  'GUARDIAN_VERSION',
  'GUARDIAN_MODE',
  'REQUEST_TIMEOUT',
  'METRICS_ENABLED',
  'TRACING_ENABLED',
  'FEATURE_AUDIT_LOGGING',
  'FEATURE_COMPRESSION',
  'FEATURE_CACHING',
];

const BEHAVIOR_PARITY_KEYS = [
  'GUARDIAN_VERSION',
  'GUARDIAN_MODE',
  'REQUEST_TIMEOUT',
  'METRICS_ENABLED',
  'TRACING_ENABLED',
  'FEATURE_AUDIT_LOGGING',
  'FEATURE_COMPRESSION',
  'FEATURE_CACHING',
];

const FORBIDDEN_LEGACY_PREFIXES = ['MYSQL_', 'REDIS_'];

function sha256(input) {
  return crypto.createHash('sha256').update(input).digest('hex');
}

function parseArgs(argv) {
  const args = {
    stagingEnv: '.env.staging.example',
    productionEnv: '.env.production.example',
    reportFile: '',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--staging-env' && argv[i + 1]) {
      args.stagingEnv = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--production-env' && argv[i + 1]) {
      args.productionEnv = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--report' && argv[i + 1]) {
      args.reportFile = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function resolveEnvFile(filePath) {
  const absolutePath = path.resolve(process.cwd(), filePath);
  if (!fs.existsSync(absolutePath)) {
    throw new Error(`Environment file not found: ${absolutePath}`);
  }
  return {
    absolutePath,
    env: parseEnvFile(absolutePath),
  };
}

function detectDbMode(env) {
  const dbUrl = env.DATABASE_URL ?? '';
  if (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://')) {
    return 'postgres-url';
  }

  const hasTuple =
    Boolean(env.DB_HOST) &&
    Boolean(env.DB_PORT) &&
    Boolean(env.DB_NAME ?? env.DB_DATABASE ?? env.DATABASE_NAME) &&
    Boolean(env.DB_USER);

  if (hasTuple) {
    return 'postgres-tuple';
  }

  return 'invalid';
}

function computeMigrationsFingerprint() {
  const migrationDir = path.resolve(process.cwd(), 'governance/migration_exploitation');
  if (!fs.existsSync(migrationDir)) {
    return {
      migrationDir,
      fingerprint: 'absent',
      fileCount: 0,
    };
  }

  const files = fs
    .readdirSync(migrationDir)
    .filter(file => file.toLowerCase().endsWith('.sql'))
    .sort((a, b) => a.localeCompare(b));

  const chunks = files.map(file => {
    const content = fs.readFileSync(path.join(migrationDir, file), 'utf8');
    return `${file}:${sha256(content)}`;
  });

  return {
    migrationDir,
    fingerprint: sha256(chunks.join('|')),
    fileCount: files.length,
  };
}

function evaluateParity(stagingEnv, productionEnv) {
  const errors = [];
  const warnings = [];

  for (const key of REQUIRED_KEYS) {
    if (!stagingEnv[key]) {
      errors.push(`Missing required key in staging env: ${key}`);
    }
    if (!productionEnv[key]) {
      errors.push(`Missing required key in production env: ${key}`);
    }
  }

  for (const key of BEHAVIOR_PARITY_KEYS) {
    if ((stagingEnv[key] ?? '') !== (productionEnv[key] ?? '')) {
      errors.push(
        `Behavior mismatch on ${key}: staging="${stagingEnv[key] ?? ''}" production="${productionEnv[key] ?? ''}"`
      );
    }
  }

  const stagingDbMode = detectDbMode(stagingEnv);
  const productionDbMode = detectDbMode(productionEnv);
  if (stagingDbMode === 'invalid') {
    errors.push('Staging DB config is invalid (expected PostgreSQL URL or tuple).');
  }
  if (productionDbMode === 'invalid') {
    errors.push('Production DB config is invalid (expected PostgreSQL URL or tuple).');
  }
  if (stagingDbMode !== productionDbMode) {
    errors.push(`DB mode mismatch: staging=${stagingDbMode} production=${productionDbMode}`);
  }

  const stagingPort = Number.parseInt(stagingEnv.DB_PORT ?? '', 10);
  const productionPort = Number.parseInt(productionEnv.DB_PORT ?? '', 10);
  if (!Number.isInteger(stagingPort) || stagingPort < 1 || stagingPort > 65535) {
    errors.push(`Invalid staging DB_PORT: ${stagingEnv.DB_PORT ?? ''}`);
  }
  if (!Number.isInteger(productionPort) || productionPort < 1 || productionPort > 65535) {
    errors.push(`Invalid production DB_PORT: ${productionEnv.DB_PORT ?? ''}`);
  }

  for (const prefix of FORBIDDEN_LEGACY_PREFIXES) {
    const stagingLegacy = Object.keys(stagingEnv).filter(key => key.startsWith(prefix));
    const productionLegacy = Object.keys(productionEnv).filter(key => key.startsWith(prefix));

    if (stagingLegacy.length > 0 || productionLegacy.length > 0) {
      errors.push(
        `Forbidden legacy ${prefix} keys detected (staging=${stagingLegacy.length}, production=${productionLegacy.length}).`
      );
    }
  }

  const placeholderPattern = /CHANGE_ME|your-secure-password-here|example\.com|localhost/i;
  for (const [scope, env] of [
    ['staging', stagingEnv],
    ['production', productionEnv],
  ]) {
    const placeholderKeys = Object.entries(env)
      .filter(([, value]) => placeholderPattern.test(String(value ?? '')))
      .map(([key]) => key);
    if (placeholderKeys.length > 0) {
      warnings.push(`${scope}: placeholder values detected for keys: ${placeholderKeys.join(', ')}`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    stagingDbMode,
    productionDbMode,
  };
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const staging = resolveEnvFile(args.stagingEnv);
  const production = resolveEnvFile(args.productionEnv);
  const parity = evaluateParity(staging.env, production.env);
  const migrations = computeMigrationsFingerprint();

  const fingerprintPayload = {
    generatedAt: new Date().toISOString(),
    stagingEnv: staging.absolutePath,
    productionEnv: production.absolutePath,
    stagingDbMode: parity.stagingDbMode,
    productionDbMode: parity.productionDbMode,
    behaviorParityKeys: BEHAVIOR_PARITY_KEYS.reduce((acc, key) => {
      acc[key] = {
        staging: staging.env[key] ?? '',
        production: production.env[key] ?? '',
      };
      return acc;
    }, {}),
    migrations,
    parityStatus: parity.ok ? 'ok' : 'error',
    errors: parity.errors,
    warnings: parity.warnings,
  };

  const fingerprint = sha256(JSON.stringify(fingerprintPayload));
  fingerprintPayload.fingerprint = fingerprint;

  console.log('[SPOFE preprod-mirror] summary');
  console.log(`- staging env: ${staging.absolutePath}`);
  console.log(`- production env: ${production.absolutePath}`);
  console.log(`- staging db mode: ${parity.stagingDbMode}`);
  console.log(`- production db mode: ${parity.productionDbMode}`);
  console.log(`- migration files: ${migrations.fileCount}`);
  console.log(`- fingerprint: ${fingerprint}`);

  if (parity.warnings.length > 0) {
    console.log('[SPOFE preprod-mirror] warnings');
    for (const warning of parity.warnings) {
      console.log(`  - ${warning}`);
    }
  }

  if (args.reportFile) {
    const reportPath = path.resolve(process.cwd(), args.reportFile);
    fs.writeFileSync(reportPath, JSON.stringify(fingerprintPayload, null, 2), 'utf8');
    console.log(`[SPOFE preprod-mirror] report written: ${reportPath}`);
  }

  if (!parity.ok) {
    console.error('[SPOFE preprod-mirror] FAILED');
    for (const error of parity.errors) {
      console.error(`  - ${error}`);
    }
    process.exit(1);
  }

  console.log('[SPOFE preprod-mirror] PASSED');
}

main();
