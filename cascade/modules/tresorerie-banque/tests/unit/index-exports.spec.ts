import { describe, expect, it } from '@jest/globals';

import * as bankApi from '../../src/api';
import * as bankReadModels from '../../src/read-models';
import * as bankProjections from '../../src/read-models/projections';

describe('tresorerie-banque public exports smoke', () => {
  it('exposes the API entrypoint', () => {
    expect(bankApi.BankAccountsController).toBeDefined();
    expect(bankApi.BankBalancesController).toBeDefined();
    expect(bankApi.BankJournalController).toBeDefined();
  });

  it('exposes the read-models entrypoint', () => {
    expect(bankReadModels.BankAccountStateProjection).toBeDefined();
    expect(bankReadModels.BankJournalProjection).toBeDefined();
    expect(bankReadModels.BankBalanceSnapshotProjection).toBeDefined();
  });

  it('exposes the projections sub-entrypoint', () => {
    expect(bankProjections.BankMovementProjection).toBeDefined();
    expect(bankProjections.BankDocumentProjection).toBeDefined();
  });
});
