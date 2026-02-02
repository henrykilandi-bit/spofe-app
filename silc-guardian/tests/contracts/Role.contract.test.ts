import { Violation } from '../../src/core/Violation';
import { ContractRegistry } from '../../src/core/ContractRegistry';

describe('Role Contract Tests', () => {
  describe('Contract Registry', () => {
    test('should recognize Role as valid contract', () => {
      expect(ContractRegistry.isKnownContract('Role')).toBe(true);
    });

    test('should reject invalid role names', () => {
      expect(ContractRegistry.isKnownContract('Admin')).toBe(false);
      expect(ContractRegistry.isKnownContract('SuperUser')).toBe(false);
      expect(ContractRegistry.isKnownContract('Permission')).toBe(false);
    });
  });

  describe('Role Entity Validation', () => {
    test('should accept valid Role entity structure', () => {
      const roleEntity = 'src/domain/entities/Role.entity.ts';
      expect(roleEntity).toContain('Role.entity.ts');
    });

    test('should reject Role entity with permission fields', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 2",
          "src/domain/entities/Role.entity.ts",
          "Role entity contains permissions field",
          "Role should be abstract, permissions belong to UserRole"
        )
      ];

      expect(violations[0].message).toContain('permissions field');
      expect(violations[0].severity).toBe("BLOCKING");
    });

    test('should reject Role entity with company attachment', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 2",
          "src/domain/entities/Role.entity.ts",
          "Role entity contains company field",
          "Role should be independent of Company"
        )
      ];

      expect(violations[0].message).toContain('company field');
    });
  });

  describe('Role Process Validation', () => {
    test('should accept UserRoleAssignmentProcess', () => {
      const assignmentProcess = 'src/domain/processes/UserRoleAssignment.process.ts';
      expect(assignmentProcess).toContain('UserRoleAssignment');
      expect(assignmentProcess).toContain('.process.ts');
    });

    test('should accept UserRoleRevocationProcess', () => {
      const revocationProcess = 'src/domain/processes/UserRoleRevocation.process.ts';
      expect(revocationProcess).toContain('UserRoleRevocation');
      expect(revocationProcess).toContain('.process.ts');
    });

    test('should reject direct role management processes', () => {
      const forbiddenProcesses = [
        'src/domain/processes/RoleManagement.process.ts',
        'src/domain/processes/RoleCreation.process.ts',
        'src/domain/processes/PermissionGrant.process.ts'
      ];

      forbiddenProcesses.forEach(process => {
        expect(process).toMatch(/(Management|Creation|PermissionGrant)/);
      });
    });
  });

  describe('Role Independence', () => {
    test('should ensure Role is independent', () => {
      const roleEntity = 'src/domain/entities/Role.entity.ts';
      
      // Role should not depend on User, Company, or Context
      expect(roleEntity).not.toContain('userId');
      expect(roleEntity).not.toContain('companyId');
      expect(roleEntity).not.toContain('contextId');
    });

    test('should reject Role with decision logic', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 2",
          "src/domain/entities/Role.entity.ts",
          "Role entity contains decision methods",
          "Role should be abstract, decisions belong to processes"
        )
      ];

      expect(violations[0].message).toContain('decision methods');
    });
  });

  describe('Role Naming Convention', () => {
    test('should accept valid role names', () => {
      const validRoles = ['Accountant', 'Viewer', 'Consultant', 'Auditor'];
      
      validRoles.forEach(role => {
        expect(role).not.toMatch(/(Admin|Super|Owner|Manager|Permission)/);
      });
    });

    test('should reject forbidden role names', () => {
      const forbiddenRoles = ['Admin', 'SuperUser', 'Owner', 'Manager', 'PermissionLevel'];
      
      forbiddenRoles.forEach(role => {
        expect(role).toMatch(/(Admin|Super|Owner|Manager|Permission)/);
      });
    });
  });

  describe('Role-User Separation', () => {
    test('should enforce Role-User separation through UserRole', () => {
      const userRoleRelation = 'src/domain/relations/UserRole.relation.ts';
      expect(userRoleRelation).toContain('UserRole');
      expect(userRoleRelation).toContain('.relation.ts');
    });

    test('should reject direct user-role assignment', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 2",
          "src/domain/entities/Role.entity.ts",
          "Direct user assignment in Role entity",
          "Use UserRole relation instead"
        )
      ];

      expect(violations[0].message).toContain('Direct user assignment');
    });
  });

  describe('Role Abstraction', () => {
    test('should ensure Role is abstract authorization', () => {
      const roleEntity = 'src/domain/entities/Role.entity.ts';
      
      // Role should define authorization, not implementation
      expect(roleEntity).not.toContain('execute');
      expect(roleEntity).not.toContain('perform');
      expect(roleEntity).not.toContain('implement');
    });

    test('should reject Role with concrete actions', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 2",
          "src/domain/entities/Role.entity.ts",
          "Role entity contains action methods",
          "Role should be abstract, actions belong to processes"
        )
      ];

      expect(violations[0].message).toContain('action methods');
    });
  });
});
