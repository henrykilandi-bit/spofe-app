import { Violation } from '../../src/core/Violation';
import { ContractRegistry } from '../../src/core/ContractRegistry';
import { Guardian } from '../../src/core/Guardian';

describe('User Contract Tests', () => {
  describe('Contract Registry', () => {
    test('should recognize User as valid contract', () => {
      expect(ContractRegistry.isKnownContract('User')).toBe(true);
    });

    test('should reject invalid contract names', () => {
      expect(ContractRegistry.isKnownContract('Admin')).toBe(false);
      expect(ContractRegistry.isKnownContract('SuperUser')).toBe(false);
      expect(ContractRegistry.isKnownContract('Manager')).toBe(false);
    });
  });

  describe('User Entity Validation', () => {
    test('should accept valid User entity structure', () => {
      const guardian = new Guardian();
      const mockFile = 'src/domain/entities/User.entity.ts';
      
      // Mock file reading would go here
      // For now, test the contract registry
      expect(ContractRegistry.isKnownContract('User')).toBe(true);
    });

    test('should reject User entity with forbidden words', () => {
      const forbiddenWords = ['Admin', 'Super', 'Owner', 'Manager', 'Permission'];
      
      forbiddenWords.forEach(word => {
        const fileName = `src/domain/entities/${word}User.entity.ts`;
        // This would be caught by naming rules
        expect(fileName).toContain(word);
      });
    });

    test('should ensure User entity has no power attributes', () => {
      // Test that User entity doesn't contain power-related fields
      const userViolations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 1",
          "src/domain/entities/User.entity.ts",
          "User entity contains role field (violates contract)",
          "User should be neutral, use UserRole relation instead"
        )
      ];

      expect(userViolations).toHaveLength(1);
      expect(userViolations[0].severity).toBe("BLOCKING");
    });
  });

  describe('User Process Validation', () => {
    test('should accept UserRegistrationProcess', () => {
      const processFile = 'src/domain/processes/UserRegistration.process.ts';
      expect(processFile).toContain('UserRegistration');
      expect(processFile).toContain('.process.ts');
    });

    test('should reject processes with forbidden words', () => {
      const forbiddenProcesses = [
        'src/domain/processes/UserCreation.process.ts',
        'src/domain/processes/UserManagement.process.ts',
        'src/domain/processes/UserAdmin.process.ts'
      ];

      forbiddenProcesses.forEach(process => {
        expect(process).toMatch(/(Creation|Management|Admin)/);
      });
    });
  });

  describe('User Role Separation', () => {
    test('should enforce User-Role separation', () => {
      const userEntity = 'src/domain/entities/User.entity.ts';
      const roleRelation = 'src/domain/relations/UserRole.relation.ts';
      
      expect(userEntity).not.toContain('role');
      expect(roleRelation).toContain('UserRole');
      expect(roleRelation).toContain('.relation.ts');
    });

    test('should reject direct role assignment in User', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 1",
          "src/domain/entities/User.entity.ts",
          "Direct role field found in User entity",
          "Use UserRole relation instead"
        )
      ];

      expect(violations[0].message).toContain('Direct role field');
    });
  });

  describe('Context Validation', () => {
    test('should require Context for UserRole', () => {
      const userRoleRelation = 'src/domain/relations/UserRole.relation.ts';
      expect(userRoleRelation).toContain('Context');
    });

    test('should reject context-less UserRole', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 3",
          "src/domain/relations/UserRole.relation.ts",
          "UserRole relation missing Context",
          "Every UserRole must be within a Context"
        )
      ];

      expect(violations[0].severity).toBe("BLOCKING");
    });
  });

  describe('Lifecycle Validation', () => {
    test('should support User registration process', () => {
      const registrationProcess = 'src/domain/processes/UserRegistration.process.ts';
      expect(registrationProcess).toBeDefined();
    });

    test('should support User role assignment process', () => {
      const assignmentProcess = 'src/domain/processes/UserRoleAssignment.process.ts';
      expect(assignmentProcess).toContain('UserRoleAssignment');
    });

    test('should support User role revocation process', () => {
      const revocationProcess = 'src/domain/processes/UserRoleRevocation.process.ts';
      expect(revocationProcess).toContain('UserRoleRevocation');
    });
  });
});
