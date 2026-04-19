import { describe, expect, it } from '@jest/globals';

import * as stockApi from '../../src/api';
import * as stockGuardian from '../../src/guardian';
import * as stockReadModels from '../../src/read-models';

describe('gestion-stocks public exports smoke', () => {
  it('exposes the API entrypoint', () => {
    expect(stockApi.StockReadController).toBeDefined();
    expect(stockApi.createStockReadApi).toBeDefined();
  });

  it('exposes the Guardian entrypoint', () => {
    expect(stockGuardian.StockGuardian).toBeDefined();
    expect(stockGuardian.GuardianError).toBeDefined();
  });

  it('exposes the read-models entrypoint', () => {
    expect(stockReadModels.StockProjection).toBeDefined();
    expect(stockReadModels.InMemoryStockReadRepository).toBeDefined();
  });
});
