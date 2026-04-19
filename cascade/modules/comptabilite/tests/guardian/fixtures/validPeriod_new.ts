/**
 * 🧰 Fixtures - Périodes Valides pour Tests Guardian
 */

import { AccountingPeriod } from '../../../src/guardian/types/AccountingPeriod';

export function validOpenPeriod(): AccountingPeriod {
  return {
    periodId: '2026-01',
    status: 'OPEN',
    journals: {},
    auditTrail: []
  };
}

export function validClosedPeriod(): AccountingPeriod {
  return {
    periodId: '2026-01',
    status: 'CLOSED',
    journals: {},
    auditTrail: [
      { event: 'PERIOD_CLOSED', at: '2026-01-31T23:59:59Z', by: 'system' }
    ]
  };
}

export function validLockedPeriod(): AccountingPeriod {
  return {
    periodId: '2026-01',
    status: 'LOCKED',
    journals: {},
    auditTrail: [
      { event: 'PERIOD_CLOSED', at: '2026-01-31T23:59:59Z', by: 'system' },
      { event: 'PERIOD_LOCKED', at: '2026-02-01T00:00:00Z', by: 'admin' }
    ]
  };
}
