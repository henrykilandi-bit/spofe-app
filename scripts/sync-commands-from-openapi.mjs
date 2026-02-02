#!/usr/bin/env node

/**
 * Extract Commands from OpenAPI
 * 
 * Synchronise automatiquement allowed-commands.v1.json
 * depuis openapi.spofe.yaml
 * 
 * Usage: node scripts/sync-commands-from-openapi.mjs
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

async function extractCommandsFromOpenAPI() {
  console.log('[SYNC] Extracting Commands from OpenAPI...\n');

  try {
    // Lire OpenAPI
    const openAPIContent = fs.readFileSync(OPENAPI_PATH, 'utf-8');
    const openAPI = YAML.parse(openAPIContent);

    // Extraire les Commands (paths commençant par /commands/)
    const commands = [];

    for (const [path, pathItem] of Object.entries(openAPI.paths || {})) {
      if (path.startsWith('/commands/')) {
        // Extraire le nom de la commande depuis le path
        const commandName = path
          .replace('/commands/', '')
          .split('/')[0]; // En cas de sous-routes

        if (!commands.includes(commandName)) {
          commands.push(commandName);
          console.log(`  ✓ Found command: ${commandName}`);
        }
      }
    }

    if (commands.length === 0) {
      console.error('❌ No commands found in OpenAPI');
      process.exit(1);
    }

    // Charger le contrat existant
    let commandsContract = {
      version: '1.0.0',
      status: 'ACTIVE',
      lastUpdated: new Date().toISOString(),
      commands: []
    };

    if (fs.existsSync(COMMANDS_PATH)) {
      const existing = JSON.parse(fs.readFileSync(COMMANDS_PATH, 'utf-8'));
      commandsContract.version = existing.version;
      commandsContract.status = existing.status;
    }

    // Mettre à jour avec les commands de OpenAPI
    // Garder les détails existants si présents
    const detailedCommands = [];

    for (const commandName of commands) {
      const existing = commandsContract.commands?.find?.(
        c => (c.name || c) === commandName
      );

      if (typeof existing === 'object') {
        detailedCommands.push(existing);
      } else {
        detailedCommands.push({
          name: commandName,
          endpoint: `POST /commands/${commandName}`,
          description: `Command: ${commandName}`
        });
      }
    }

    // Créer le contrat final
    const finalContract = {
      version: commandsContract.version,
      status: commandsContract.status,
      lastUpdated: new Date().toISOString(),
      description: 'Automatically synchronized from openapi.spofe.yaml',
      commands: detailedCommands
    };

    // Écrire le fichier
    fs.writeFileSync(
      COMMANDS_PATH,
      JSON.stringify(finalContract, null, 2)
    );

    console.log(`\n✓ Synchronized ${commands.length} commands`);
    console.log(`✓ Saved to: ${COMMANDS_PATH}`);

    return true;

  } catch (error) {
    console.error('❌ Failed to extract commands:', error.message);
    process.exit(1);
  }
}

extractCommandsFromOpenAPI();
