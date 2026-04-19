// tests/guardian/CoachingGuardian.spec.ts

import { describe, it, expect } from '@jest/globals';
import { CoachingGuardian } from '../../src/guardian/CoachingGuardian';
import { GuardianViolationError } from '../../src/guardian/errors';
import { GuardianContext } from '../../src/guardian/invariants';

describe('Guardian — Coaching (100% coverage)', () => {
  const guardian = new CoachingGuardian();

  const baseContext: GuardianContext = {
    tenantId: 'TENANT_1',
    actorId: 'ACTOR_1',
    now: new Date().toISOString(),
    commandType: 'AddCoachingJournalEntry',
  };

  // -------------------------
  // ACTEUR SPOFE
  // -------------------------

  it('rejects action without actorId', () => {
    const ctx = { ...baseContext, actorId: undefined };

    expect(() => guardian.validate(ctx)).toThrow(GuardianViolationError);
  });

  it('accepts action with actorId', () => {
    expect(() => guardian.validate(baseContext)).not.toThrow();
  });

  // -------------------------
  // TENANT ISOLATION
  // -------------------------

  it('rejects action without tenantId', () => {
    const ctx = { ...baseContext, tenantId: '' };

    expect(() => guardian.validate(ctx)).toThrow(GuardianViolationError);
  });

  // -------------------------
  // CALCULS INTERDITS
  // -------------------------

  const forbiddenCalculations = [
    'calculateROI',
    'computeBFR',
    'simulateBreakEven',
    'whatIfScenario',
    'forecastMargin',
  ];

  forbiddenCalculations.forEach(commandType => {
    it(`rejects forbidden calculation command: ${commandType}`, () => {
      const ctx: GuardianContext = {
        ...baseContext,
        commandType,
      };

      expect(() => guardian.validate(ctx)).toThrow(GuardianViolationError);
    });
  });

  // -------------------------
  // DÉCISIONS AUTOMATIQUES INTERDITES
  // -------------------------

  const forbiddenDecisions = [
    'decideAutomatically',
    'approveAutomatically',
    'prioritizeAutomatically',
    'recommendAutomatically',
  ];

  forbiddenDecisions.forEach(commandType => {
    it(`rejects forbidden decision command: ${commandType}`, () => {
      const ctx: GuardianContext = {
        ...baseContext,
        commandType,
      };

      expect(() => guardian.validate(ctx)).toThrow(GuardianViolationError);
    });
  });

  // -------------------------
  // ÉCHANGES — SESSION NON PLANIFIÉE
  // -------------------------

  it('rejects exchange without planned session', () => {
    const ctx: GuardianContext = {
      ...baseContext,
      commandType: 'AddCoachingExchange',
      sessionPlanned: false,
      sessionActive: true,
    };

    expect(() => guardian.validate(ctx)).toThrow(GuardianViolationError);
  });

  // -------------------------
  // ÉCHANGES — SESSION INACTIVE
  // -------------------------

  it('rejects exchange outside active session window', () => {
    const ctx: GuardianContext = {
      ...baseContext,
      commandType: 'AddCoachingExchange',
      sessionPlanned: true,
      sessionActive: false,
    };

    expect(() => guardian.validate(ctx)).toThrow(GuardianViolationError);
  });

  // -------------------------
  // ÉCHANGES — HAPPY PATH
  // -------------------------

  it('accepts exchange during planned and active session', () => {
    const ctx: GuardianContext = {
      ...baseContext,
      commandType: 'AddCoachingExchange',
      sessionPlanned: true,
      sessionActive: true,
    };

    expect(() => guardian.validate(ctx)).not.toThrow();
  });

  // -------------------------
  // JOURNAL & ACTIONS — HAPPY PATH
  // -------------------------

  it('accepts journal entry without session context', () => {
    const ctx: GuardianContext = {
      ...baseContext,
      commandType: 'AddCoachingJournalEntry',
    };

    expect(() => guardian.validate(ctx)).not.toThrow();
  });

  it('accepts action creation command', () => {
    const ctx: GuardianContext = {
      ...baseContext,
      commandType: 'CreateCoachingAction',
    };

    expect(() => guardian.validate(ctx)).not.toThrow();
  });
});
