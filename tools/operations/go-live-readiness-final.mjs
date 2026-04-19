import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { appendOpsEventSafe } from './ops-event-log.mjs';

function runCommand(label, command, args) {
  const startedAt = Date.now();
  console.log(`[SPOFE go-live] run: ${label}`);

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
    '# Go-Live Readiness Final (latest)',
    '',
    `Generated at: ${report.generatedAt}`,
    `Verdict: **${report.verdict}**`,
    '',
    '## Commands',
    '',
    '| Step | Status | Duration (ms) | Command |',
    '| --- | --- | ---: | --- |',
  ];

  for (const command of report.commands) {
    lines.push(
      `| ${command.label} | ${command.status === 0 ? 'OK' : 'FAIL'} | ${command.durationMs} | \`${command.command}\` |`
    );
  }

  lines.push('', '## Evidence', '', '| Evidence | Status | Details |', '| --- | --- | --- |');
  for (const evidence of report.evidenceChecks) {
    lines.push(`| ${evidence.name} | ${evidence.ok ? 'OK' : 'FAIL'} | ${evidence.details} |`);
  }

  if (report.reasons.length > 0) {
    lines.push('', '## NO-GO reasons', '');
    for (const reason of report.reasons) {
      lines.push(`- ${reason}`);
    }
  }

  lines.push('');
  return `${lines.join('\n')}\n`;
}

function main() {
  const startedAt = Date.now();
  const commands = [];
  const evidenceChecks = [];
  const reasons = [];

  commands.push(runCommand('release-gate', 'npm', ['run', 'release:gate']));
  commands.push(runCommand('post-release-smoke', 'npm', ['run', 'post-release:smoke']));
  commands.push(runCommand('pilot-supervision', 'npm', ['run', 'pilot:supervision']));
  commands.push(runCommand('server-stop-cleanup', 'npm', ['run', 'server:stop']));

  const failedCommands = commands.filter(command => command.status !== 0 && command.label !== 'server-stop-cleanup');
  if (failedCommands.length > 0) {
    reasons.push(`failed command(s): ${failedCommands.map(command => command.label).join(', ')}`);
  }

  const mirror = readJsonSafe(path.resolve(process.cwd(), 'governance', 'PREPROD_MIRROR_REAL_LATEST.json'));
  const prodConfig = readJsonSafe(path.resolve(process.cwd(), 'governance', 'PROD_CONFIG_CHECK_LATEST.json'));
  const smoke = readJsonSafe(path.resolve(process.cwd(), 'governance', 'POST_RELEASE_SMOKE_LATEST.json'));
  const pilot = readJsonSafe(path.resolve(process.cwd(), 'governance', 'PILOT_SUPERVISION_LATEST.json'));

  const mirrorOk = !!mirror && mirror.parityStatus === 'ok' && (mirror.errors ?? []).length === 0;
  evidenceChecks.push({
    name: 'preprod_mirror_real',
    ok: mirrorOk,
    details: mirror ? `parityStatus=${mirror.parityStatus ?? 'n/a'}` : 'missing/unreadable',
  });
  if (!mirrorOk) {
    reasons.push('preprod mirror parity not OK');
  }

  const prodConfigOk = !!prodConfig && prodConfig.decision === 'GO';
  evidenceChecks.push({
    name: 'prod_config_check',
    ok: prodConfigOk,
    details: prodConfig ? `decision=${prodConfig.decision ?? 'n/a'}` : 'missing/unreadable',
  });
  if (!prodConfigOk) {
    reasons.push('production config check is not GO');
  }

  const smokeOk = !!smoke && smoke.verdict === 'GO';
  evidenceChecks.push({
    name: 'post_release_smoke',
    ok: smokeOk,
    details: smoke ? `verdict=${smoke.verdict ?? 'n/a'}` : 'missing/unreadable',
  });
  if (!smokeOk) {
    reasons.push('post-release smoke is not GO');
  }

  const pilotOk = !!pilot && pilot.verdict === 'GO';
  evidenceChecks.push({
    name: 'pilot_supervision',
    ok: pilotOk,
    details: pilot ? `verdict=${pilot.verdict ?? 'n/a'}` : 'missing/unreadable',
  });
  if (!pilotOk) {
    reasons.push('pilot supervision is not GO');
  }

  const report = {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    verdict: reasons.length === 0 ? 'GO' : 'NO-GO',
    commands,
    evidenceChecks,
    reasons,
  };

  const reportJsonPath = path.resolve(process.cwd(), 'governance', 'GO_LIVE_READINESS_LATEST.json');
  const reportMdPath = path.resolve(process.cwd(), 'governance', 'GO_LIVE_READINESS_LATEST.md');
  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(reportMdPath, buildMarkdown(report), 'utf8');

  appendOpsEventSafe({
    metric: 'go_live_readiness',
    status: report.verdict === 'GO' ? 'ok' : 'error',
    command: 'npm run go-live:readiness',
    durationMs: report.durationMs,
    details: {
      verdict: report.verdict,
      reportJsonPath,
      reportMdPath,
      reasons,
    },
  });

  console.log(`[SPOFE go-live] report json: ${reportJsonPath}`);
  console.log(`[SPOFE go-live] report md: ${reportMdPath}`);
  console.log(`[SPOFE go-live] verdict: ${report.verdict}`);

  if (report.verdict !== 'GO') {
    process.exit(1);
  }
}

main();
