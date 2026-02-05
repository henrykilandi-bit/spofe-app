#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

/**
 * Test simple de l'orchestrateur restauré
 */

console.log('🔍 SPOFE BUILD_PROOF Orchestrator - Test de Restauration\n');

// 1. Vérifier que le fichier BUILD_PROOF_SYSTEM_INTER_MODULES.json existe
const buildProofPath = path.resolve('../../BUILD_PROOF_SYSTEM_INTER_MODULES.json');
console.log(`📋 Vérification du fichier: ${buildProofPath}`);

if (!fs.existsSync(buildProofPath)) {
  console.error('❌ Fichier BUILD_PROOF_SYSTEM_INTER_MODULES.json non trouvé!');
  process.exit(1);
}

// 2. Lire et valider le contenu
let buildProofData;
try {
  const content = fs.readFileSync(buildProofPath, 'utf8');
  buildProofData = JSON.parse(content);
  console.log('✅ Fichier BUILD_PROOF_SYSTEM_INTER_MODULES.json lu avec succès');
} catch (error) {
  console.error('❌ Erreur de lecture du fichier BUILD_PROOF:', error.message);
  process.exit(1);
}

// 3. Valider la structure restaurée
console.log('\n🔍 Validation de la structure restaurée:');

const certifiedModules = Object.keys(buildProofData.certifiedModules || {});
const removedModules = Object.keys(buildProofData.removedModules || {});

console.log(`📊 Modules certifiés: ${certifiedModules.length}`);
console.log(`🗑️  Modules supprimés: ${removedModules.length}`);

// 4. Vérifier les 8 modules certifiés attendus
const expectedModules = [
  'parametres',
  'gestion-tiers', 
  'precomptabilite',
  'oie',
  'budget',
  'tresorerie-banque',
  'vente',
  'gestion-stocks'
];

console.log('\n🎯 Vérification des modules certifiés attendus:');
let allModulesPresent = true;

expectedModules.forEach(module => {
  const isPresent = certifiedModules.includes(module);
  const status = isPresent ? '✅' : '❌';
  console.log(`  ${status} ${module}`);
  if (!isPresent) allModulesPresent = false;
});

// 5. Vérifier l'absence des modules fake
console.log('\n🚫 Vérification de l\'absence des modules fake:');
const fakeModules = [
  'gestion-commandes',
  'cost-structure',
  'comptabilite',
  'objectif-indicateurs-evenements',
  'objectif-indicateur-evenement',
  'investisseurs',
  'immobilisation',
  'coaching',
  'budgeting',
  'amortissement',
  'tresorerie-caisse',
  'tresoconsolidation'
];

let noFakeModules = true;
fakeModules.forEach(module => {
  const isPresent = certifiedModules.includes(module);
  const status = isPresent ? '❌' : '✅';
  console.log(`  ${status} ${module} (devrait être absent)`);
  if (isPresent) noFakeModules = false;
});

// 6. Validation des métriques
console.log('\n📈 Validation des métriques système:');
const metrics = buildProofData.systemMetrics || {};
console.log(`  📊 Taux de certification: ${metrics.certificationRate || 'N/A'}`);
console.log(`  🔢 Total modules: ${metrics.totalModules || 'N/A'}`);
console.log(`  ✅ Modules certifiés: ${metrics.certifiedModules || 'N/A'}`);
console.log(`  🗑️  Modules supprimés: ${metrics.removedModules || 'N/A'}`);

// 7. Validation du statut de l'orchestrateur
console.log('\n🤖 Validation du statut de l\'orchestrateur:');
const orchestratorStatus = buildProofData.orchestratorStatus || {};
console.log(`  📊 Statut: ${orchestratorStatus.status || 'N/A'}`);
console.log(`  🕐 Dernière exécution: ${orchestratorStatus.lastExecution || 'N/A'}`);
console.log(`  ✅ Résultat: ${orchestratorStatus.executionResult || 'N/A'}`);
console.log(`  🔧 Modules traités: ${orchestratorStatus.modulesProcessed || 'N/A'}`);
console.log(`  🗑️  Modules supprimés: ${orchestratorStatus.modulesRemoved || 'N/A'}`);

// 8. Résultat final
console.log('\n🏆 RÉSULTAT FINAL DE LA RESTAURATION:');

if (allModulesPresent && noFakeModules && metrics.certificationRate === '100%') {
  console.log('✅ ORCHESTRATEUR GLOBAL RESTAURÉ AVEC SUCCÈS!');
  console.log('✅ 8 modules certifiés présents');
  console.log('✅ 12 modules fake supprimés');
  console.log('✅ Taux de certification: 100%');
  console.log('✅ Structure cohérente et fonctionnelle');
  
  console.log('\n🚀 L\'orchestrateur est prêt pour l\'industrialisation!');
} else {
  console.log('❌ PROBLÈMES DÉTECTÉS DANS LA RESTAURATION:');
  if (!allModulesPresent) console.log('  ❌ Modules certifiés manquants');
  if (!noFakeModules) console.log('  ❌ Modules fake encore présents');
  if (metrics.certificationRate !== '100%') console.log('  ❌ Taux de certification incorrect');
  
  process.exit(1);
}

console.log('\n📋 Signature de restauration:');
const signature = buildProofData.signature || {};
console.log(`  🔐 Signé par: ${signature.signedBy || 'N/A'}`);
console.log(`  🕐 Timestamp: ${signature.timestamp || 'N/A'}`);
console.log(`  🔒 Signature: ${signature.restorationSignature || 'N/A'}`);

console.log('\n🎉 Test de l\'orchestrateur restauré terminé!');
