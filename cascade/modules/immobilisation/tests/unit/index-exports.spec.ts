import { describe, expect, it } from '@jest/globals';

import * as immobilisationApi from '../../src/api';
import * as immobilisationApplication from '../../src/application';
import * as immobilisationGuardian from '../../src/guardian';
import * as immobilisationReadModels from '../../src/read-models';

describe('immobilisation public exports smoke', () => {
  it('exposes the API entrypoint', () => {
    expect(immobilisationApi.ImmobilisationReadController).toBeDefined();
    expect(immobilisationApi.buildImmobilisationReadController).toBeDefined();
  });

  it('exposes the application entrypoint', () => {
    expect(immobilisationApplication.RegisterImmobilisationHandler).toBeDefined();
    expect(immobilisationApplication.DisposeImmobilisationHandler).toBeDefined();
  });

  it('exposes the Guardian entrypoint', () => {
    expect(immobilisationGuardian.ImmobilisationGuardian).toBeDefined();
    expect(immobilisationGuardian.GuardianError).toBeDefined();
  });

  it('exposes the read-models entrypoint', () => {
    expect(immobilisationReadModels.ImmobilisationProjection).toBeDefined();
    expect(immobilisationReadModels.InMemoryImmobilisationReadRepository).toBeDefined();
  });
});
