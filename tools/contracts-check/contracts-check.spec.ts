import { describe, it, expect, beforeEach } from 'vitest';
import { validateScope } from './scope.check';
import { validateGuardian } from './guardian.check';
import { parseDependencies } from '../dependencies-check/dependencies.parser';
import { validateDependencies } from '../dependencies-check/dependencies.rules';
import * as fs from 'fs';
import * as path from 'path';

const MODULES_PATH = path.resolve('cascade/modules');

describe('SPOFE — Complete Contracts Compliance (P0)', () => {
  
  beforeEach(() => {
    if (!fs.existsSync(MODULES_PATH)) {
      throw new Error(`Modules path not found: ${MODULES_PATH}`);
    }
  });

  describe('DEPENDENCIES.md contracts', () => {
    it('should have symmetric and valid dependencies', () => {
      const dependencies = parseDependencies(MODULES_PATH);
      const errors = validateDependencies(dependencies);
      
      if (errors.length > 0) {
        const errorMessages = errors.map(e => `${e.type}: ${e.message}`).join('\n');
        throw new Error(`Dependencies violations:\n${errorMessages}`);
      }
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('SCOPE.md contracts', () => {
    it('should have all SCOPE.md files present', () => {
      const errors = validateScope(MODULES_PATH);
      const missingFiles = errors.filter(e => e.type === 'MISSING_SCOPE_FILE');
      
      expect(missingFiles).toHaveLength(0);
    });

    it('should have IN SCOPE and OUT OF SCOPE sections', () => {
      const errors = validateScope(MODULES_PATH);
      const structureErrors = errors.filter(e => 
        e.type === 'MISSING_IN_SCOPE' || 
        e.type === 'MISSING_OUT_OF_SCOPE' ||
        e.type === 'EMPTY_SCOPE'
      );
      
      if (structureErrors.length > 0) {
        const errorMessages = structureErrors.map(e => e.message).join('\n');
        throw new Error(`SCOPE structure violations:\n${errorMessages}`);
      }
      
      expect(structureErrors).toHaveLength(0);
    });

    it('should have no scope overlaps between modules', () => {
      const errors = validateScope(MODULES_PATH);
      const overlapErrors = errors.filter(e => e.type === 'SCOPE_OVERLAP');
      
      if (overlapErrors.length > 0) {
        const errorMessages = overlapErrors.map(e => e.message).join('\n');
        throw new Error(`SCOPE overlap violations:\n${errorMessages}`);
      }
      
      expect(overlapErrors).toHaveLength(0);
    });

    it('should be fully compliant', () => {
      const errors = validateScope(MODULES_PATH);
      
      if (errors.length > 0) {
        const errorSummary = errors.map(e => `${e.module}: ${e.type} - ${e.message}`).join('\n');
        throw new Error(`SCOPE compliance violations:\n${errorSummary}`);
      }
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('GUARDIAN.md contracts', () => {
    it('should have all GUARDIAN.md files present', () => {
      const errors = validateGuardian(MODULES_PATH);
      const missingFiles = errors.filter(e => e.type === 'MISSING_GUARDIAN_FILE');
      
      expect(missingFiles).toHaveLength(0);
    });

    it('should have properly formatted invariants', () => {
      const errors = validateGuardian(MODULES_PATH);
      const formatErrors = errors.filter(e => 
        e.type === 'INVALID_INVARIANT_FORMAT' ||
        e.type === 'EMPTY_INVARIANTS' ||
        e.type === 'MISSING_INVARIANTS'
      );
      
      if (formatErrors.length > 0) {
        const errorMessages = formatErrors.map(e => e.message).join('\n');
        throw new Error(`GUARDIAN format violations:\n${errorMessages}`);
      }
      
      expect(formatErrors).toHaveLength(0);
    });

    it('should have unique invariant IDs across all modules', () => {
      const errors = validateGuardian(MODULES_PATH);
      const duplicateErrors = errors.filter(e => e.type === 'DUPLICATE_INVARIANT_ID');
      
      if (duplicateErrors.length > 0) {
        const errorMessages = duplicateErrors.map(e => e.message).join('\n');
        throw new Error(`GUARDIAN uniqueness violations:\n${errorMessages}`);
      }
      
      expect(duplicateErrors).toHaveLength(0);
    });

    it('should be fully compliant', () => {
      const errors = validateGuardian(MODULES_PATH);
      
      if (errors.length > 0) {
        const errorSummary = errors.map(e => `${e.module}: ${e.type} - ${e.message}`).join('\n');
        throw new Error(`GUARDIAN compliance violations:\n${errorSummary}`);
      }
      
      expect(errors).toHaveLength(0);
    });
  });

  describe('Global contract compliance', () => {
    it('should have ALL contracts compliant for SPOFE certification', () => {
      // Test intégré final
      const dependencies = parseDependencies(MODULES_PATH);
      const dependencyErrors = validateDependencies(dependencies);
      const scopeErrors = validateScope(MODULES_PATH);
      const guardianErrors = validateGuardian(MODULES_PATH);
      
      const totalErrors = dependencyErrors.length + scopeErrors.length + guardianErrors.length;
      
      if (totalErrors > 0) {
        const summary = [
          `Total contract violations: ${totalErrors}`,
          `- Dependencies: ${dependencyErrors.length}`,
          `- Scope: ${scopeErrors.length}`,
          `- Guardian: ${guardianErrors.length}`
        ];
        
        throw new Error(
          `SPOFE contract compliance FAILED:\n${summary.join('\n')}\n\nAll contracts must be compliant for certification.`
        );
      }
      
      expect(totalErrors).toBe(0);
      console.log('\n✅ SPOFE is fully CONTRACT-VERIFIED');
    });
  });
});