import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const workspaceRoot = path.resolve(__dirname, '..', '..');
const opsEventFile = path.resolve(workspaceRoot, '.spofe', 'ops-events.jsonl');
const reportPath = path.resolve(workspaceRoot, 'governance', 'DB_EXECUTION_SAFETY_REPORT.md');

const REQUIRED_METRICS = ['db_check', 'db_migrate', 'db_backup_smoke'];

function runNodeScript(relativePath) {
  const scriptPath = path.resolve(workspaceRoot, relativePath);
  const display = `node ${relativePath}`;
  console.log(`[SPOFE db-safety] run: ${display}`);

  const result = spawnSync(process.execPath, [scriptPath], {
    cwd: workspaceRoot,
    stdio: 'inherit',
    shell: false,
    env: process.env,
  });

  const status = result.status ?? 1;
  if (status !== 0) {
    throw new Error(`${display} failed (status=${status})`);
  }
}

function parseOpsEvents() {
  if (!fs.existsSync(opsEventFile)) {
    throw new Error(`ops event log not found: ${opsEventFile}`);
  }

  return fs
    .readFileSync(opsEventFile, 'utf8')
    .split(/\r?\n/)
    .filter(Boolean)
    .map(line => JSON.parse(line));
}

function findLatestOkMetric(events, metric) {
  for (let index = events.length - 1; index >= 0; index -= 1) {
    const event = events[index];
    if (event.metric === metric && event.status === 'ok') {
      return event;
    }
  }
  return null;
}

function buildReport(rows, generatedAt) {
  const lines = [
    '# DB Execution Safety Report',
    '',
    `Generated at: ${generatedAt}`,
    '',
    '## Result',
    '',
    '- Status: **PASS**',
    '- Scope: migration, connectivity, backup/restore smoke',
    '- Decision: **GO** for DB execution safety baseline',
    '',
    '## Evidence',
    '',
    '| Check | Timestamp | Duration (ms) | Details |',
    '| --- | --- | ---: | --- |',
  ];

  for (const row of rows) {
    lines.push(
      `| ${row.metric} | ${row.timestamp} | ${row.durationMs ?? 'n/a'} | ${row.details} |`
    );
  }

  lines.push(
    '',
    '## SLO Targets',
    '',
    '- RPO target: <= 24h',
    '- RTO target: <= 4h',
    '',
    '## Notes',
    '',
    '- Backup/restore smoke runs with transactional rollback (no destructive write persisted).',
    '- This report validates execution safety baseline; periodic restore drills remain required.',
    ''
  );

  return `${lines.join('\n')}\n`;
}

function escapePipes(value) {
  return String(value).replace(/\|/g, '\\|');
}

function run() {
  runNodeScript('tools/operations/db-check.mjs');
  runNodeScript('tools/operations/db-migrate.mjs');
  runNodeScript('tools/operations/db-backup-restore-smoke.mjs');

  const events = parseOpsEvents();
  const rows = [];

  for (const metric of REQUIRED_METRICS) {
    const event = findLatestOkMetric(events, metric);
    if (!event) {
      throw new Error(`No successful event found for metric ${metric}`);
    }

    const detailsText = event.details ? escapePipes(JSON.stringify(event.details)) : 'n/a';
    rows.push({
      metric,
      timestamp: event.timestamp ?? 'n/a',
      durationMs: event.durationMs ?? 'n/a',
      details: detailsText,
    });
  }

  const generatedAt = new Date().toISOString();
  const report = buildReport(rows, generatedAt);
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`[SPOFE db-safety] report written: ${reportPath}`);
}

run();
