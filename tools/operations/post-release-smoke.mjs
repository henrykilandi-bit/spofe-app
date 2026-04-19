import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { spawnSync } from 'node:child_process';
import { appendOpsEventSafe } from './ops-event-log.mjs';
import { resolveRuntimePort } from '../runtime/env-utils.mjs';

function parseArgs(argv) {
  const args = {
    reportJson: 'governance/POST_RELEASE_SMOKE_LATEST.json',
    reportMd: 'governance/POST_RELEASE_SMOKE_LATEST.md',
  };

  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
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
  console.log(`[SPOFE post-release-smoke] run: ${label}`);

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

function requestJson({ port, method, pathName, body, timeoutMs = 5000 }) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;

    const request = http.request(
      {
        hostname: '127.0.0.1',
        port,
        path: pathName,
        method,
        timeout: timeoutMs,
        headers: payload
          ? {
              'content-type': 'application/json',
              'content-length': Buffer.byteLength(payload),
            }
          : undefined,
      },
      (response) => {
        let responseBody = '';
        response.on('data', chunk => {
          responseBody += chunk;
        });
        response.on('end', () => {
          let parsed = null;
          try {
            parsed = responseBody ? JSON.parse(responseBody) : null;
          } catch {
            parsed = null;
          }
          resolve({
            statusCode: response.statusCode ?? 0,
            body: responseBody,
            json: parsed,
          });
        });
      }
    );

    request.on('timeout', () => {
      request.destroy(new Error(`timeout ${method} ${pathName}`));
    });
    request.on('error', reject);

    if (payload) {
      request.write(payload);
    }
    request.end();
  });
}

async function runHttpChecks(port) {
  const checks = [];

  const health = await requestJson({
    port,
    method: 'GET',
    pathName: '/health',
  });
  checks.push({
    check: 'GET /health',
    expectedStatus: 200,
    actualStatus: health.statusCode,
    passed: health.statusCode === 200 && health.json?.status === 'healthy',
    details:
      health.statusCode === 200
        ? `status=${health.json?.status ?? 'unknown'}`
        : `unexpected status ${health.statusCode}`,
  });

  const invalidCreate = await requestJson({
    port,
    method: 'POST',
    pathName: '/aggregates',
    body: {
      invalid: true,
    },
  });
  checks.push({
    check: 'POST /aggregates invalid payload',
    expectedStatus: 400,
    actualStatus: invalidCreate.statusCode,
    passed: invalidCreate.statusCode === 400,
    details:
      invalidCreate.statusCode === 400
        ? 'DTO guard active'
        : `unexpected status ${invalidCreate.statusCode}`,
  });

  return checks;
}

function buildMarkdown(report) {
  const lines = [
    '# Post-release Smoke Report (latest)',
    '',
    `Generated at: ${report.generatedAt}`,
    `Verdict: **${report.verdict}**`,
    '',
    '## Runtime commands',
    '',
    '| Step | Status | Duration (ms) | Command |',
    '| --- | --- | ---: | --- |',
  ];

  for (const command of report.commands) {
    lines.push(
      `| ${command.label} | ${command.status === 0 ? 'OK' : 'FAIL'} | ${command.durationMs} | \`${command.command}\` |`
    );
  }

  lines.push('', '## HTTP checks', '', '| Check | Expected | Actual | Status | Details |', '| --- | ---: | ---: | --- | --- |');

  for (const check of report.httpChecks) {
    lines.push(
      `| ${check.check} | ${check.expectedStatus} | ${check.actualStatus} | ${check.passed ? 'PASS' : 'FAIL'} | ${check.details} |`
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

async function main() {
  const startedAt = Date.now();
  const args = parseArgs(process.argv.slice(2));
  const reportJsonPath = path.resolve(process.cwd(), args.reportJson);
  const reportMdPath = path.resolve(process.cwd(), args.reportMd);
  const port = Number.parseInt(resolveRuntimePort(), 10);

  const commands = [];
  let httpChecks = [];

  try {
    commands.push(runCommand('server-start', 'npm', ['run', 'server:start']));
    if (commands.at(-1).status !== 0) {
      throw new Error('server:start failed');
    }

    commands.push(runCommand('server-health', 'npm', ['run', 'server:health']));
    if (commands.at(-1).status !== 0) {
      throw new Error('server:health failed');
    }

    httpChecks = await runHttpChecks(port);
  } catch (error) {
    httpChecks.push({
      check: 'post-release-smoke-runtime',
      expectedStatus: 0,
      actualStatus: 1,
      passed: false,
      details: error instanceof Error ? error.message : String(error),
    });
  } finally {
    commands.push(runCommand('server-stop', 'npm', ['run', 'server:stop']));
  }

  const reasons = [];
  const failedCommands = commands.filter(command => command.status !== 0 && command.label !== 'server-stop');
  if (failedCommands.length > 0) {
    reasons.push(`failed command(s): ${failedCommands.map(command => command.label).join(', ')}`);
  }

  const failedChecks = httpChecks.filter(check => !check.passed);
  if (failedChecks.length > 0) {
    reasons.push(`failed http check(s): ${failedChecks.map(check => check.check).join(', ')}`);
  }

  const verdict = reasons.length === 0 ? 'GO' : 'NO-GO';
  const report = {
    generatedAt: new Date().toISOString(),
    durationMs: Date.now() - startedAt,
    verdict,
    commands,
    httpChecks,
    reasons,
  };

  fs.mkdirSync(path.dirname(reportJsonPath), { recursive: true });
  fs.mkdirSync(path.dirname(reportMdPath), { recursive: true });
  fs.writeFileSync(reportJsonPath, JSON.stringify(report, null, 2), 'utf8');
  fs.writeFileSync(reportMdPath, buildMarkdown(report), 'utf8');

  appendOpsEventSafe({
    metric: 'post_release_smoke',
    status: verdict === 'GO' ? 'ok' : 'error',
    command: 'npm run post-release:smoke',
    durationMs: report.durationMs,
    details: {
      verdict,
      reportJsonPath,
      reportMdPath,
      failedChecks: failedChecks.map(check => check.check),
    },
  });

  console.log(`[SPOFE post-release-smoke] report json: ${reportJsonPath}`);
  console.log(`[SPOFE post-release-smoke] report md: ${reportMdPath}`);
  console.log(`[SPOFE post-release-smoke] verdict: ${verdict}`);

  if (verdict !== 'GO') {
    process.exit(1);
  }
}

main();
