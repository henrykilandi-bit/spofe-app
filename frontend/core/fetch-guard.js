/**
 * Fetch Guard - Empêche tout fetch() sauvage
 * 
 * Une fois ce module chargé en premier:
 * - Tout fetch() direct lève une exception
 * - Seule la lib FCE peut utiliser fetch interne
 * 
 * Chargement (en PREMIER dans main.js):
 *   import '@/core/fetch-guard.js';
 */

// Sauvegarder la référence originale
const ORIGINAL_FETCH = window.fetch;

// Marquer la lib FCE comme autorisée
const AUTHORIZED_MODULES = new Set();

export function authorizeModule(moduleName) {
  AUTHORIZED_MODULES.add(moduleName);
}

/**
 * Remplacer fetch() global par un guard
 * Tout appel direct au fetch() global lève une exception
 */
window.fetch = function guardedFetch(...args) {
  // Stack trace pour identifier l'appelant
  const stack = new Error().stack;
  const caller = stack.split('\n')[2]; // Ligne d'appel

  // Exceptions - modules autorisés (FCE + tests)
  if (
    caller.includes('spofe-contract') ||
    caller.includes('__tests__') ||
    caller.includes('node_modules')
  ) {
    return ORIGINAL_FETCH.apply(this, args);
  }

  // Violation détectée
  console.error('❌ FETCH GUARD VIOLATION');
  console.error('Module:', caller);
  console.error('Caller:', args[0]);
  console.error('Solution: Use readModel() or sendCommand() from @/core/spofe-contract');
  console.error('');
  console.error('Stack:', stack);

  throw new Error(
    `Direct fetch() is FORBIDDEN. ` +
    `Use readModel() or sendCommand() from '@/core/spofe-contract' instead.\n\n` +
    `Called from: ${caller}\n` +
    `URL: ${args[0]}`
  );
};

/**
 * Expose la vraie fonction fetch pour la lib FCE interne
 * Utilisée UNIQUEMENT par commandClient.js et readModelClient.js
 */
export function getInternalFetch() {
  return ORIGINAL_FETCH;
}

// Log au chargement
console.log('[SPOFE] Fetch Guard activated - Direct fetch() is now forbidden');
