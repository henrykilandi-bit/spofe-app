/**
 * SPOFE Frontend API Layer Index
 * 
 * ✓ spofe-client.js - Contract-enforced API client
 * ✓ Remplace: services/, Axios, useApi hook
 * 
 * ⛔ Accès à sendCommand/readModel UNIQUEMENT via spofe-client
 * ⛔ ZÉRO Axios
 * ⛔ ZÉRO appels fetch() directs
 */

export { default as spofeClient } from './spofe-client.js';

/**
 * Qui peut importer quoi?
 * 
 * ✓ Pages/composants UI → spofeClient.read/execute
 * ✓ Hooks métier → spofeClient (avec état local)
 * ✓ useAuth → localStorage identité uniquement
 * ✓ useTheme → localStorage UI seulement
 * 
 * ✗ Jamais: Axios
 * ✗ Jamais: fetch() direct
 * ✗ Jamais: localStorage métier
 * ✗ Jamais: React Query business data
 * ✗ Jamais: services/ + api.config.js
 */
