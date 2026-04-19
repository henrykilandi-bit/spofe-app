import { describe, expect, it } from '@jest/globals';

import { OieGuardian } from '../../src/domain/guardian/OieGuardian';
import type { GuardianContext, GuardianCommand } from '../../src/domain/guardian/types';

const ctx: GuardianContext = {
  tenantId: 'TENANT1',
  actorId: 'ACTOR1',
  occurredAt: '2026-01-01T00:00:00.000Z'
};

describe('OieGuardian', () => {
  it('accepts a valid objective declaration', () => {
    const guardian = new OieGuardian(['budget']);
    const validations = guardian.validateDeclareObjective(ctx, {
      commandType: 'DECLARE_OBJECTIVE',
      tenantId: 'TENANT1',
      label: 'Augmenter la retention',
      type: 'STRATEGIC',
      periodId: 'P2026Q1'
    });

    expect(validations.every((entry) => entry.isValid)).toBe(true);
    expect(guardian.isModuleCertified('budget')).toBe(true);
  });

  it('rejects objective declarations with invalid type and missing period', () => {
    const guardian = new OieGuardian();
    const validations = guardian.validateDeclareObjective(ctx, {
      commandType: 'DECLARE_OBJECTIVE',
      tenantId: 'TENANT1',
      label: 'Objectif incomplet',
      type: 'UNKNOWN_TYPE'
    });

    expect(validations.some((entry) => entry.invariant === 'OIE-G03' && !entry.isValid)).toBe(true);
    expect(validations.some((entry) => entry.invariant === 'OIE-G04' && !entry.isValid)).toBe(true);
  });

  it('rejects indicator registration with unknown linked objective', () => {
    const guardian = new OieGuardian();
    const command: GuardianCommand = {
      commandType: 'REGISTER_INDICATOR',
      tenantId: 'TENANT1',
      label: 'Taux de retention',
      source: { module: 'crm', readModel: 'customers' },
      linkedObjectiveIds: ['OBJ-404']
    };

    const validations = guardian.validateRegisterIndicator(ctx, command, ['OBJ-1']);

    expect(validations.some((entry) => entry.invariant === 'OIE-G08' && !entry.isValid)).toBe(true);
  });

  it('rejects indicator registration when source module is missing', () => {
    const guardian = new OieGuardian();
    const validations = guardian.validateRegisterIndicator(ctx, {
      commandType: 'REGISTER_INDICATOR',
      tenantId: 'TENANT1',
      label: 'Taux de retention',
      source: { module: '', readModel: 'customers' },
      linkedObjectiveIds: ['OBJ-1']
    }, ['OBJ-1']);

    expect(validations.some((entry) => entry.invariant === 'OIE-G07' && !entry.isValid)).toBe(true);
  });

  it('rejects commands containing calculation hints', () => {
    const guardian = new OieGuardian();
    const validations = guardian.validateRegisterEvent(ctx, {
      commandType: 'REGISTER_EVENT',
      tenantId: 'TENANT1',
      type: 'ALERT',
      label: 'Compute margin drift'
    }, []);

    expect(validations.some((entry) => entry.invariant === 'OIE-G15' && !entry.isValid)).toBe(true);
  });

  it('throws when failed validations are enforced', () => {
    const guardian = new OieGuardian();
    const validations = guardian.validateRegisterEvent(ctx, {
      commandType: 'REGISTER_EVENT',
      tenantId: 'TENANT2',
      type: '',
      label: ''
    }, []);

    expect(() => guardian.enforceValidations(validations)).toThrow('Guardian validation failed');
  });

  it('keeps the certified modules list unique when adding a module twice', () => {
    const guardian = new OieGuardian(['crm']);

    guardian.addCertifiedModule('budget');
    guardian.addCertifiedModule('budget');

    expect(guardian.getCertifiedModules()).toEqual(['crm', 'budget']);
  });
});
