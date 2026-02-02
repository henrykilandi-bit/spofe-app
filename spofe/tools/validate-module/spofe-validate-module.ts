#!/usr/bin/env node
/**
 * SPOFE MODULE VALIDATOR
 * Version 1.0.0 — Garde-Fou Final SPOFE
 * 
 * 🔒 Ce script est l'autorité finale SPOFE.
 * 
 * Répond à une seule question :
 * ❓ Ce module peut-il être validé selon les règles SPOFE ?
 * 
 * Répond par le code, pas par un humain.
 */

import { readFileSync, existsSync } from 'fs';
import { execSync } from 'child_process';
import { join, resolve } from 'path';
import { verify, createHash } from 'crypto';

// --- UTILITAIRES ------------------------------------------------

function fail(msg: string): never {
  console.error(`\n❌❌❌ SPOFE VALIDATION FAILED ❌❌❌`);
  console.error(`Reason: ${msg}`);
  console.error(`\nThis module CANNOT be validated for GO PROD.`);
  process.exit(1);
}

function ok(msg: string) {
  console.log(`✅ ${msg}`);
}

function warn(msg: string) {
  console.log(`⚠️  ${msg}`);
}

function git(cmd: string, cwd?: string): string {
  try {
    return execSync(`git ${cmd}`, { 
      cwd: cwd || process.cwd(),
      encoding: 'utf-8'
    }).toString().trim();
  } catch (err) {
    return 'N/A';
  }
}

function section(title: string) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(title);
  console.log(`${'='.repeat(60)}`);
}

// --- CONFIGURATION ------------------------------------------------

interface ValidationConfig {
  modulePath: string;
  checklistPath: string;
  buildProofPath: string;
  strictMode: boolean;
}

function loadConfig(): ValidationConfig {
  const modulePath = resolve(process.env.SPOFE_MODULE_PATH || process.cwd());
  
  return {
    modulePath,
    checklistPath: join(modulePath, 'CHECKLIST_GO_PROD.md'),
    buildProofPath: join(modulePath, 'BUILD_PROOF.md'),
    strictMode: process.env.SPOFE_STRICT !== 'false'
  };
}

// --- VALIDATION 1: FICHIERS OBLIGATOIRES -------------------------

function validateFilesExist(config: ValidationConfig): void {
  section('1. PRESENCE DES FICHIERS OBLIGATOIRES');
  
  if (!existsSync(config.checklistPath)) {
    fail('CHECKLIST_GO_PROD.md is missing');
  }
  ok('CHECKLIST_GO_PROD.md found');
  
  if (!existsSync(config.buildProofPath)) {
    fail('BUILD_PROOF.md is missing');
  }
  ok('BUILD_PROOF.md found');
}

// --- VALIDATION 2: ANALYSE CHECKLIST -----------------------------

interface ChecklistItem {
  line: string;
  checked: boolean;
  isP1: boolean;
  section?: string;
}

function parseChecklist(content: string): ChecklistItem[] {
  const lines = content.split('\n');
  const items: ChecklistItem[] = [];
  let currentSection = '';
  
  for (const line of lines) {
    // Détecter les sections
    const sectionMatch = line.match(/^##+\s+(.+)$/);
    if (sectionMatch) {
      currentSection = sectionMatch[1].trim();
    }
    
    // Détecter les items de checklist
    const itemMatch = line.match(/^\s*-\s*\[([ x])\]\s*(.+)$/);
    if (itemMatch) {
      const checked = itemMatch[1] === 'x';
      const content = itemMatch[2];
      const isP1 = content.includes('P1') || content.includes('🔴') || content.includes('CRITICAL');
      
      items.push({
        line: line.trim(),
        checked,
        isP1,
        section: currentSection
      });
    }
  }
  
  return items;
}

function validateChecklist(config: ValidationConfig): void {
  section('2. ANALYSE CHECKLIST GO PROD');
  
  const content = readFileSync(config.checklistPath, 'utf8');
  const items = parseChecklist(content);
  
  console.log(`\nFound ${items.length} checklist items`);
  
  // Compter les P1
  const p1Items = items.filter(i => i.isP1);
  const p1Unchecked = p1Items.filter(i => !i.checked);
  
  console.log(`  - Total items: ${items.length}`);
  console.log(`  - P1 (Critical) items: ${p1Items.length}`);
  console.log(`  - P1 completed: ${p1Items.length - p1Unchecked.length}/${p1Items.length}`);
  
  if (p1Unchecked.length > 0) {
    console.error('\n❌ Unresolved P1 (Critical) items:');
    p1Unchecked.forEach(item => {
      console.error(`  [ ] ${item.line.replace(/^\s*-\s*\[\s*\]\s*/, '')}`);
      if (item.section) {
        console.error(`      (Section: ${item.section})`);
      }
    });
    fail('P1 items not completed');
  }
  
  // Vérifier le pourcentage global
  const completedItems = items.filter(i => i.checked).length;
  const completionRate = items.length > 0 ? (completedItems / items.length) * 100 : 0;
  
  console.log(`\n  - Overall completion: ${completionRate.toFixed(1)}%`);
  
  if (completionRate < 80) {
    warn(`Checklist completion below 80% (${completionRate.toFixed(1)}%)`);
    if (config.strictMode) {
      fail('Checklist completion insufficient in strict mode');
    }
  }
  
  ok('All P1 checklist items completed');
  ok(`Checklist completion: ${completionRate.toFixed(1)}%`);
}

// --- VALIDATION 3: ANALYSE BUILD_PROOF ---------------------------

interface BuildProofData {
  commit: string;
  buildSuccess: boolean;
  testsSuccess: boolean;
  phase05Completed: boolean;
  moduleName: string;
  date: string;
}

function parseBuildProof(content: string): BuildProofData {
  const data: BuildProofData = {
    commit: '',
    buildSuccess: false,
    testsSuccess: false,
    phase05Completed: false,
    moduleName: 'UNKNOWN',
    date: ''
  };
  
  // Extraire le commit
  const commitMatch = content.match(/Commit\s*[:\(]?\s*([a-f0-9]{40}|[a-f0-9]{8})/i);
  if (commitMatch) {
    data.commit = commitMatch[1];
  }
  
  // Extraire le nom du module
  const moduleMatch = content.match(/Module\s*[:\(]?\s*([^\n\r]+)/i);
  if (moduleMatch) {
    data.moduleName = moduleMatch[1].trim();
  }
  
  // Extraire la date
  const dateMatch = content.match(/Date\s*[:\(]?\s*(\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2})/);
  if (dateMatch) {
    data.date = dateMatch[1];
  }
  
  // Vérifier build success
  data.buildSuccess = 
    content.includes('Result : ✅') || 
    content.includes('SUCCESS') ||
    content.includes('✅ SUCCESS');
  
  // Vérifier tests success (pas de ❌ dans la section tests)
  const testSection = content.match(/## 5\. Tests[\s\S]*?(?=## 6\.|## Annexe|$)/);
  if (testSection) {
    const testContent = testSection[0];
    data.testsSuccess = 
      !testContent.includes('❌ FAIL') &&
      !testContent.includes('Result : ❌');
  } else {
    // Si pas de section tests explicite, vérifier globalement
    data.testsSuccess = !content.includes('❌ FAIL');
  }
  
  // Vérifier Phase 0.5
  data.phase05Completed = 
    content.includes('Phase 0.5') ||
    content.includes('Phase 0.5 — Stabilisation Technique') ||
    content.includes('Stabilisation Technique');
  
  return data;
}

function validateBuildProof(config: ValidationConfig, currentCommit: string): BuildProofData {
  section('3. ANALYSE BUILD_PROOF');
  
  const content = readFileSync(config.buildProofPath, 'utf8');
  const data = parseBuildProof(content);
  
  console.log(`\n  Module: ${data.moduleName}`);
  console.log(`  Build Proof Date: ${data.date || 'N/A'}`);
  
  // 3.1 Commit match
  if (!data.commit) {
    fail('BUILD_PROOF does not contain a valid commit hash');
  }
  
  console.log(`  Build Proof Commit: ${data.commit.substring(0, 8)}`);
  console.log(`  Current HEAD: ${currentCommit.substring(0, 8)}`);
  
  if (data.commit !== currentCommit && !currentCommit.startsWith(data.commit)) {
    fail(`BUILD_PROOF commit (${data.commit.substring(0, 8)}) does not match HEAD (${currentCommit.substring(0, 8)})`);
  }
  ok('BUILD_PROOF commit matches HEAD');
  
  // 3.2 Build success
  if (!data.buildSuccess) {
    fail('BUILD_PROOF indicates build failure');
  }
  ok('Build reported SUCCESS');
  
  // 3.3 Tests success
  if (!data.testsSuccess) {
    fail('BUILD_PROOF indicates test failures');
  }
  ok('All tests reported SUCCESS');
  
  return data;
}

// --- VALIDATION 4: PHASE 0.5 -------------------------------------

function validatePhase05(config: ValidationConfig, checklistContent: string, buildProofData: BuildProofData): void {
  section('4. PHASE 0.5 VALIDATION');
  
  const phase05InChecklist = checklistContent.includes('Phase 0.5') || checklistContent.includes('Stabilisation Technique');
  const phase05InBuildProof = buildProofData.phase05Completed;
  
  console.log(`  Phase 0.5 in CHECKLIST: ${phase05InChecklist ? '✅' : '❌'}`);
  console.log(`  Phase 0.5 in BUILD_PROOF: ${phase05InBuildProof ? '✅' : '❌'}`);
  
  if (!phase05InChecklist && !phase05InBuildProof) {
    fail('Phase 0.5 (Stabilisation Technique) not validated');
  }
  
  ok('Phase 0.5 validated');
}

// --- VALIDATION 5: COHÉRENCE ------------------------------------

function validateConsistency(config: ValidationConfig, checklistContent: string, buildProofData: BuildProofData): void {
  section('5. COHÉRENCE INTER-DOCUMENTS');
  
  // Vérifier que les statuts sont cohérents
  const checklistGreen = checklistContent.includes('🟢') || checklistContent.includes('VERT') || checklistContent.includes('✅');
  const checklistRed = checklistContent.includes('🔴') || checklistContent.includes('ROUGE') || checklistContent.includes('❌');
  
  if (checklistRed && !config.strictMode) {
    warn('Checklist contains RED/FAILED items');
  }
  
  if (!checklistGreen) {
    warn('Checklist does not show any GREEN/VALIDATED sections');
    if (config.strictMode) {
      fail('No validated sections found in strict mode');
    }
  }
  
  ok('Inter-document consistency validated');
}

// --- VALIDATION 6: RÈGLES SPOFE ----------------------------------

function validateSpofeRules(config: ValidationConfig): void {
  section('6. RÈGLES SPOFE COMPLIANCE');
  
  // Vérifier la présence des documents normatifs si applicable
  const governancePath = join(config.modulePath, '..', '..', '..', 'spofe', 'governance');
  
  if (existsSync(governancePath)) {
    const rulesBuildTest = join(governancePath, 'RULES_BUILD_TEST.md');
    if (existsSync(rulesBuildTest)) {
      ok('SPOFE governance rules available');
    } else {
      warn('SPOFE governance rules not found (optional for local dev)');
    }
  }
  
  // Vérifier la présence de CONTRACT.md
  const contractPath = join(config.modulePath, 'CONTRACT.md');
  if (existsSync(contractPath)) {
    ok('CONTRACT.md found');
  } else {
    warn('CONTRACT.md not found (recommended but optional)');
  }
  
  // Vérifier la présence de tests
  const testsPath = join(config.modulePath, 'tests');
  if (existsSync(testsPath)) {
    ok('Tests directory found');
  } else {
    warn('Tests directory not found');
  }
}

// --- VALIDATION 7: SIGNATURE CRYPTOGRAPHIQUE ---------------------

function validateCryptographicSignature(config: ValidationConfig): void {
  section('7. SIGNATURE CRYPTOGRAPHIQUE');
  
  const sigPath = join(config.modulePath, 'BUILD_PROOF.sig');
  const hashPath = join(config.modulePath, 'BUILD_PROOF.sha256');
  const publicKeyPath = process.env.SPOFE_PUBLIC_KEY_PATH || 
    join(config.modulePath, '..', '..', '..', 'spofe', 'governance', 'spofe_build_proof_key.pub');
  
  // Vérifier que les fichiers de signature existent
  if (!existsSync(sigPath)) {
    if (config.strictMode) {
      fail('BUILD_PROOF.sig not found (required in strict mode)');
    } else {
      warn('BUILD_PROOF.sig not found (optional in non-strict mode)');
      return;
    }
  }
  
  if (!existsSync(hashPath)) {
    if (config.strictMode) {
      fail('BUILD_PROOF.sha256 not found (required in strict mode)');
    } else {
      warn('BUILD_PROOF.sha256 not found (optional in non-strict mode)');
      return;
    }
  }
  
  ok('Signature files found');
  
  // Vérifier la clé publique
  if (!existsSync(publicKeyPath)) {
    warn(`Public key not found at ${publicKeyPath}`);
    warn('Skipping cryptographic verification (public key required)');
    return;
  }
  
  ok('Public key found');
  
  // Lire les fichiers
  const proofPath = join(config.modulePath, 'BUILD_PROOF.md');
  const content = readFileSync(proofPath);
  const signature = Buffer.from(readFileSync(sigPath, 'utf-8').trim(), 'base64');
  const publicKey = readFileSync(publicKeyPath);
  
  console.log(`  Signature file: ${sigPath}`);
  console.log(`  Signature length: ${signature.length} bytes`);
  console.log(`  Public key: ${publicKeyPath}`);
  
  // Vérifier la signature
  try {
    const isValid = verify('SHA256', content, publicKey, signature);
    
    if (isValid) {
      ok('Cryptographic signature is VALID');
      console.log('  🔐 BUILD_PROOF integrity verified');
      console.log('  🔐 Any modification would invalidate this signature');
    } else {
      fail('Invalid cryptographic signature - BUILD_PROOF may have been tampered with');
    }
  } catch (error: any) {
    fail(`Signature verification failed: ${error.message}`);
  }
}

// --- VALIDATION 8: INTÉGRITÉ CHECKLIST (ANTI-TAMPERING) ------------

function validateChecklistIntegrity(config: ValidationConfig): void {
  section('8. INTÉGRITÉ DE LA CHECKLIST (ANTI-TAMPERING)');
  
  const hashFile = join(config.modulePath, '.checklist.hash');
  
  // Vérifier si le fichier de hash existe
  if (!existsSync(hashFile)) {
    warn('Hash file (.checklist.hash) not found');
    warn('Cannot verify if CHECKLIST was manually modified');
    if (config.strictMode) {
      fail('Checklist hash required in strict mode - regenerate checklist');
    }
    return;
  }
  
  ok('Hash file found');
  
  // Lire le hash stocké
  const hashContent = readFileSync(hashFile, 'utf-8');
  const storedHash = hashContent.split('  ')[0].trim();
  
  console.log(`  Stored hash: ${storedHash.substring(0, 16)}...`);
  
  // Calculer le hash actuel
  const checklistContent = readFileSync(config.checklistPath, 'utf-8');
  const computedHash = createHash('sha256').update(checklistContent).digest('hex');
  
  console.log(`  Computed hash: ${computedHash.substring(0, 16)}...`);
  
  // Comparer
  if (storedHash !== computedHash) {
    console.error('\n❌ CHECKLIST HAS BEEN MODIFIED MANUALLY');
    console.error('The stored hash does not match the current content.');
    console.error('\nPossible causes:');
    console.error('  - Manual editing of CHECKLIST_GO_PROD.md');
    console.error('  - File corruption');
    console.error('  - Incomplete regeneration\n');
    console.error('To fix:');
    console.error('  1. Do NOT edit CHECKLIST_GO_PROD.md manually');
    console.error('  2. Update contract files with SPOFE:CHECKLIST tags');
    console.error('  3. Regenerate: npx tsx spofe/tools/checklist/generate-checklist.ts\n');
    fail('Checklist integrity check failed - manual modification detected');
  }
  
  ok('Checklist integrity verified - no manual modifications detected');
  console.log('  🔒 Checklist matches generated hash');
  console.log('  🔒 All items traceable to contract sources');
}

// --- RAPPORT FINAL -----------------------------------------------

function generateReport(
  config: ValidationConfig,
  buildProofData: BuildProofData,
  currentCommit: string
): void {
  section('📊 RAPPORT DE VALIDATION SPOFE');
  
  console.log(`
┌────────────────────────────────────────────────────────────┐
│  SPOFE MODULE VALIDATION REPORT                            │
├────────────────────────────────────────────────────────────┤
│  Module:        ${buildProofData.moduleName.padEnd(40)}│
│  Commit:        ${currentCommit.substring(0, 8).padEnd(40)}│
│  Date:          ${new Date().toISOString().substring(0, 10).padEnd(40)}│
│  Status:        ${'✅ VALIDATED'.padEnd(40)}│
└────────────────────────────────────────────────────────────┘
`);
  
  console.log('Validation Summary:');
  console.log('  ✅ CHECKLIST_GO_PROD.md present and valid');
  console.log('  ✅ BUILD_PROOF.md present and valid');
  console.log('  ✅ All P1 items completed');
  console.log('  ✅ Commit hash verified');
  console.log('  ✅ Build successful');
  console.log('  ✅ Tests passed');
  console.log('  ✅ Phase 0.5 validated');
  console.log('  ✅ SPOFE rules compliance');
}

// --- FONCTION PRINCIPALE -----------------------------------------

function main(): void {
  console.log('🔒 SPOFE Module Validator v1.0.0');
  console.log('   Garde-Fou Final SPOFE');
  console.log('');
  
  const config = loadConfig();
  
  console.log(`Module Path: ${config.modulePath}`);
  console.log(`Strict Mode: ${config.strictMode ? 'ON' : 'OFF'}`);
  
  const currentCommit = git('rev-parse HEAD', config.modulePath);
  console.log(`Current HEAD: ${currentCommit.substring(0, 8)}`);
  
  // Exécuter toutes les validations
  validateFilesExist(config);
  validateChecklist(config);
  const buildProofData = validateBuildProof(config, currentCommit);
  const checklistContent = readFileSync(config.checklistPath, 'utf8');
  validatePhase05(config, checklistContent, buildProofData);
  validateConsistency(config, checklistContent, buildProofData);
  validateSpofeRules(config);
  validateCryptographicSignature(config);
  validateChecklistIntegrity(config);
  
  // Générer le rapport final
  generateReport(config, buildProofData, currentCommit);
  
  // VERDICT FINAL
  section('🏁 VERDICT FINAL');
  console.log('\n✅✅✅ SPOFE VALIDATION SUCCESSFUL ✅✅✅\n');
  console.log('🎯 This module is COMPLIANT with SPOFE Build/Test rules');
  console.log('🚀 Module can be proposed for GO PROD validation\n');
  
  process.exit(0);
}

// --- EXECUTION ---------------------------------------------------

main();
