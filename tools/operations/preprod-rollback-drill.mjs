import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { appendOpsEventSafe } from './ops-event-log.mjs';

function parseArgs(argv) {
  const args = {
    stagingEnv: '.env.staging',
    productionEnv: '.env.production',
    mirrorReport: 'governance/PREPROD_MIRROR_REAL_LATEST.json',
    reportJson: 'governance/ROLLBACK_DRILL_LATEST.json',
    reportMd: 'governance/ROLLBACK_DRILL_LATEST.md',
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
    if (token === '--mirror-report' && argv[i + 1]) {
      args.mirrorReport = argv[i + 1];
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

function runCommand(label, command, args) {
  const startedAt = Date.now();
  console.log(`[SPOFE rollback-drill] run: ${label}`);

  const result =
    process.platform === 'win32'
      ? spawnSync('cmd.exe', ['/d', '/c', command, ...args], {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: false,
          env: process.env,
        })
      : spawnSync(command, args, {
          cwd: process.cwd(),
          stdio: 'inherit',
          shell: false,
          env: process.env,
        });

  return {
    label,
    command: `${command} ${args.join(' ')}`.trim(),
    status: result.status ?? 1,
    durationMs: Date.now() - startedAt,
  };
}

function readJsonSafe(filePath) {
  if (!fs.existsSync(filePath)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return null;
  }
}

function buildMarkdown(report) {
  const lines = [
    '# Rollback Drill Report (latest)',
    '',
    `Generated at: ${report.generatedAt}`,
    `Verdict: **${report.verdict}**`,
    '',
    '## Inputs',
    '',
    `- staging env: ${report.inputs.stagingEnv}`,
    `- production env: ${report.inputs.productionEnv}`,
    `- mirror report: ${report.inputs.mirrorReport}`,
    '',
    '## Steps',
    '',
    '| Step | Status | Duration (ms) | Command |',
    '| --- | --- | ---: | --- |',
  ];

  for (const step of report.steps) {
    lines.push(`| ${step.label} | ${step.status === 0 ? 'OK' : 'FAIL'} | ${step.durationMs} | \`${step.command}\` |`);
  }

  lines.push('', '## Mirror parity summary', '');

  if (!report.mirror) {
    lines.push('- mirror report unreadable');
  } else {
    lines.push(`- parity status: ${report.mirror.parityStatus ?? 'n/a'}`);
    lines.push(`- warnings: ${(report.mirror.warnings ?? []).length}`);
    lines.push(`- errors: ${(report.mirror.errors ?? []).length}`);
    lines.push(`- fingerprint: ${report.mirror.fingerprint ?? 'n/a'}`);
  }

  if (report.reasons.length > 0) {
    lines.push('', '## NO-GO reasons', '');
    for (const reason of report.reasons) {
      lines.push(`- ${reason}`);
    }
  }

  lines.push('', '## Criteria', '');
  lines.push('- All technical steps must be successful.');
  lines.push('- Mirror parity must be `ok` with zero warning and zero error.');
  lines.push('- Backup/restore smoke must pass.');
  lines.push('');

  return `${lines.join('\n')}\n`;
}

function main() {
  const args = parseArgs(process.argv.slice(2));
  const startedAt = Date.now();

  const mirrorReportPath = path.resolve(process.cwd(), args.mirrorReport);
  const reportJsonPath = path.resolve(process.cwd(), args.reportJson);
  const reportMdPath = path.resolve(process.cwd(), args.reportMd);

  const steps = [];

  steps.push(
    runCommand('preprod-mirror-check', 'node', [
      'tools/operations/preprod-mirror-check.mjs',
      '--staging-env',
      args.stagingEnv,
      '--production-env',
      args.productionEnv,
      '--report',
      args.mirrorReport,
    ])
  );

  steps.push(runCommand('db-backup-restore-smoke', 'npm', ['run', 'db:backup:smoke']));
  steps.push(runCommand('db-check', 'npm', ['run', 'db:check']));

  const mirror = readJsonSafe(mirrorReportPath);
  const reasons = [];

  const failedSteps = steps.filter(step => step.status !== 0);
  if (failedSteps.length > 0) {
    reasons.push(`failed steps: ${failedSteps.map(step => step.label).join(', ')}`);
  }

  if (!mirror) {
    reasons.push('mirror report unreadable');
  } else {
    if (mirror.parityStatus !== 'ok') {
      reasons.push(`mirror parity status is ${mirror.parityStatus ?? 'n/a'}`);
    }
    if ((mirror.errors ?? []).length > 0) {
      reasons.push(`mirror parity has ${mirror.errors.length} error(s)`);
    }
    if ((mirror.warnings ?? []).length > 0) {
      reasons.push(`mirror parity has ${mirror.warnings.length} warning(s)`);
    }
  }

  const verdict = reasons.length === 0 ? 'GO' : 'NO-GO';
  const report = {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    verdict,
    inputs: {
      stagingEnv: path.resolve(process.cwd(), args.stagingEnv),
      productionEnv: path.resolve(process.cwd(), args.productionEnv),
      mirrorReport: mirrorReportPath,
    },
    steps,
    mirror,
    reasons,
  };

  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.mkdirSync(path.dirname(reportMdPath), { recursive: true });
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(reportMdPath, buildMarkdown(report), 'utf8');

  appendOpsEventSafe({
    metric: 'rollback_drill',
    status: verdict === 'GO' ? 'ok' : 'error',
    command: 'npm run preprod:rollback:drill',
    durationMs: report.durationMs,
    details: {
      verdict,
      reasons,
      reportJsonPath,
      reportMdPath,
    },
  });

  console.log(`[SPOFE rollback-drill] report json: ${reportJsonPath}`);
  console.log(`[SPOFE rollback-drill] report md: ${reportMdPath}`);
  console.log(`[SPOFE rollback-drill] verdict: ${verdict}`);

  if (verdict !== 'GO') {
    process.exit(1);
  }
}

main();
