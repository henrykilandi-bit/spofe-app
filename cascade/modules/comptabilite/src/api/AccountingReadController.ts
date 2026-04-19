/**
 * 🌐 API - AccountingReadController
 * 
 * Controller en lecture seule pour les données comptables.
 * GET only - délégation pure aux read repositories.
 */

import { AccountingReadRepository } from '../read-models/ports/AccountingReadRepository';
import { AccountingEntryDTO, AccountingPeriodDTO } from './types';

export class AccountingReadController {
  constructor(
    private readonly repository: AccountingReadRepository
  ) {}

  getPeriod(periodId: string): AccountingPeriodDTO | null {
    return this.repository.findPeriod(periodId);
  }

  getEntriesByPeriod(periodId: string): AccountingEntryDTO[] {
    return this.repository.findEntriesByPeriod(periodId);
  }

  getEntriesByAccount(
    periodId: string,
    accountCode: string
  ): AccountingEntryDTO[] {
    return this.repository.findEntriesByAccount(
      periodId,
      accountCode
    );
  }

  getEntriesByTier(
    periodId: string,
    tierId: string
  ): AccountingEntryDTO[] {
    return this.repository.findEntriesByTier(
      periodId,
      tierId
    );
  }
}
