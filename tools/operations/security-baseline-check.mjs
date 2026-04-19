import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';

const workspaceRoot = process.cwd();
const reportPath = path.resolve(workspaceRoot, 'governance', 'SECURITY_BASELINE_REPORT.md');

const SECRET_PATTERNS = [
  { label: 'private_key_block', regex: /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/ },
  { label: 'aws_secret_key', regex: /AWS_SECRET_ACCESS_KEY\s*=/i },
  { label: 'generic_api_key', regex: /\b(API_KEY|TOKEN|SECRET_KEY)\s*=\s*[A-Za-z0-9_\-]{20,}/i },
  { label: 'jwt_secret_literal', regex: /JWT_SECRET\s*=\s*(?!CHANGE_ME|<A_REMPLACER>|\$\{|VOTRE_|votre_|your-|dev-)[^\s#]+/i },
];

const ALLOWED_SECRET_FILE_PATTERNS = [
  /\.env\.example$/i,
  /\.env\.staging\.example$/i,
  /\.env\.production\.example$/i,
  /^docs?\//i,
  /^obsolete\//i,
  /^node_modules\//i,
  /^frontend\/node_modules\//i,
];

function runCommand(command, args, label, { required = true } = {}) {
  console.log(`[SPOFE security] run: ${label}`);
  const result =
    process.platform === 'win32'
      ? spawnSync('cmd.exe', ['/d', '/c', command, ...args], {
          cwd: workspaceRoot,
          stdio: 'inherit',
          shell: false,
          env: process.env,
        })
      : spawnSync(command, args, {
          cwd: workspaceRoot,
          stdio: 'inherit',
          shell: false,
          env: process.env,
        });

  const status = result.status ?? 1;
  if (status !== 0 && required) {
    throw new Error(`${label} failed (status=${status})`);
  }
  return status;
}

function listTrackedFiles() {
  const resultLsFiles = spawnSync('git', ['ls-files'], {
    cwd: workspaceRoot,
    shell: false,
    env: process.env,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  if ((resultLsFiles.status ?? 1) === 0) {
    return resultLsFiles.stdout
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
  }

  const resultLsTree = spawnSync('git', ['ls-tree', '-r', '--name-only', 'HEAD'], {
    cwd: workspaceRoot,
    shell: false,
    env: process.env,
    encoding: 'utf8',
    maxBuffer: 64 * 1024 * 1024,
  });

  if ((resultLsTree.status ?? 1) === 0) {
    console.warn('[SPOFE security] git ls-files unavailable; using git ls-tree HEAD fallback.');
    return resultLsTree.stdout
      .split(/\r?\n/)
      .map(line => line.trim())
      .filter(Boolean);
  }

  console.warn('[SPOFE security] git tracked listing unavailable; using filesystem fallback scan.');
  return listFilesFallback(workspaceRoot);
}

function listFilesFallback(rootDir) {
  const ignoredDirs = new Set([
    '.git',
    'node_modules',
    'coverage',
    'dist',
    'dist-aga',
    '.next',
  ]);

  const files = [];
  const stack = [rootDir];

  while (stack.length > 0) {
    const currentDir = stack.pop();
    if (!currentDir) continue;

    const entries = fs.readdirSync(currentDir, { withFileTypes: true });
    for (const entry of entries) {
      const absolutePath = path.join(currentDir, entry.name);
      const relativePath = path.relative(workspaceRoot, absolutePath).replace(/\\/g, '/');

      if (entry.isDirectory()) {
        if (ignoredDirs.has(entry.name)) {
          continue;
        }
        stack.push(absolutePath);
        continue;
      }

      files.push(relativePath);
    }
  }

  return files;
}

function isAllowedFile(relativePath) {
  return ALLOWED_SECRET_FILE_PATTERNS.some(pattern => pattern.test(relativePath));
}

function scanTrackedSecrets() {
  const files = listTrackedFiles();
  const findings = [];

  for (const relativePath of files) {
    if (isAllowedFile(relativePath)) {
      continue;
    }

    const absolutePath = path.resolve(workspaceRoot, relativePath);
    if (!fs.existsSync(absolutePath)) {
      continue;
    }

    let content = '';
    try {
      content = fs.readFileSync(absolutePath, 'utf8');
    } catch {
      continue;
    }

    for (const pattern of SECRET_PATTERNS) {
      if (pattern.regex.test(content)) {
        findings.push({
          file: relativePath,
          pattern: pattern.label,
        });
      }
    }
  }

  return findings;
}

function buildReport({ generatedAt, findings, checks }) {
  const depsPass = checks.validateDependencies === 0 && checks.testDependencies === 0;
  const contractsPass = checks.validateContracts === 0 && checks.testContractsFull === 0;
  const secretsPass = findings.length === 0;
  const decision = depsPass && secretsPass ? 'GO' : 'NO-GO';

  const lines = [
    '# Security Baseline Report',
    '',
    `Generated at: ${generatedAt}`,
    '',
    '## Scope',
    '',
    '- Dependency policy checks (`validate:dependencies` + `test:dependencies`)',
    '- Contract policy checks (`validate:contracts` + `test:contracts:full`)',
    '- Tracked-repository secret exposure scan (pattern-based)',
    '',
    '## Result',
    '',
    `- Dependency checks: **${depsPass ? 'PASS' : 'FAIL'}**`,
    `- Contract checks: **${contractsPass ? 'PASS' : 'WARN'}**`,
    `- Secret exposure scan: **${secretsPass ? 'PASS' : 'FAIL'}**`,
    `- Decision: **${decision}**`,
    '',
    '## Check Exit Codes',
    '',
    `- validate:dependencies: \`${checks.validateDependencies}\``,
    `- test:dependencies: \`${checks.testDependencies}\``,
    `- validate:contracts: \`${checks.validateContracts}\``,
    `- test:contracts:full: \`${checks.testContractsFull}\``,
    '',
    '## Secret Scan Findings',
    '',
  ];

  if (findings.length === 0) {
    lines.push('- none');
  } else {
    for (const finding of findings) {
      lines.push(`- ${finding.file} -> ${finding.pattern}`);
    }
  }

  lines.push(
    '',
    '## Notes',
    '',
    '- `.env.staging` and `.env.production` are intentionally untracked and excluded from this baseline.',
    '- This baseline is a repository-level control and complements runtime secret management in infrastructure.',
    ''
  );

  return `${lines.join('\n')}\n`;
}

function run() {
  const checks = {
    validateDependencies: runCommand('npm', ['run', 'validate:dependencies'], 'npm run validate:dependencies'),
    testDependencies: runCommand('npm', ['run', 'test:dependencies'], 'npm run test:dependencies'),
    validateContracts: runCommand('npm', ['run', 'validate:contracts'], 'npm run validate:contracts', { required: false }),
    testContractsFull: runCommand('npm', ['run', 'test:contracts:full'], 'npm run test:contracts:full', { required: false }),
  };

  const findings = scanTrackedSecrets();
  const report = buildReport({
    generatedAt: new Date().toISOString(),
    findings,
    checks,
  });
  fs.writeFileSync(reportPath, report, 'utf8');
  console.log(`[SPOFE security] report written: ${reportPath}`);

  const depsPass = checks.validateDependencies === 0 && checks.testDependencies === 0;
  if (!depsPass) {
    console.error('[SPOFE security] dependency checks failed.');
    process.exit(1);
  }

  if (findings.length > 0) {
    console.error('[SPOFE security] secret exposure findings detected.');
    process.exit(1);
  }
}

run();
