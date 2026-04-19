import { StatesCatalog } from '../types/StatesCatalog';
import { GuardianViolation } from '../../shared/errors';

export function invariantStatesNormed(
  catalog: StatesCatalog
): void {
  const genericCodes = ['DRAFT', 'VALIDATED', 'CLOSED', 'LOCKED'];

  for (const ds of catalog.documentStates) {
    if (!genericCodes.includes(ds.mappedGenericState)) {
      throw new GuardianViolation(
        `G-P04: L'état document ${ds.code} mappe vers un état générique invalide: ${ds.mappedGenericState}`
      );
    }
  }

  for (const ps of catalog.periodStates) {
    if (!['OPEN', 'CLOSED', 'LOCKED'].includes(ps.code)) {
      throw new GuardianViolation(
        `G-P05: État de période invalide: ${ps.code}`
      );
    }
  }
}
