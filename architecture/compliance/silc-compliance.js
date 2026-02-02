#!/usr/bin/env node
/**
 * 🛡️ SILC Compliance Signature Manager
 * Vérifie et régénère la signature SILC_COMPLIANCE.json
 */

import { readFileSync, writeFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { dirname } from 'path';

const COMPLIANCE_FILE = 'architecture/compliance/SILC_COMPLIANCE.json';

function getCommitHash() {
  try {
    return execSync('git rev-parse HEAD', { encoding: 'utf-8' }).trim();
  } catch {
    return 'no-git-repo';
  }
}

function getCurrentTimestamp() {
  return new Date().toISOString();
}

function readCompliance() {
  if (!existsSync(COMPLIANCE_FILE)) {
    console.log(`❌ Fichier non trouvé: ${COMPLIANCE_FILE}`);
    return null;
  }
  try {
    return JSON.parse(readFileSync(COMPLIANCE_FILE, 'utf-8'));
  } catch (error) {
    console.log(`❌ Erreur lecture JSON: ${error}`);
    return null;
  }
}

function writeCompliance(data) {
  const dir = dirname(COMPLIANCE_FILE);
  if (!existsSync(dir)) {
    console.log(`📁 Création dossier: ${dir}`);
  }
  writeFileSync(COMPLIANCE_FILE, JSON.stringify(data, null, 2), 'utf-8');
  console.log(`✅ Signature écrite: ${COMPLIANCE_FILE}`);
}

function verifySignature() {
  console.log('\n🔍 Vérification signature SILC\n');

  const compliance = readCompliance();
  if (!compliance) {
    console.log('❌ Impossible de lire la signature\n');
    return false;
  }

  const checks = {
    'Status présent': !!compliance.status,
    'SILC Version': compliance.silcVersion === '2.0',
    'Guardian configuré': !!compliance.guardian?.version,
    'Scope défini': compliance.scope === 'SPOFE',
    'Commit hash': compliance.commit && compliance.commit.length === 40,
    'Timestamp ISO 8601': /^\d{4}-\d{2}-\d{2}T/.test(compliance.generatedAt),
    'Signataire': !!compliance.signedBy,
  };

  let allValid = true;
  for (const [check, valid] of Object.entries(checks)) {
    console.log(`${valid ? '✅' : '❌'} ${check}`);
    if (!valid) allValid = false;
  }

  console.log(`\n${allValid ? '✅ Signature valide' : '❌ Signature invalide'}\n`);
  return allValid;
}

function regenerateSignature(newStatus = null) {
  console.log('\n🔄 Régénération signature SILC\n');

  const compliance = readCompliance();
  if (!compliance) {
    console.log('❌ Impossible de lire la signature existante\n');
    return false;
  }

  const oldStatus = compliance.status;
  const newCommit = getCommitHash();
  const newTimestamp = getCurrentTimestamp();

  if (newStatus) {
    compliance.status = newStatus;
  }
  compliance.commit = newCommit;
  compliance.generatedAt = newTimestamp;

  console.log(`📋 Changements:`);
  if (newStatus && newStatus !== oldStatus) {
    console.log(`   Status: ${oldStatus} → ${newStatus}`);
  }
  console.log(`   Commit: ${newCommit.substring(0, 8)}...`);
  console.log(`   Timestamp: ${newTimestamp}\n`);

  writeCompliance(compliance);
  console.log('✅ Signature régénérée\n');
  return true;
}

function initializeSignature(status = 'TRANSITION') {
  console.log('\n🆕 Initialisation signature SILC\n');

  const signature = {
    status: status,
    silcVersion: "2.0",
    guardian: {
      name: "SILC Guardian",
      version: "1.0.0",
      mode: "legacy-audit-enabled"
    },
    scope: "SPOFE",
    validatedArtifacts: [
      "architecture/contracts",
      "architecture/conventions/NAMING_CONVENTION_SILC_V2.md",
      "silc-guardian/src"
    ],
    nonConformities: {
      legacyPresent: true,
      legacyAuditRequired: true,
      blockingViolations: false
    },
    commit: getCommitHash(),
    generatedAt: getCurrentTimestamp(),
    signedBy: "Architecture SILC",
    comment: "Entrée officielle en gouvernance SILC. Existant reconnu comme legacy sous audit. SILC Guardian v1.0.0 activé et opposable."
  };

  writeCompliance(signature);
  console.log(`✅ Signature initialisée avec status: ${status}\n`);
  return true;
}

// CLI
const command = process.argv[2];

if (!command || command === '--help' || command === '-h') {
  console.log(`
🛡️  SILC Compliance Signature Manager

Commandes:
  verify      Vérifier la signature SILC
  regenerate  Régénérer la signature (commit + timestamp)
  status N    Changer le status et régénérer
  init        Initialiser une nouvelle signature
  help        Afficher l'aide

Examples:
  node silc-compliance.js verify
  node silc-compliance.js regenerate
  node silc-compliance.js status HYBRID
  node silc-compliance.js init
  `);
  process.exit(0);
}

switch (command) {
  case 'verify':
    const valid = verifySignature();
    process.exit(valid ? 0 : 1);
    break;

  case 'regenerate':
    regenerateSignature();
    process.exit(0);
    break;

  case 'status':
    const newStatus = process.argv[3];
    if (!newStatus) {
      console.log('❌ Status requis: transition, hybrid, compliant, certified');
      process.exit(1);
    }
    regenerateSignature(newStatus.toUpperCase());
    process.exit(0);
    break;

  case 'init':
    initializeSignature();
    process.exit(0);
    break;

  default:
    console.log(`❌ Commande inconnue: ${command}`);
    process.exit(1);
}
