import fs from 'node:fs';
import path from 'node:path';
import { parseEnvFile } from '../runtime/env-utils.mjs';
import { appendOpsEventSafe } from './ops-event-log.mjs';

const workspaceRoot = process.cwd();

function parseArgs(argv) {
  const args = {
    envFile: '.env.production',
    reportJson: 'governance/PROD_CONFIG_CHECK_LATEST.json',
    reportMd: 'governance/PROD_CONFIG_CHECK_LATEST.md',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === '--env-file' && argv[i + 1]) {
      args.envFile = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--report-json' && argv[i + 1]) {
      args.reportJson = argv[i + 1];
      i += 1;
      continue;
    }
    if (token === '--report-md' && argv[i + 1]) {
      args.reportMd = argv[i + 1];
      i += 1;
    }
  }

  return args;
}

function maskValue(value) {
  if (value === undefined || value === null || value === '') {
    return '<empty>';
  }
  return `<set:${String(value).length}>`;
}

function isTrue(value) {
  return String(value ?? '').toLowerCase() === 'true';
}

function addFailure(collection, check, details) {
  collection.push({ check, status: 'FAIL', details });
}

function addPass(collection, check, details) {
  collection.push({ check, status: 'PASS', details });
}

function buildMarkdown(result) {
  const lines = [
    '# Production Config Check (latest)',
    '',
    `Generated at: ${result.generatedAt}`,
    `Environment file: ${result.envFile}`,
    `Decision: **${result.decision}**`,
    '',
    '## Controls',
    '',
    '| Control | Status | Details |',
    '| --- | --- | --- |',
  ];

  for (const item of result.controls) {
    lines.push(`| ${item.check} | ${item.status} | ${item.details} |`);
  }

  lines.push('', '## Summary', '');
  lines.push(`- Failures: ${result.failureCount}`);
  lines.push(`- Warnings: ${result.warningCount}`);
  lines.push('');

  if (result.warnings.length > 0) {
    lines.push('## Warnings', '');
    for (const warning of result.warnings) {
      lines.push(`- ${warning}`);
    }
    lines.push('');
  }

  return `${lines.join('\n')}\n`;
}

function run() {
  const startedAt = Date.now();
  const args = parseArgs(process.argv.slice(2));

  const envPath = path.resolve(workspaceRoot, args.envFile);
  const reportJsonPath = path.resolve(workspaceRoot, args.reportJson);
  const reportMdPath = path.resolve(workspaceRoot, args.reportMd);

  const controls = [];
  const warnings = [];

  if (!fs.existsSync(envPath)) {
    const result = {
      generatedAt: new Date().toISOString(),
      envFile: envPath,
      decision: 'NO-GO',
      failureCount: 1,
      warningCount: 0,
      controls: [{ check: 'env-file-exists', status: 'FAIL', details: 'production env file missing' }],
      warnings: [],
    };
    fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
    fs.mkdirSync(path.dirname(reportMdPath), { recursive: true });
    fs.writeFileSync(reportJsonPath, JSON.stringify(result, null, 2), 'utf8');
    fs.writeFileSync(reportMdPath, buildMarkdown(result), 'utf8');
    appendOpsEventSafe({
      metric: 'prod_config_check',
      status: 'error',
      command: 'npm run prod:config:check',
      durationMs: Date.now() - startedAt,
      details: { reason: 'env file missing', envPath },
    });
    process.exit(1);
  }

  const env = parseEnvFile(envPath);

  const requiredKeys = [
    'DATABASE_URL',
    'CORS_ORIGIN',
    'JWT_SECRET',
    'JWT_REFRESH_SECRET',
    'SESSION_SECRET',
    'NODE_ENV',
    'METRICS_ENABLED',
    'TRACING_ENABLED',
  ];

  const missing = requiredKeys.filter(key => !env[key]);
  if (missing.length > 0) {
    addFailure(controls, 'required-keys', `missing: ${missing.join(', ')}`);
  } else {
    addPass(controls, 'required-keys', 'all required keys present');
  }

  const placeholderPattern = /CHANGE_ME|A_REMPLACER|example\.com|localhost/i;
  const sensitiveKeys = ['DATABASE_URL', 'CORS_ORIGIN', 'JWT_SECRET', 'JWT_REFRESH_SECRET', 'SESSION_SECRET', 'DB_PASSWORD'];
  const placeholders = sensitiveKeys.filter(key => placeholderPattern.test(String(env[key] ?? '')));
  if (placeholders.length > 0) {
    addFailure(controls, 'placeholder-values', `placeholder detected in: ${placeholders.join(', ')}`);
  } else {
    addPass(controls, 'placeholder-values', 'no placeholder-like values detected');
  }

  const dbUrl = String(env.DATABASE_URL ?? '');
  if (!/^postgres(ql)?:\/\//i.test(dbUrl)) {
    addFailure(controls, 'database-url-format', 'DATABASE_URL must be postgres:// or postgresql://');
  } else {
    try {
      const parsed = new URL(dbUrl);
      const host = parsed.hostname.toLowerCase();
      if (['localhost', '127.0.0.1', '::1'].includes(host)) {
        addFailure(controls, 'database-host', `host must not be local in prod (${host})`);
      } else {
        addPass(controls, 'database-host', `host=${host}`);
      }
    } catch {
      addFailure(controls, 'database-url-parse', 'DATABASE_URL parse failed');
    }
  }

  const cors = String(env.CORS_ORIGIN ?? '');
  if (!cors || cors === '*' || !cors.startsWith('https://')) {
    addFailure(controls, 'cors-origin', 'CORS_ORIGIN must be explicit https origin (not wildcard)');
  } else if (/localhost|127\.0\.0\.1|example\.com/i.test(cors)) {
    addFailure(controls, 'cors-origin', 'CORS_ORIGIN must not target localhost/example in prod');
  } else {
    addPass(controls, 'cors-origin', 'CORS_ORIGIN format looks production-ready');
  }

  const nodeEnv = String(env.NODE_ENV ?? '').toLowerCase();
  if (nodeEnv !== 'production') {
    addFailure(controls, 'node-env', `NODE_ENV must be production (current=${nodeEnv || 'empty'})`);
  } else {
    addPass(controls, 'node-env', 'NODE_ENV=production');
  }

  if (!isTrue(env.METRICS_ENABLED) || !isTrue(env.TRACING_ENABLED)) {
    addFailure(controls, 'supervision-flags', 'METRICS_ENABLED and TRACING_ENABLED must be true');
  } else {
    addPass(controls, 'supervision-flags', 'metrics/tracing enabled');
  }

  const secretKeys = ['JWT_SECRET', 'JWT_REFRESH_SECRET', 'SESSION_SECRET'];
  const secretMinLength = 24;
  const shortSecrets = secretKeys.filter(key => String(env[key] ?? '').length < secretMinLength);
  if (shortSecrets.length > 0) {
    addFailure(controls, 'secret-length', `min ${secretMinLength} chars required: ${shortSecrets.join(', ')}`);
  } else {
    addPass(controls, 'secret-length', `all core secrets >= ${secretMinLength} chars`);
  }

  const secretValues = secretKeys.map(key => String(env[key] ?? ''));
  const uniqueCount = new Set(secretValues).size;
  if (uniqueCount !== secretValues.length) {
    addFailure(controls, 'secret-uniqueness', 'JWT/refresh/session secrets must be distinct');
  } else {
    addPass(controls, 'secret-uniqueness', 'core secrets are distinct');
  }

  const dbPassword = String(env.DB_PASSWORD ?? '');
  if (dbPassword && dbPassword.length < 12) {
    warnings.push('DB_PASSWORD length is below 12 characters.');
  }

  const failureCount = controls.filter(control => control.status === 'FAIL').length;
  const decision = failureCount === 0 ? 'GO' : 'NO-GO';

  const result = {
    generatedAt: new Date().toISOString(),
    envFile: envPath,
    decision,
    failureCount,
    warningCount: warnings.length,
    controls,
    warnings,
    keySnapshot: {
      DATABASE_URL: maskValue(env.DATABASE_URL),
      CORS_ORIGIN: maskValue(env.CORS_ORIGIN),
      JWT_SECRET: maskValue(env.JWT_SECRET),
      JWT_REFRESH_SECRET: maskValue(env.JWT_REFRESH_SECRET),
      SESSION_SECRET: maskValue(env.SESSION_SECRET),
      DB_PASSWORD: maskValue(env.DB_PASSWORD),
      NODE_ENV: env.NODE_ENV ?? '',
      METRICS_ENABLED: env.METRICS_ENABLED ?? '',
      TRACING_ENABLED: env.TRACING_ENABLED ?? '',
    },
  };

  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.mkdirSync(path.dirname(reportMdPath), { recursive: true });
  fs.writeFileSync(reportJsonPath, JSON.stringify(result, null, 2), 'utf8');
  fs.writeFileSync(reportMdPath, buildMarkdown(result), 'utf8');

  appendOpsEventSafe({
    metric: 'prod_config_check',
    status: decision === 'GO' ? 'ok' : 'error',
    command: 'npm run prod:config:check',
    durationMs: Date.now() - startedAt,
    details: {
      decision,
      failureCount,
      warningCount: warnings.length,
      reportJsonPath,
      reportMdPath,
    },
  });

  console.log(`[SPOFE prod-config] report json: ${reportJsonPath}`);
  console.log(`[SPOFE prod-config] report md: ${reportMdPath}`);
  console.log(`[SPOFE prod-config] decision=${decision} failures=${failureCount} warnings=${warnings.length}`);

  if (decision !== 'GO') {
    process.exit(1);
  }
}

run();
