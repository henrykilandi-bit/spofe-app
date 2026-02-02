/**
 * Guardian Error Exception Tests
 * Validates type-safe Guardian exception handling
 */

describe('GuardianError', () => {
  interface GuardianError extends Error {
    violationCode: string;
  }

  class GuardianError extends Error {
    violationCode: string;

    constructor(violationCode: string, message: string) {
      super(message);
      this.name = 'GuardianError';
      this.violationCode = violationCode;
      Object.setPrototypeOf(this, GuardianError.prototype);
    }
  }

  function isGuardianError(error: unknown): error is GuardianError {
    return error instanceof GuardianError;
  }

  describe('Creation', () => {
    test('should create with violation code', () => {
      const error = new GuardianError('G4-03', 'Implicit authority forbidden');
      
      expect(error).toBeInstanceOf(GuardianError);
      expect(error.violationCode).toBe('G4-03');
      expect(error.message).toBe('Implicit authority forbidden');
    });

    test('should support all violation codes', () => {
      const codes = ['G4-01', 'G4-02', 'G4-03', 'G4-04', 'G4-05', 'G4-UNKNOWN'];
      
      codes.forEach(code => {
        const error = new GuardianError(code, `Violation: ${code}`);
        expect(error.violationCode).toBe(code);
      });
    });

    test('should be instanceof Error', () => {
      const error = new GuardianError('G4-03', 'Test');
      expect(error).toBeInstanceOf(Error);
    });
  });

  describe('Type Guard', () => {
    test('should identify GuardianError', () => {
      const error = new GuardianError('G4-03', 'Test');
      expect(isGuardianError(error)).toBe(true);
    });

    test('should not match regular errors', () => {
      const error = new Error('Regular error');
      expect(isGuardianError(error)).toBe(false);
    });

    test('should not match null/undefined', () => {
      expect(isGuardianError(null)).toBe(false);
      expect(isGuardianError(undefined)).toBe(false);
    });

    test('should not match other objects', () => {
      expect(isGuardianError({ violationCode: 'G4-03' })).toBe(false);
      expect(isGuardianError('G4-03')).toBe(false);
      expect(isGuardianError(123)).toBe(false);
    });
  });

  describe('Properties', () => {
    test('should have name property', () => {
      const error = new GuardianError('G4-03', 'Test');
      expect(error.name).toBe('GuardianError');
    });

    test('should be serializable', () => {
      const error = new GuardianError('G4-03', 'Implicit authority');
      const serialized = JSON.stringify({
        name: error.name,
        message: error.message,
        violationCode: error.violationCode
      });

      expect(serialized).toContain('G4-03');
      expect(serialized).toContain('Implicit authority');
    });

    test('should have stack trace', () => {
      const error = new GuardianError('G4-03', 'Test');
      expect(error.stack).toBeDefined();
      expect(error.stack).toContain('GuardianError');
    });
  });

  describe('Violation Codes', () => {
    test('G4-01: Process Order Violation', () => {
      const error = new GuardianError('G4-01', 'Process must follow order');
      expect(error.violationCode).toBe('G4-01');
    });

    test('G4-02: State Inconsistency', () => {
      const error = new GuardianError('G4-02', 'Invalid state transition');
      expect(error.violationCode).toBe('G4-02');
    });

    test('G4-03: Implicit Authority Forbidden', () => {
      const error = new GuardianError('G4-03', 'USER role cannot execute');
      expect(error.violationCode).toBe('G4-03');
    });

    test('G4-04: Invariant Violation', () => {
      const error = new GuardianError('G4-04', 'Invariant violated');
      expect(error.violationCode).toBe('G4-04');
    });

    test('G4-05: Governance Bypass', () => {
      const error = new GuardianError('G4-05', 'Governance rules violated');
      expect(error.violationCode).toBe('G4-05');
    });

    test('G4-UNKNOWN: Unknown Violation', () => {
      const error = new GuardianError('G4-UNKNOWN', 'Unknown violation');
      expect(error.violationCode).toBe('G4-UNKNOWN');
    });
  });
});
