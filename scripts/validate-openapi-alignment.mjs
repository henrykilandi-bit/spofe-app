#!/usr/bin/env node

/**
 * Validate OpenAPI ↔ Contract Alignment
 * 
 * Vérifie que:
 * - Tous les Commands dans OpenAPI sont dans le contrat
 * - Tous les Read-models dans OpenAPI sont dans le contrat
 * - Aucun endpoint fantôme
 * - Aucune ambiguïté HTTP methods
 * 
 * Usage: node scripts/validate-openapi-alignment.mjs
 */

import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const OPENAPI_PATH = path.join(projectRoot, 'openapi.spofe.yaml');
const COMMANDS_PATH = path.join(
  projectRoot,
  'contracts/frontend-backend/allowed-commands.v1.json'
);
const READ_MODELS_PATH = path.join(
  projectRoot,
  'contracts/frontend-backend/allowed-read-models.v1.json'
);

let errorCount = 0;
let warningCount = 0;

function error(message) {
  console.error(`❌ ${message}`);
  errorCount++;
}

function warn(message) {
  console.warn(`⚠️ ${message}`);
  warningCount++;
}

function pass(message) {
  console.log(`✓ ${message}`);
}

async function validateAlignment() {
  console.log('[VALIDATE] OpenAPI ↔ Contract Alignment\n');

  try {
    // Lire les fichiers
    const openAPIContent = fs.readFileSync(OPENAPI_PATH, 'utf-8');
    const openAPI = YAML.parse(openAPIContent);

    const commands = JSON.parse(fs.readFileSync(COMMANDS_PATH, 'utf-8'));
    const readModels = JSON.parse(fs.readFileSync(READ_MODELS_PATH, 'utf-8'));

    // ═══════════════════════════════════════════════════════════
    // 1️⃣ Vérifier Commands
    // ═══════════════════════════════════════════════════════════

    console.log('CHECK 1: Commands alignment\n');

    const openAPICommands = [];
    for (const [path, pathItem] of Object.entries(openAPI.paths || {})) {
      if (path.startsWith('/commands/')) {
        const commandName = path
          .replace('/commands/', '')
          .split('/')[0];

        if (!openAPICommands.includes(commandName)) {
          openAPICommands.push(commandName);
        }

        // Vérifier HTTP method
        if (!pathItem.post) {
          error(`Command ${commandName} must use POST, not ${Object.keys(pathItem)[0]}`);
        }
      }
    }

    const contractCommands = commands.commands.map(c =>
      typeof c === 'string' ? c : c.name
    );

    // Comparer
    for (const cmd of openAPICommands) {
      if (!contractCommands.includes(cmd)) {
        error(`Command in OpenAPI but not in contract: ${cmd}`);
      } else {
        pass(`Command synchronized: ${cmd}`);
      }
    }

    for (const cmd of contractCommands) {
      if (!openAPICommands.includes(cmd)) {
        error(`Command in contract but not in OpenAPI: ${cmd}`);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 2️⃣ Vérifier Read-models
    // ═══════════════════════════════════════════════════════════

    console.log('\nCHECK 2: Read-models alignment\n');

    const openAPIReadModels = [];
    for (const [path, pathItem] of Object.entries(openAPI.paths || {})) {
      if (path.startsWith('/read/')) {
        openAPIReadModels.push(path);

        // Vérifier HTTP method
        if (!pathItem.get) {
          error(`Read-model ${path} must use GET, not POST/PUT/DELETE`);
        }
      }
    }

    const contractReadModels = readModels.readModels.map(r =>
      typeof r === 'string' ? r : r.path
    );

    // Comparer
    for (const rm of openAPIReadModels) {
      if (!contractReadModels.includes(rm)) {
        error(`Read-model in OpenAPI but not in contract: ${rm}`);
      } else {
        pass(`Read-model synchronized: ${rm}`);
      }
    }

    for (const rm of contractReadModels) {
      if (!openAPIReadModels.includes(rm)) {
        error(`Read-model in contract but not in OpenAPI: ${rm}`);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 3️⃣ Vérifier pas d'endpoints fantômes
    // ═══════════════════════════════════════════════════════════

    console.log('\nCHECK 3: No phantom endpoints\n');

    for (const [path, pathItem] of Object.entries(openAPI.paths || {})) {
      // Accepter /health (non contractuel)
      if (path === '/health') {
        continue;
      }

      if (!path.startsWith('/commands/') && !path.startsWith('/read/')) {
        warn(`Endpoint not in contract prefix: ${path}`);
      }
    }

    // ═══════════════════════════════════════════════════════════
    // 4️⃣ Vérifier versions alignées
    // ═══════════════════════════════════════════════════════════

    console.log('\nCHECK 4: Contract versions\n');

    if (commands.version !== readModels.version) {
      error(
        `Version mismatch: commands (${commands.version}) ≠ read-models (${readModels.version})`
      );
    } else {
      pass(`Versions aligned: ${commands.version}`);
    }

    // ═══════════════════════════════════════════════════════════
    // RÉSUMÉ
    // ═══════════════════════════════════════════════════════════

    console.log('\n═══════════════════════════════════════════════════════════');

    if (errorCount === 0 && warningCount === 0) {
      console.log('✓ ALL ALIGNMENT CHECKS PASSED');
      console.log('  OpenAPI ↔ Contract are perfectly aligned');
    } else {
      console.log(
        `Errors: ${errorCount} | Warnings: ${warningCount}`
      );

      if (errorCount > 0) {
        console.log('\n❌ ALIGNMENT VALIDATION FAILED');
        process.exit(1);
      }
    }

    console.log('═══════════════════════════════════════════════════════════\n');

  } catch (error) {
    console.error('❌ Validation error:', error.message);
    process.exit(1);
  }
}

validateAlignment();
