/**
 * Bootstrap SPOFE - Point d'entrée unique du frontend
 * 
 * ⛔ ARCHITECTURE CRITIQUE
 * 
 * Ce fichier doit OBLIGATOIREMENT être appelé en premier dans main.jsx
 * AVANT la création de l'app React
 * 
 * La séquence OBLIGATOIRE est:
 * 
 *   1. import fetch-guard (intercepte window.fetch)
 *   2. call bootstrapSPOFE() (charge le contrat AVANT tout rendu)
 *   3. initialiser React SEULEMENT si bootstrap réussit
 * 
 * Si l'une de ces étapes échoue → application bloquée, page d'erreur fatale.
 */

import '@/core/fetch-guard.js';
import { loadContractOrFail, isContractBootstrapped } from '@/core/spofe-contract/contractLoader.js';
import { setAuthToken, getAuthToken, isAuthenticated } from '@/core/auth.js';

/**
 * ⛔ PRÉ-CONDITION ABSOLUE: Contrat chargé et valide
 * 
 * Initialise SPOFE et le frontend
 * À appeler EN PREMIER dans main.jsx, AVANT ReactDOM.createRoot()
 * 
 * @param {Object} options - Options d'initialisation
 * @param {Function} options.onReady - Callback après bootstrap réussi
 * @param {Function} options.onError - Callback en cas d'erreur (optionnel)
 * @returns {Promise<boolean>} true si succès, sinon lance une erreur bloquante
 * @throws {Error} Si le contrat ne peut pas être chargé (APPLICATION ARRÊTÉE)
 * 
 * @example
 *   // main.jsx
 *   try {
 *     await bootstrapSPOFE();
 *     // Uniquement à partir d'ici, l'app est sûre
 *     ReactDOM.createRoot(...).render(<App />);
 *   } catch (err) {
 *     renderFatalError(err);
 *   }
 */
export async function bootstrapSPOFE(options = {}) {
  const startTime = performance.now();

  console.log('[SPOFE Bootstrap] Starting (BLOCKING)...');

  try {
    // ═══════════════════════════════════════════════════════════
    // 1️⃣ PRÉ-CONDITION ABSOLUE: Charger le contrat
    // ═══════════════════════════════════════════════════════════
    // ⛔ Si le contrat ne peut pas être chargé, on s'arrête ICI
    // Aucun fallback, aucune valeur par défaut

    console.log('[SPOFE] Loading contract (BLOCKING)...');
    await loadContractOrFail();
    
    if (!isContractBootstrapped()) {
      throw new Error('Contract bootstrap verification failed');
    }
    
    console.log('[SPOFE] ✓ Contract loaded and verified');

    // ═══════════════════════════════════════════════════════════
    // 2️⃣ Vérifier l'authentification
    // ═══════════════════════════════════════════════════════════

    console.log('[SPOFE] Checking authentication...');

    // Si non authentifié, rediriger vers login
    if (!isAuthenticated()) {
      // Essayer de charger le token depuis sessionStorage
      try {
        const token = sessionStorage.getItem('__spofe_auth_token');
        if (!token) {
          throw new Error('Not authenticated');
        }
        // Token trouvé, le FCE l'utilisera automatiquement
      } catch (error) {
        console.log('[SPOFE] Not authenticated, redirecting to login...');
        window.location.href = '/login';
        return false; // Stop
      }
    }

    console.log('[SPOFE] ✓ Authentication OK');

    // ═══════════════════════════════════════════════════════════
    // 3️⃣ Appeler le callback d'initialisation utilisateur
    // ═══════════════════════════════════════════════════════════

    if (options.onReady) {
      console.log('[SPOFE] Running user init callback...');
      await options.onReady();
    }

    // ═══════════════════════════════════════════════════════════
    // 4️⃣ Log du succès
    // ═══════════════════════════════════════════════════════════

    const duration = (performance.now() - startTime).toFixed(0);
    console.log(`[SPOFE] ✓ Bootstrap complete (${duration}ms)`);
    console.log('[SPOFE] ✓✓✓ Frontend is now GOVERNED by SPOFE ✓✓✓');
    console.log('[SPOFE] All HTTP requests are validated against contract');

    return true;

  } catch (error) {
    console.error('[SPOFE Bootstrap] ⛔ CRITICAL FAILURE', error);
    console.error('[SPOFE] ⛔⛔⛔ Frontend CANNOT run without a valid contract ⛔⛔⛔');
    console.error('[SPOFE] Error details:', {
      message: error.message,
      cause: error.cause,
      stack: error.stack
    });

    // Afficher une page d'erreur
    if (options.onError) {
      options.onError(error);
    } else {
      // Fallback: page d'erreur native (compatible vanilla + React + Vue)
      renderFatalError(error);
    }

    // ⛔ Re-throw pour être sûr que l'app s'arrête
    throw error;
  }
}

/**
 * ⛔ Affiche une page d'erreur fatale
 * 
 * Utilisée si le bootstrap échoue
 * Affiche un message clair et redirection impossible
 * 
 * @param {Error} error - L'erreur qui a causé l'arrêt
 */
export function renderFatalError(error) {
  document.body.innerHTML = `
    <div style="
      padding: 40px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
      background: #1a1a1a;
      color: #fff;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
    ">
      <div style="max-width: 600px; text-align: center;">
        <h1 style="font-size: 32px; margin: 0 0 20px 0; color: #ff6b6b;">
          ⛔ Application indisponible
        </h1>
        
        <p style="font-size: 16px; margin: 20px 0; line-height: 1.6; color: #ccc;">
          Le contrat frontend-backend n'a pas pu être chargé.<br>
          <strong>L'application ne peut pas démarrer sans un contrat valide.</strong>
        </p>
        
        <div style="
          background: #2a2a2a;
          border-left: 4px solid #ff6b6b;
          padding: 15px;
          margin: 20px 0;
          text-align: left;
          font-family: 'Courier New', monospace;
          font-size: 13px;
          color: #ff8c8c;
          overflow-x: auto;
        ">
          <strong>Erreur:</strong> ${error?.message || 'Unknown error'}
        </div>
        
        <p style="font-size: 14px; margin: 20px 0; color: #999;">
          Veuillez:<br>
          • Vérifier votre connexion réseau<br>
          • Attendre que le serveur backend soit disponible<br>
          • Contacter votre administrateur si le problème persiste
        </p>
        
        <button onclick="location.reload()" style="
          background: #ff6b6b;
          color: white;
          border: none;
          padding: 12px 30px;
          font-size: 16px;
          border-radius: 4px;
          cursor: pointer;
          margin-top: 20px;
        ">
          Réessayer
        </button>
      </div>
    </div>
  `;
}
          <h1>❌ SPOFE Bootstrap Failed</h1>
          <p>${error.message}</p>
          <p>Please refresh the page or contact support.</p>
        </div>
      `;
    }

    throw error;
  }
}

/**
 * === UTILISATION ===
 * 
 * main.js:
 * 
 *   import { bootstrapSPOFE } from '@/core/bootstrap';
 *   import { initRouter } from '@/router';
 *   import { initModules } from '@/modules/init';
 *
 *   async function main() {
 *     await bootstrapSPOFE({
 *       onReady: async () => {
 *         initRouter();
 *         await initModules();
 *       },
 *       onError: (error) => {
 *         console.error('Failed to initialize:', error);
 *       }
 *     });
 *   }
 *
 *   main().catch(console.error);
 */
