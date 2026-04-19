import { describe, expect, it } from '@jest/globals';

import * as moduleApi from '../../src/index';

describe('objectif-indicateurs-evenements public exports', () => {
  it('exposes the main guardian and projection entrypoints', () => {
    expect(moduleApi.OieGuardian).toBeDefined();
    expect(moduleApi.ObjectivesProjection).toBeDefined();
    expect(moduleApi.IndicatorsProjection).toBeDefined();
    expect(moduleApi.EventsProjection).toBeDefined();
    expect(moduleApi.InMemoryObjectivesReadRepository).toBeDefined();
    expect(moduleApi.InMemoryIndicatorsReadRepository).toBeDefined();
    expect(moduleApi.InMemoryEventsReadRepository).toBeDefined();
  });
});
