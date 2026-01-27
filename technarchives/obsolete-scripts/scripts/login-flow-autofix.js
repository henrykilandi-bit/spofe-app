# ===============================================
# 📦 SPOFE AUTO-FIX BUNDLE v2.1 (MODE SÉCURISÉ)
# ===============================================
# Dossier cible : /scripts à la racine de ton projet SPOFE
# Fonctionnement :
#  - En DEV → Génère rapport .md uniquement
#  - En PROD → Envoie rapport + email/Discord
# ===============================================

// ===============================================
// 🧠 FILE: scripts/login-flow-autofix.js
// ===============================================
const SPOFELoginDiagnostic = require('./login-flow-diagnostic');
const { autoFix } = require('./utils/fix-utils');
const SPOFENotifier = require('./utils/notifier');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

(async () => {
  console.log('\n🧩 SPOFE v2.1 — Auto-Diagnostic & Auto-Correction (Mode Sécurisé)');
  console.log('📅 Démarrage :', new Date().toLocaleString(), '\n');

  const diagnostic = new SPOFELoginDiagnostic();
  const notifier = new SPOFENotifier();

  // Étape 1️⃣ Diagnostic initial
  await diagnostic.runFullDiagnostic();
  const failedSteps = diagnostic.results.filter(r => r.status === '❌ FAIL');

  if (failedSteps.length === 0) {
    console.log('✅ Aucun problème détecté. Système 100% conforme.');
    process.exit(0);
  }

  console.log(`⚠️ ${failedSteps.length} anomalies détectées. Début des corrections...\n`);
  const fixes = [];

  // Étape 2️⃣ Corrections automatiques
  for (const step of failedSteps) {
    console.log(`🔍 Analyse: ${step.step}`);
    const fixResult = await autoFix(step);
    fixes.push(fixResult);
  }

  // Étape 3️⃣ Rapport Markdown
  if (!fs.existsSync('./scripts/reports')) fs.mkdirSync('./scripts/reports', { recursive: true });
  const reportFile = path.join('./scripts/reports', `autofix-report-${Date.now()}.md`);
  const content = [
    `# 🧠 SPOFE AUTO-FIX REPORT (MODE SÉCURISÉ)`,
    `📅 ${new Date().toLocaleString()}`,
    ``,
    `## 🔎 Résumé des corrections`,
    ...fixes.map(f =>
      `### ${f.step}\n- Statut: ${f.status}\n- Action: ${f.action}\n- Détail: ${f.details}\n`
    ),
    `---`,
    `_Généré automatiquement par SPOFE AutoFix v2.1 (Safe Mode)_`
  ].join('\n');

  fs.writeFileSync(reportFile, content);
  console.log(`\n📁 Rapport généré : ${reportFile}`);

  // Étape 4️⃣ Notification (prod seulement)
  if (process.env.NODE_ENV === 'production') {
    await notifier.sendAll(reportFile);
  } else {
    console.log('📘 Mode développement : aucune alerte e-mail envoyée.');
  }

  // Étape 5️⃣ Validation post-fix
  console.log('\n🔁 Validation post-correction...\n');
  await diagnostic.runFullDiagnostic();
})();