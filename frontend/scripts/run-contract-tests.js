#!/usr/bin/env node
/**
 * Contract Tests Runner
 * ---------------------
 * Exécute les tests contractuels FE↔BE
 * 
 * Usage:
 *   node scripts/run-contract-tests.js [--backend-url=URL]
 * 
 * Environnement:
 *   BACKEND_URL - URL du backend (défaut: http://localhost:3000)
 * 
 * @module contract-tests-runner
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import http from 'http';

const __dirname = dirname(fileURLToPath(import.meta.url));
const frontendRoot = join(__dirname, '..');

// Parse arguments
const args = process.argv.slice(2);
const backendUrlArg = args.find(a => a.startsWith('--backend-url='));
const backendUrl = backendUrlArg?.split('=')[1] || process.env.BACKEND_URL || 'http://localhost:3000';

console.log(`
╔═══════════════════════════════════════════════════════════════╗
║           SPOFE Contract Tests — Cost-Structure               ║
║                  Frontend ↔ Backend                           ║
╠═══════════════════════════════════════════════════════════════╣
║  Backend URL: ${backendUrl.padEnd(46)}║
╚═══════════════════════════════════════════════════════════════╝
`);

/**
 * Check if backend is reachable
 */
async function checkBackend(url) {
  return new Promise((resolve) => {
    const urlObj = new URL(url);
    const req = http.request({
      hostname: urlObj.hostname,
      port: urlObj.port || 80,
      path: '/health',
      method: 'GET',
      timeout: 5000
    }, (res) => {
      resolve(res.statusCode >= 200 && res.statusCode < 500);
    });
    
    req.on('error', () => resolve(false));
    req.on('timeout', () => {
      req.destroy();
      resolve(false);
    });
    req.end();
  });
}

/**
 * Run vitest with contract config
 */
function runTests() {
  return new Promise((resolve, reject) => {
    const vitest = spawn('npx', ['vitest', 'run', '--config', 'vitest.contract.config.js'], {
      cwd: frontendRoot,
      stdio: 'inherit',
      shell: true,
      env: {
        ...process.env,
        BACKEND_URL: backendUrl
      }
    });

    vitest.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Tests failed with code ${code}`));
      }
    });

    vitest.on('error', reject);
  });
}

// Main
async function main() {
  console.log('🔍 Checking backend availability...');
  
  const isBackendUp = await checkBackend(backendUrl);
  
  if (!isBackendUp) {
    console.log(`
⚠️  Backend not reachable at ${backendUrl}

Options:
  1. Start the backend: cd cascade && npm run start:dev
  2. Use a different URL: node scripts/run-contract-tests.js --backend-url=http://other:port
  3. Run in mock mode (tests will skip actual HTTP calls)

Running tests in MOCK mode...
`);
    process.env.CONTRACT_TEST_MODE = 'mock';
  } else {
    console.log('✅ Backend is up\n');
  }

  try {
    await runTests();
    console.log(`
╔═══════════════════════════════════════════════════════════════╗
║             ✅ Contract Tests PASSED                          ║
╚═══════════════════════════════════════════════════════════════╝
`);
  } catch (err) {
    console.error(`
╔═══════════════════════════════════════════════════════════════╗
║             ❌ Contract Tests FAILED                          ║
╚═══════════════════════════════════════════════════════════════╝
`);
    process.exit(1);
  }
}

main().catch(err => {
  console.error('Unexpected error:', err);
  process.exit(1);
});
