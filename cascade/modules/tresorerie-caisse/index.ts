/**
 * SPOFE Module: Tresorerie-Caisse v1.0.0
 * Entry point pour module trésorerie caisse
 */

export { TresorerieCaisseDomain } from './domain';
export { TresorerieCaisseWrite } from './write';
export { TresorerieCaisseGuardian } from './guardian';

export const MODULE_INFO = {
  name: 'tresorerie-caisse',
  version: '1.0.0',
  type: 'Primary source (write)',
  governance: 'SPOFE P0',
  status: 'CERTIFIED'
} as const;