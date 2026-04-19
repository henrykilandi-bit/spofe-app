import { describe, expect, test } from '@jest/globals';

import { AccountingGuardian } from '../../src/guardian/AccountingGuardian';
import { validClosedPeriod, validOpenPeriod } from './fixtures/validPeriod';
import { validEntry } from './fixtures/validEntry';

describe('Guardian clôture opposable', () => {
  test('fermeture d une periode ouverte met le statut CLOSED', () => {
    const closed = AccountingGuardian.closePeriod(
      validOpenPeriod(),
      'closer',
      '2026-01-31T23:59:59Z'
    );

    expect(closed.status).toBe('CLOSED');
    expect(closed.auditTrail[closed.auditTrail.length - 1]?.event).toBe('PERIOD_CLOSED');
  });

  test('fermeture d une periode deja cloturee rejette', () => {
    expect(() =>
      AccountingGuardian.closePeriod(
        validClosedPeriod(),
        'closer',
        '2026-01-31T23:59:59Z'
      )
    ).toThrow('Only OPEN periods can be closed');
  });

  test('ecriture interdite apres cloture', () => {
    const closed = AccountingGuardian.closePeriod(
      validOpenPeriod(),
      'closer',
      '2026-01-31T23:59:59Z'
    );

    expect(() => AccountingGuardian.validateNewEntry(closed, validEntry())).toThrow();
  });
});
