import fs from 'node:fs';
import path from 'node:path';
import { spawn } from 'node:child_process';
import { appendOpsEventSafe } from '../operations/ops-event-log.mjs';

function runStep(command) {
  const startedAt = Date.now();
  return new Promise((resolve, reject) => {
    const child =
      process.platform === 'win32'
        ? spawn('cmd.exe', ['/d', '/s', '/c', command], {
            stdio: 'inherit',
            shell: false,
            env: process.env,
          })
        : spawn('sh', ['-lc', command], {
            stdio: 'inherit',
            shell: false,
            env: process.env,
          });

    child.on('error', reject);
    child.on('exit', code => {
      resolve({
        command,
        status: code ?? 1,
        durationMs: Date.now() - startedAt,
      });
    });
  });
}

function buildMarkdown(report) {
  const lines = [
    '# Pilot Supervision Cycle (latest)',
    '',
    `Generated at: ${report.generatedAt}`,
    `Verdict: **${report.verdict}**`,
    '',
    '| Step | Status | Duration (ms) | Command |',
    '| --- | --- | ---: | --- |',
  ];

  for (const step of report.steps) {
    lines.push(
      `| ${step.label} | ${step.status === 0 ? 'OK' : 'FAIL'} | ${step.durationMs} | \`${step.command}\` |`
    );
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

const steps = [
  { label: 'Start server', command: 'npm run server:start' },
  { label: 'Health check', command: 'npm run server:health' },
  { label: 'DB connectivity', command: 'npm run db:check' },
  { label: 'KPI refresh', command: 'npm run kpi:exploitation' },
  { label: 'SLO refresh', command: 'npm run observability:slo' },
];

const startedAt = Date.now();
const results = [];
let failedAt = null;

for (const step of steps) {
  console.log(`[SPOFE pilot] ${step.label}...`);
  // eslint-disable-next-line no-await-in-loop
  const run = await runStep(step.command);
  results.push({ ...step, status: run.status, durationMs: run.durationMs });
  if (run.status !== 0) {
    failedAt = step.label;
    break;
  }
}

const reasons = [];
if (failedAt) {
  reasons.push(`step failed: ${failedAt}`);
}

const report = {
  generatedAt: new Date().toISOString(),
  durationMs: Date.now() - startedAt,
  verdict: reasons.length === 0 ? 'GO' : 'NO-GO',
  steps: results,
  reasons,
};

const reportJsonPath = path.resolve(process.cwd(), 'governance', 'PILOT_SUPERVISION_LATEST.json');
const reportMdPath = path.resolve(process.cwd(), 'governance', 'PILOT_SUPERVISION_LATEST.md');
fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), 'utf8');
fs.writeFileSync(reportMdPath, buildMarkdown(report), 'utf8');

appendOpsEventSafe({
  metric: 'pilot_supervision',
  status: report.verdict === 'GO' ? 'ok' : 'error',
  command: 'npm run pilot:supervision',
  durationMs: report.durationMs,
  details: {
    reportJsonPath,
    reportMdPath,
    failedAt,
  },
});

if (report.verdict === 'GO') {
  console.log(`[SPOFE pilot] Supervision cycle OK (${report.durationMs} ms).`);
  console.log(`[SPOFE pilot] Report: ${reportMdPath}`);
  process.exit(0);
}

console.error(`[SPOFE pilot] FAILED (${report.durationMs} ms).`);
console.error(`[SPOFE pilot] Report: ${reportMdPath}`);
process.exit(1);
