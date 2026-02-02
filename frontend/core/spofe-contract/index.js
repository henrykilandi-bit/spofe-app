/**
 * Frontend Contract Enforcer (FCE)
 * 
 * Point d'entrée unique pour toutes les communications frontend ↔ backend SPOFE
 * 
 * ⚠️ PRÉ-CONDITION BLOQUANTE
 * Le bootstrap() DOIT être appelé en premier, avant ANY utilisation du FCE.
 * 
 * Garanties:
 * - Aucun fetch() direct possible
 * - Commands validées contre le contrat
 * - Read-models validées contre le contrat
 * - Contrat versionné et immuable
 * - ⚠️ Contrat REQUIS pour fonctionner (pas de fallback)
 * 
 * Usage:
 * 
 *   import { bootstrap, readModel, sendCommand } from '@/core/spofe-contract';
 *   
 *   // ÉTAPE 1: Bootstrap AVANT toute utilisation
 *   await bootstrap();
 *   
 *   // ÉTAPE 2: Utilisation sûre
 *   const aggregates = await readModel('/aggregates/active');
 *   await sendCommand('CloseAggregate', { aggregateId: '...' });
 */

import { loadContractOrFail, isContractBootstrapped } from './contractLoader.js';

/**
 * ⛔ Marque si le contrat a été bootstrappé avec succès
 * @private
 */
let contractReady = false;

/**
 * ⛔ ÉTAPE 1: Bootstrap du contrat
 * 
 * DOIT être appelé en premier dans main.js, avant toute autre opération.
 * 
 * @returns {Promise<void>}
 * @throws {Error} Si le chargement du contrat échoue (BLOQUANT)
 * 
 * @example
 *   try {
 *     await bootstrap();
 *     // Maintenant le frontend est gouverné
 *   } catch (err) {
 *     renderFatalError(err);
 *   }
 */
export async function bootstrap() {
  try {
    await loadContractOrFail();
    contractReady = true;
  } catch (error) {
    contractReady = false;
    throw error;
  }
}

/**
 * ⛔ Vérification interne: s'assurer que le contrat est prêt
 * @private
 */
function ensureBootstrapped() {
  if (!contractReady || !isContractBootstrapped()) {
    throw new Error(
      'SPOFE Contract not initialized. Bootstrap is mandatory. ' +
      'Call bootstrap() before using readModel() or sendCommand().'
    );
  }
}

export { sendCommand, executeCommand } from './commandClient.js';
export { readModel, fetchReadModel } from './readModelClient.js';
export { ContractViolation, VIOLATIONS } from './violations.js';
export { loadContractOrFail, loadContract, getLoadedContract, resetContract, isContractBootstrapped } from './contractLoader.js';
export { ContractEnforcer } from './enforcer.js';

/**
 * Initialisation recommandée (au startup de l'app)
 * 
 * main.js:
 * 
 *   import { loadContract } from '@/core/spofe-contract';
 *   
 *   // Charger et valider le contrat avant le rendu
 *   await loadContract();
 *   
 *   // Rendu maintenant sûr
 *   ReactDOM.render(<App />, document.getElementById('root'));
 */
