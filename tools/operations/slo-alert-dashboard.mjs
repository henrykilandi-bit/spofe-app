import fs from 'node:fs';
import path from 'node:path';
import { appendOpsEventSafe } from './ops-event-log.mjs';

const workspaceRoot = process.cwd();
const kpiJsonPath = path.resolve(
  workspaceRoot,
  process.env.SLO_KPI_INPUT ?? path.join('.spofe', 'kpi-exploitation-latest.json')
);
const alertsJsonPath = path.resolve(
  workspaceRoot,
  process.env.SLO_ALERTS_OUTPUT ?? path.join('.spofe', 'observability-alerts-latest.json')
);
const dashboardPath = path.resolve(
  workspaceRoot,
  process.env.SLO_DASHBOARD_OUTPUT ?? path.join('governance', 'OBSERVABILITY_SLO_DASHBOARD_LATEST.md')
);

const SLO_CONFIG = {
  availability: {
    label: 'Disponibilite service',
    unit: '%',
    target: 99,
    warningDelta: 0.3,
    extract: kpi => kpi?.availability?.value ?? null,
  },
  repoGreenRate: {
    label: 'Taux check:repo vert',
    unit: '%',
    target: 90,
    warningDelta: 2,
    extract: kpi => kpi?.checkRepoGreenRate?.value ?? null,
  },
  mttrN1: {
    label: 'MTTR incident N1',
    unit: 'h',
    targetMax: 24,
    warningDelta: 2,
    extract: kpi => kpi?.mttrN1Hours?.value ?? null,
  },
  backupWeekly: {
    label: 'Backup+restore hebdo',
    kind: 'status',
    extract: kpi => kpi?.backupWeekly?.status ?? null,
  },
};

function readKpi() {
  if (!fs.existsSync(kpiJsonPath)) {
    throw new Error(`KPI file not found: ${kpiJsonPath}`);
  }
  return JSON.parse(fs.readFileSync(kpiJsonPath, 'utf8'));
}

function toFixedOrNa(value, digits = 2) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return 'n/a';
  }
  return Number(value).toFixed(digits);
}

function evaluateNumericMin(value, target, warningDelta) {
  if (value === null || value === undefined) {
    return { level: 'warning', reason: 'missing metric' };
  }
  if (value < target) {
    return { level: 'critical', reason: `below target ${target}` };
  }
  if (value < target + warningDelta) {
    return { level: 'warning', reason: `near target (${target})` };
  }
  return { level: 'ok', reason: 'within target' };
}

function evaluateNumericMax(value, targetMax, warningDelta) {
  if (value === null || value === undefined) {
    return { level: 'ok', reason: 'no resolved incident in window' };
  }
  if (value >= targetMax) {
    return { level: 'critical', reason: `above max ${targetMax}` };
  }
  if (value >= targetMax - warningDelta) {
    return { level: 'warning', reason: `near max (${targetMax})` };
  }
  return { level: 'ok', reason: 'within target' };
}

function evaluateStatus(value) {
  if (value === 'GO') {
    return { level: 'ok', reason: 'status GO' };
  }
  if (value === null || value === undefined) {
    return { level: 'warning', reason: 'missing status' };
  }
  return { level: 'critical', reason: `status ${value}` };
}

function evaluateSlo(kpi) {
  const checks = [];

  {
    const config = SLO_CONFIG.availability;
    const value = config.extract(kpi);
    const evalResult = evaluateNumericMin(value, config.target, config.warningDelta);
    checks.push({
      id: 'availability',
      label: config.label,
      value,
      unit: config.unit,
      target: `>= ${config.target}${config.unit}`,
      level: evalResult.level,
      reason: evalResult.reason,
    });
  }

  {
    const config = SLO_CONFIG.repoGreenRate;
    const value = config.extract(kpi);
    const evalResult = evaluateNumericMin(value, config.target, config.warningDelta);
    checks.push({
      id: 'repoGreenRate',
      label: config.label,
      value,
      unit: config.unit,
      target: `>= ${config.target}${config.unit}`,
      level: evalResult.level,
      reason: evalResult.reason,
    });
  }

  {
    const config = SLO_CONFIG.mttrN1;
    const value = config.extract(kpi);
    const evalResult = evaluateNumericMax(value, config.targetMax, config.warningDelta);
    checks.push({
      id: 'mttrN1',
      label: config.label,
      value,
      unit: config.unit,
      target: `< ${config.targetMax}${config.unit}`,
      level: evalResult.level,
      reason: evalResult.reason,
    });
  }

  {
    const config = SLO_CONFIG.backupWeekly;
    const value = config.extract(kpi);
    const evalResult = evaluateStatus(value);
    checks.push({
      id: 'backupWeekly',
      label: config.label,
      value,
      unit: '',
      target: 'GO',
      level: evalResult.level,
      reason: evalResult.reason,
    });
  }

  const criticalCount = checks.filter(check => check.level === 'critical').length;
  const warningCount = checks.filter(check => check.level === 'warning').length;
  const overall = criticalCount > 0 ? 'CRITICAL' : warningCount > 0 ? 'WARNING' : 'GO';

  return {
    generatedAt: new Date().toISOString(),
    overall,
    criticalCount,
    warningCount,
    checks,
  };
}

function buildDashboard(evaluation) {
  const lines = [
    '# Dashboard SLO Exploitation (latest)',
    '',
    `Generated at: ${evaluation.generatedAt}`,
    `Overall: **${evaluation.overall}**`,
    '',
    '## Checks',
    '',
    '| SLO | Valeur | Cible | Niveau | Commentaire |',
    '| --- | --- | --- | --- | --- |',
  ];

  for (const check of evaluation.checks) {
    const renderedValue =
      typeof check.value === 'number'
        ? `${toFixedOrNa(check.value)}${check.unit}`
        : (check.value ?? 'n/a');
    lines.push(`| ${check.label} | ${renderedValue} | ${check.target} | ${check.level.toUpperCase()} | ${check.reason} |`);
  }

  lines.push(
    '',
    '## Alerting summary',
    '',
    `- Critical alerts: ${evaluation.criticalCount}`,
    `- Warning alerts: ${evaluation.warningCount}`,
    '',
    '## Action rule',
    '',
    '- `GO`: exploitation nominale.',
    '- `WARNING`: investigation sous 24h.',
    '- `CRITICAL`: action immediate + ouverture incident.',
    ''
  );

  return `${lines.join('\n')}\n`;
}

function run() {
  const kpi = readKpi();
  const evaluation = evaluateSlo(kpi);
  const dashboard = buildDashboard(evaluation);

  fs.mkdirSync(path.dirname(alertsJsonPath), { recursive: true });
  fs.writeFileSync(alertsJsonPath, JSON.stringify(evaluation, null, 2), 'utf8');
  fs.writeFileSync(dashboardPath, dashboard, 'utf8');

  appendOpsEventSafe({
    metric: 'observability_slo',
    status: evaluation.overall === 'CRITICAL' ? 'error' : 'ok',
    command: 'npm run observability:slo',
    details: {
      overall: evaluation.overall,
      criticalCount: evaluation.criticalCount,
      warningCount: evaluation.warningCount,
    },
  });

  console.log(`[SPOFE slo] dashboard: ${dashboardPath}`);
  console.log(`[SPOFE slo] alerts: ${alertsJsonPath}`);
  console.log(`[SPOFE slo] overall=${evaluation.overall} critical=${evaluation.criticalCount} warning=${evaluation.warningCount}`);
}

run();
