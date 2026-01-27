// ===============================================
// 🧠 FILE: scripts/utils/fix-utils.js
// ===============================================
const { checkEnvIntegrity, fixMissingEnv } = require('./env-utils');
const { checkDatabaseConnection, fixMissingUser } = require('./db-utils');
const { checkAPIHealth } = require('./api-utils');

async function autoFix(step) {
  let action = 'Aucune correction nécessaire';
  let status = '⚠️ Non corrigé';
  let details = '';

  try {
    if (step.step.includes('API Health')) {
      const ok = await checkAPIHealth();
      status = ok ? '✅ Réparé' : '❌ Non résolu';
      action = 'Vérification accessibilité API';
    } else if (step.step.includes('Database')) {
      const ok = await checkDatabaseConnection();
      status = ok ? '✅ Connexion restaurée' : '❌ MySQL indisponible';
      action = 'Connexion MySQL';
    } else if (step.step.includes('Credentials')) {
      const ok = await fixMissingUser('admin@spofe.sn');
      status = ok ? '✅ Utilisateur ajouté' : '⚠️ Aucun ajout effectué';
      action = 'Utilisateur test vérifié';
    } else if (step.step.includes('JWT')) {
      const ok = await fixMissingEnv('JWT_SECRET');
      status = ok ? '✅ JWT_SECRET ajouté' : '❌ Échec modification .env';
      action = 'Regénération du secret JWT';
    } else {
      details = step.message;
    }

    return { step: step.step, action, status, details };
  } catch (err) {
    return {
      step: step.step,
      action: 'Erreur durant la correction',
      status: '❌ FAIL',
      details: err.message
    };
  }
}

module.exports = { autoFix };
