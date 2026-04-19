/**
 * 📊 Read-Models - Projections Index
 */

import { AccountingPeriodRM } from '../types/AccountingPeriodRM';

export function initAccountingPeriodRM(
  periodId: string
): AccountingPeriodRM {
  return {
    periodId,
    status: 'OPEN',
    entries: []
  };
}

export * from './AccountingPeriodProjection';
