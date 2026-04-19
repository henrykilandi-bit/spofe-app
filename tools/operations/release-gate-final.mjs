import { spawnSync } from 'node:child_process';

const STEPS = [
  {
    name: 'Repository health',
    command: 'npm',
    args: ['run', 'check:repo'],
  },
  {
    name: 'Extended modules validation',
    command: 'npm',
    args: ['run', 'check:modules:extended'],
  },
];

function runStep(step) {
  const printable = `${step.command} ${step.args.join(' ')}`.trim();
  console.log(`[SPOFE release-gate] start: ${step.name} | ${printable}`);

  const result =
    process.platform === 'win32'
      ? spawnSync('cmd.exe', ['/d', '/c', step.command, ...step.args], {
          stdio: 'inherit',
          shell: false,
          env: process.env,
        })
      : spawnSync(step.command, step.args, {
          stdio: 'inherit',
          shell: false,
          env: process.env,
        });

  const status = result.status ?? 1;
  if (status !== 0) {
    return {
      ...step,
      status: 'failed',
      exitCode: status,
      signal: result.signal ?? null,
      error: result.error?.message ?? null,
    };
  }

  return {
    ...step,
    status: 'ok',
    exitCode: 0,
    signal: null,
    error: null,
  };
}

const results = [];
for (const step of STEPS) {
  const result = runStep(step);
  results.push(result);
  if (result.status !== 'ok') {
    break;
  }
}

console.log('[SPOFE release-gate] summary');
for (const result of results) {
  const tail = result.status === 'ok' ? '' : ` | exit=${result.exitCode} signal=${result.signal ?? 'null'} error=${result.error ?? 'null'}`;
  console.log(`- ${result.name}: ${result.status}${tail}`);
}

const hasFailure = results.some(result => result.status !== 'ok');
if (hasFailure) {
  console.error('[SPOFE release-gate] FAILED');
  process.exit(1);
}

console.log('[SPOFE release-gate] PASSED');
