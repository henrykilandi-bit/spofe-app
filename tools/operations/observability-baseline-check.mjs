import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const workspaceRoot = process.cwd();
const kpiJsonPath = path.resolve(workspaceRoot, '.spofe', 'kpi-exploitation-latest.json');
const reportPath = path.resolve(workspaceRoot, 'governance', 'OBSERVABILITY_BASELINE_REPORT.md');

function runNpmScript(name) {
  const label = `npm run ${name}`;
  console.log(`[SPOFE observability] run: ${label}`);
  const result =
    process.platform === 'win32'
      ? spawnSync('cmd.exe', ['/d', '/c', 'npm', 'run', name], {
          cwd: workspaceRoot,
          stdio: 'inherit',
          shell: false,
          env: process.env,
        })
      : spawnSync('npm', ['run', name], {
          cwd: workspaceRoot,
          stdio: 'inherit',
          shell: false,
          env: process.env,
        });

  const status = result.status ?? 1;
  if (status !== 0) {
    throw new Error(`${label} failed (status=${status})`);
  }
}

function readKpiJson() {
  if (!fs.existsSync(kpiJsonPath)) {
    throw new Error(`KPI json not found: ${kpiJsonPath}`);
  }
  return JSON.parse(fs.readFileSync(kpiJsonPath, 'utf8'));
}

function formatPercent(value) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  return `${Number(value).toFixed(2)}%`;
}

function formatHours(value) {
  if (value === null || value === undefined) {
    return 'n/a';
  }
  return `${Number(value).toFixed(2)}h`;
}

function buildReport(kpi) {
  const generatedAt = new Date().toISOString();
  const availability = kpi?.availability ?? {};
  const repoGreen = kpi?.checkRepoGreenRate ?? {};
  const mttr = kpi?.mttrN1Hours ?? {};
  const backup = kpi?.backupWeekly ?? {};

  const lines = [
    '# Observability Baseline Report',
    '',
    `Generated at: ${generatedAt}`,
    '',
    '## Scope',
    '',
    '- Server readiness (`server:start` + `server:health`)',
    '- Database connectivity (`db:check`)',
    '- KPI exploitation generation (`kpi:exploitation`)',
    '',
    '## KPI Snapshot',
    '',
    `- Availability: ${formatPercent(availability.value)} (target >= ${availability.targetPercent ?? 'n/a'}%) -> ${availability.status ?? 'n/a'}`,
    `- check:repo green rate: ${formatPercent(repoGreen.value)} (target >= ${repoGreen.targetPercent ?? 'n/a'}%) -> ${repoGreen.status ?? 'n/a'}`,
    `- MTTR N1: ${formatHours(mttr.value)} (target < ${mttr.targetHours ?? 'n/a'}h) -> ${mttr.status ?? 'n/a'}`,
    `- Weekly backup + restore smoke: ${backup.status ?? 'n/a'}`,
    '',
    '## Decision',
    '',
    `- Observability baseline: **${availability.status === 'GO' && repoGreen.status === 'GO' && mttr.status === 'GO' && backup.status === 'GO' ? 'GO' : 'ALERTE'}**`,
    '- Note: this baseline validates signal production; alert routing/on-call wiring remains managed in infra tooling.',
    '',
  ];

  return `${lines.join('\n')}\n`;
}

function run() {
  runNpmScript('server:start');

  try {
    runNpmScript('server:health');
    runNpmScript('db:check');
    runNpmScript('kpi:exploitation');
  } finally {
    try {
      runNpmScript('server:stop');
    } catch (error) {
      console.warn(`[SPOFE observability] warning: unable to stop server cleanly: ${error.message}`);
    }
  }

  const kpi = readKpiJson();
  const report = buildReport(kpi);
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`[SPOFE observability] report written: ${reportPath}`);
}

run();
