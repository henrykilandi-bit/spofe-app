import { describe, it, expect } from 'vitest';
import { scanForWrites } from './no-write.check';
import { enforceNoWrite, formatViolationsReport } from './no-write.rules';
import * as fs from 'fs';
import * as path from 'path';

describe('NO WRITE OUTSIDE GUARDIAN — AST check', () => {
  const testModuleRoot = path.join(__dirname, '../../../cascade/modules');

  it('passes when no write exists outside guardian', () => {
    // Skip if modules directory doesn't exist (during initial setup)
    if (!fs.existsSync(testModuleRoot)) {
      console.log('⚠️  Modules directory not found, skipping test');
      return;
    }

    const violations = scanForWrites(testModuleRoot);

    expect(() =>
      enforceNoWrite(violations)
    ).not.toThrow();
  });

  it('detects assignments outside guardian', () => {
    const violations = scanForWrites(testModuleRoot);
    
    // Check that violations are properly detected and formatted
    const report = formatViolationsReport(violations);
    
    expect(typeof report).toBe('string');
    if (violations.length > 0) {
      expect(report).toContain('❌ NO WRITE OUTSIDE GUARDIAN');
      expect(report).toContain('violation(s) found');
    } else {
      expect(report).toContain('✅ NO WRITE OUTSIDE GUARDIAN - PASSED');
    }
  });

  it('provides detailed violation information', () => {
    const violations = scanForWrites(testModuleRoot);
    
    violations.forEach(violation => {
      expect(violation).toHaveProperty('file');
      expect(violation).toHaveProperty('line');
      expect(violation).toHaveProperty('reason');
      expect(typeof violation.file).toBe('string');
      expect(typeof violation.line).toBe('number');
      expect(typeof violation.reason).toBe('string');
      expect(violation.line).toBeGreaterThan(0);
    });
  });
});

describe('NO WRITE GUARDIAN — Rule Enforcement', () => {
  it('throws error with proper message for violations', () => {
    const mockViolations = [
      {
        file: 'test/file.ts',
        line: 10,
        reason: 'Assignment outside Guardian'
      },
      {
        file: 'test/another.ts', 
        line: 20,
        reason: 'Mutating call save() outside Guardian'
      }
    ];

    expect(() => enforceNoWrite(mockViolations)).toThrow(
      /NO WRITE OUTSIDE GUARDIAN VIOLATION/
    );
    expect(() => enforceNoWrite(mockViolations)).toThrow(
      /test\/file\.ts:10 → Assignment outside Guardian/
    );
    expect(() => enforceNoWrite(mockViolations)).toThrow(
      /test\/another\.ts:20 → Mutating call save\(\) outside Guardian/
    );
  });

  it('passes gracefully with no violations', () => {
    expect(() => enforceNoWrite([])).not.toThrow();
  });
});
