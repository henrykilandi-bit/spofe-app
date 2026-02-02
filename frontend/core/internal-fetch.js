/**
 * Update FCE Client to use internal fetch
 * 
 * Mise à jour nécessaire pour que FCE utilise fetch interne
 * au lieu de window.fetch (qui est maintenant gardé)
 */

// Dans readModelClient.js et commandClient.js, remplacer:
// const response = await fetch(url, fetchOptions);
// Par:
// const response = await INTERNAL_FETCH(url, fetchOptions);

import { getInternalFetch } from './fetch-guard.js';

export const INTERNAL_FETCH = getInternalFetch();
