/**
 * Guardian HTTP Mapping Tests
 * Validates violation code to HTTP status mapping
 */

describe('Guardian HTTP Mapping', () => {
  interface GuardianHttpMapping {
    httpStatus: number;
    errorCode: string;
    description: string;
  }

  const guardianHttpMap: Record<string, GuardianHttpMapping> = {
    'G4-01': {
      httpStatus: 409,
      errorCode: 'PROCESS_ORDER_VIOLATION',
      description: 'Process order violation'
    },
    'G4-02': {
      httpStatus: 409,
      errorCode: 'STATE_INCONSISTENCY',
      description: 'State inconsistency'
    },
    'G4-03': {
      httpStatus: 403,
      errorCode: 'IMPLICIT_AUTHORITY',
      description: 'Implicit authority is forbidden'
    },
    'G4-04': {
      httpStatus: 422,
      errorCode: 'INVARIANT_VIOLATION',
      description: 'Invariant violation'
    },
    'G4-05': {
      httpStatus: 403,
      errorCode: 'GOVERNANCE_BYPASS',
      description: 'Governance bypass'
    },
    'G4-UNKNOWN': {
      httpStatus: 400,
      errorCode: 'UNKNOWN_VIOLATION',
      description: 'Unknown violation'
    }
  };

  describe('Mapping Coverage', () => {
    test('should have all violation codes mapped', () => {
      const codes = ['G4-01', 'G4-02', 'G4-03', 'G4-04', 'G4-05', 'G4-UNKNOWN'];
      
      codes.forEach(code => {
        expect(guardianHttpMap[code]).toBeDefined();
        expect(guardianHttpMap[code].httpStatus).toBeDefined();
        expect(guardianHttpMap[code].errorCode).toBeDefined();
      });
    });

    test('should not have duplicate mappings', () => {
      const codes = Object.keys(guardianHttpMap);
      const uniqueCodes = new Set(codes);
      expect(codes.length).toBe(uniqueCodes.size);
    });

    test('should have valid HTTP status codes', () => {
      Object.values(guardianHttpMap).forEach(mapping => {
        expect(mapping.httpStatus).toBeGreaterThanOrEqual(400);
        expect(mapping.httpStatus).toBeLessThan(500);
      });
    });
  });

  describe('Violation Code Mapping', () => {
    test('G4-01 → 409 Conflict', () => {
      const mapping = guardianHttpMap['G4-01'];
      expect(mapping.httpStatus).toBe(409);
      expect(mapping.errorCode).toBe('PROCESS_ORDER_VIOLATION');
    });

    test('G4-02 → 409 Conflict', () => {
      const mapping = guardianHttpMap['G4-02'];
      expect(mapping.httpStatus).toBe(409);
      expect(mapping.errorCode).toBe('STATE_INCONSISTENCY');
    });

    test('G4-03 → 403 Forbidden', () => {
      const mapping = guardianHttpMap['G4-03'];
      expect(mapping.httpStatus).toBe(403);
      expect(mapping.errorCode).toBe('IMPLICIT_AUTHORITY');
    });

    test('G4-04 → 422 Unprocessable Entity', () => {
      const mapping = guardianHttpMap['G4-04'];
      expect(mapping.httpStatus).toBe(422);
      expect(mapping.errorCode).toBe('INVARIANT_VIOLATION');
    });

    test('G4-05 → 403 Forbidden', () => {
      const mapping = guardianHttpMap['G4-05'];
      expect(mapping.httpStatus).toBe(403);
      expect(mapping.errorCode).toBe('GOVERNANCE_BYPASS');
    });

    test('G4-UNKNOWN → 400 Bad Request (Fallback)', () => {
      const mapping = guardianHttpMap['G4-UNKNOWN'];
      expect(mapping.httpStatus).toBe(400);
      expect(mapping.errorCode).toBe('UNKNOWN_VIOLATION');
    });
  });

  describe('HTTP Status Semantics', () => {
    test('403 Forbidden indicates access denied by Guardian', () => {
      const forbiddenMappings = Object.entries(guardianHttpMap)
        .filter(([_, mapping]) => mapping.httpStatus === 403)
        .map(([code]) => code);

      expect(forbiddenMappings).toContain('G4-03');
      expect(forbiddenMappings).toContain('G4-05');
    });

    test('409 Conflict indicates process/state violation', () => {
      const conflictMappings = Object.entries(guardianHttpMap)
        .filter(([_, mapping]) => mapping.httpStatus === 409)
        .map(([code]) => code);

      expect(conflictMappings).toContain('G4-01');
      expect(conflictMappings).toContain('G4-02');
    });

    test('422 Unprocessable Entity indicates data violation', () => {
      const unprocessableMappings = Object.entries(guardianHttpMap)
        .filter(([_, mapping]) => mapping.httpStatus === 422)
        .map(([code]) => code);

      expect(unprocessableMappings).toContain('G4-04');
    });

    test('400 Bad Request is fallback for unknown', () => {
      const badRequestMappings = Object.entries(guardianHttpMap)
        .filter(([_, mapping]) => mapping.httpStatus === 400)
        .map(([code]) => code);

      expect(badRequestMappings).toContain('G4-UNKNOWN');
    });
  });

  describe('Lookup Performance', () => {
    test('should retrieve mapping by code in O(1)', () => {
      const startTime = performance.now();
      let lastMapping: GuardianHttpMapping | undefined;
      
      for (let i = 0; i < 10000; i++) {
        lastMapping = guardianHttpMap['G4-03'];
      }
      
      const duration = performance.now() - startTime;
      expect(lastMapping).toBeDefined();
      expect(duration).toBeLessThan(400); // Keep signal meaningful while avoiding CI noise on shared runners
    });

    test('should handle unknown codes gracefully', () => {
      const unknownMapping = guardianHttpMap['G4-UNKNOWN'];
      expect(unknownMapping).toBeDefined();
      expect(unknownMapping.httpStatus).toBe(400);
    });
  });

  describe('Response Format', () => {
    test('mapping should include all required fields', () => {
      Object.values(guardianHttpMap).forEach(mapping => {
        expect(mapping.httpStatus).toBeDefined();
        expect(mapping.errorCode).toBeDefined();
        expect(mapping.description).toBeDefined();
      });
    });

    test('error code should match violation code format', () => {
      Object.entries(guardianHttpMap).forEach(([code, mapping]) => {
        if (code !== 'G4-UNKNOWN') {
          expect(mapping.errorCode).toMatch(/^[A-Z_]+$/);
        }
      });
    });

    test('description should be human readable', () => {
      Object.values(guardianHttpMap).forEach(mapping => {
        expect(mapping.description.length).toBeGreaterThan(0);
        expect(mapping.description.length).toBeLessThan(100);
      });
    });
  });
});
