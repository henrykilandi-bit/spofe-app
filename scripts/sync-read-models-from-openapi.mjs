#!/usr/bin/env node

/**
 * Extract Read-models from OpenAPI
 * 
 * Synchronise automatiquement allowed-read-models.v1.json
 * depuis openapi.spofe.yaml
 * 
 * Usage: node scripts/sync-read-models-from-openapi.mjs
 */

import fs from 'fs';
import path from 'path';
import YAML from 'yaml';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const OPENAPI_PATH = path.join(projectRoot, 'openapi.spofe.yaml');
const READ_MODELS_PATH = path.join(
  projectRoot,
  'contracts/frontend-backend/allowed-read-models.v1.json'
);

async function extractReadModelsFromOpenAPI() {
  console.log('[SYNC] Extracting Read-models from OpenAPI...\n');

  try {
    // Lire OpenAPI
    const openAPIContent = fs.readFileSync(OPENAPI_PATH, 'utf-8');
    const openAPI = YAML.parse(openAPIContent);

    // Extraire les Read-models (paths commençant par /read/)
    const readModels = [];

    for (const [path, pathItem] of Object.entries(openAPI.paths || {})) {
      if (path.startsWith('/read/')) {
        // Vérifier que c'est un GET (read-only)
        if (pathItem.get) {
          readModels.push(path);
          console.log(`  ✓ Found read-model: ${path}`);
        } else {
          console.warn(`  ⚠ Skipped (not GET): ${path}`);
        }
      }
    }

    if (readModels.length === 0) {
      console.error('❌ No read-models found in OpenAPI');
      process.exit(1);
    }

    // Charger le contrat existant
    let readModelsContract = {
      version: '1.0.0',
      status: 'ACTIVE',
      lastUpdated: new Date().toISOString(),
      readModels: []
    };

    if (fs.existsSync(READ_MODELS_PATH)) {
      const existing = JSON.parse(fs.readFileSync(READ_MODELS_PATH, 'utf-8'));
      readModelsContract.version = existing.version;
      readModelsContract.status = existing.status;
    }

    // Mettre à jour avec les read-models de OpenAPI
    const detailedReadModels = [];

    for (const rmPath of readModels) {
      const existing = readModelsContract.readModels?.find?.(
        r => (r.path || r) === rmPath
      );

      if (typeof existing === 'object') {
        detailedReadModels.push(existing);
      } else {
        detailedReadModels.push({
          path: rmPath,
          method: 'GET',
          description: `Read-model: ${rmPath}`,
          cacheStrategy: 'short-term'
        });
      }
    }

    // Créer le contrat final
    const finalContract = {
      version: readModelsContract.version,
      status: readModelsContract.status,
      lastUpdated: new Date().toISOString(),
      description: 'Automatically synchronized from openapi.spofe.yaml',
      readModels: detailedReadModels
    };

    // Écrire le fichier
    fs.writeFileSync(
      READ_MODELS_PATH,
      JSON.stringify(finalContract, null, 2)
    );

    console.log(`\n✓ Synchronized ${readModels.length} read-models`);
    console.log(`✓ Saved to: ${READ_MODELS_PATH}`);

    return true;

  } catch (error) {
    console.error('❌ Failed to extract read-models:', error.message);
    process.exit(1);
  }
}

extractReadModelsFromOpenAPI();
