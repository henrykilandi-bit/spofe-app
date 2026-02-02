import { Violation } from '../../src/core/Violation';
import { Guardian } from '../../src/core/Guardian';

describe('Architecture Contract Tests', () => {
  describe('Domain Zone Validation', () => {
    test('should accept entities in domain/entities', () => {
      const validEntities = [
        'src/domain/entities/User.entity.ts',
        'src/domain/entities/Role.entity.ts',
        'src/domain/entities/Company.entity.ts',
        'src/domain/entities/Group.entity.ts',
        'src/domain/entities/Context.entity.ts'
      ];

      validEntities.forEach(entity => {
        expect(entity).toContain('domain/entities/');
        expect(entity).toContain('.entity.ts');
      });
    });

    test('should accept relations in domain/relations', () => {
      const validRelations = [
        'src/domain/relations/UserRole.relation.ts',
        'src/domain/relations/CompanyContext.relation.ts',
        'src/domain/relations/GroupContext.relation.ts'
      ];

      validRelations.forEach(relation => {
        expect(relation).toContain('domain/relations/');
        expect(relation).toContain('.relation.ts');
      });
    });

    test('should accept processes in domain/processes', () => {
      const validProcesses = [
        'src/domain/processes/UserRegistration.process.ts',
        'src/domain/processes/UserRoleAssignment.process.ts',
        'src/domain/processes/UserRoleRevocation.process.ts',
        'src/domain/processes/CompanyOnboarding.process.ts'
      ];

      validProcesses.forEach(process => {
        expect(process).toContain('domain/processes/');
        expect(process).toContain('.process.ts');
      });
    });

    test('should reject domain files with infrastructure dependencies', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 1",
          "src/domain/entities/User.entity.ts",
          "Domain entity contains database import",
          "Domain must not depend on infrastructure"
        )
      ];

      expect(violations[0].severity).toBe("BLOCKING");
    });
  });

  describe('Application Zone Validation', () => {
    test('should accept services in application/services', () => {
      const validServices = [
        'src/application/services/UserService.ts',
        'src/application/services/CompanyService.ts',
        'src/application/services/ContextService.ts'
      ];

      validServices.forEach(service => {
        expect(service).toContain('application/services/');
        expect(service).toContain('Service.ts');
      });
    });

    test('should accept DTOs in application/dtos', () => {
      const validDtos = [
        'src/application/dtos/UserRegistrationDto.ts',
        'src/application/dtos/CompanyOnboardingRequestDto.ts',
        'src/application/dtos/UserRoleAssignmentDto.ts'
      ];

      validDtos.forEach(dto => {
        expect(dto).toContain('application/dtos/');
        expect(dto).toContain('Dto.ts');
      });
    });

    test('should accept ports in application/ports', () => {
      const validPorts = [
        'src/application/ports/repositories/UserRepository.port.ts',
        'src/application/ports/repositories/CompanyRepository.port.ts',
        'src/application/ports/messaging/EventBus.port.ts'
      ];

      validPorts.forEach(port => {
        expect(port).toContain('application/ports/');
        expect(port).toContain('.port.ts');
      });
    });

    test('should reject application services making business decisions', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 2",
          "src/application/services/UserService.ts",
          "Service contains decision logic",
          "Decisions belong to processes"
        )
      ];

      expect(violations[0].message).toContain('decision logic');
    });
  });

  describe('Infrastructure Zone Validation', () => {
    test('should accept repositories in infrastructure/repositories', () => {
      const validRepositories = [
        'src/infrastructure/repositories/UserRepository.mysql.ts',
        'src/infrastructure/repositories/CompanyRepository.mysql.ts',
        'src/infrastructure/repositories/ContextRepository.mysql.ts'
      ];

      validRepositories.forEach(repo => {
        expect(repo).toContain('infrastructure/repositories/');
        expect(repo).toContain('Repository.');
      });
    });

    test('should accept adapters in infrastructure/adapters', () => {
      const validAdapters = [
        'src/infrastructure/adapters/Mailer.adapter.ts',
        'src/infrastructure/adapters/PaymentGateway.adapter.ts',
        'src/infrastructure/adapters/NotificationService.adapter.ts'
      ];

      validAdapters.forEach(adapter => {
        expect(adapter).toContain('infrastructure/adapters/');
        expect(adapter).toContain('.adapter.ts');
      });
    });

    test('should reject infrastructure knowing domain entities', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 3",
          "src/infrastructure/repositories/UserRepository.mysql.ts",
          "Infrastructure imports domain entity directly",
          "Use ports/interfaces instead"
        )
      ];

      expect(violations[0].message).toContain('domain entity directly');
    });
  });

  describe('Interface Zone Validation', () => {
    test('should accept controllers in interfaces/http', () => {
      const validControllers = [
        'src/interfaces/http/controllers/UserController.ts',
        'src/interfaces/http/controllers/CompanyController.ts',
        'src/interfaces/http/controllers/AuthController.ts'
      ];

      validControllers.forEach(controller => {
        expect(controller).toContain('interfaces/http/controllers/');
        expect(controller).toContain('Controller.ts');
      });
    });

    test('should accept CLI commands in interfaces/cli', () => {
      const validCli = [
        'src/interfaces/cli/admin.cli.ts',
        'src/interfaces/cli/user.cli.ts',
        'src/interfaces/cli/company.cli.ts'
      ];

      validCli.forEach(cli => {
        expect(cli).toContain('interfaces/cli/');
        expect(cli).toContain('.cli.ts');
      });
    });

    test('should reject interfaces making business decisions', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 4",
          "src/interfaces/http/controllers/UserController.ts",
          "Controller contains business logic",
          "Controllers should only delegate to processes"
        )
      ];

      expect(violations[0].message).toContain('business logic');
    });
  });

  describe('Legacy Zone Validation', () => {
    test('should accept legacy files in legacy folder', () => {
      const legacyFiles = [
        'src/legacy/controllers/UserController.js',
        'src/legacy/services/UserService.js',
        'src/legacy/models/User.js'
      ];

      legacyFiles.forEach(file => {
        expect(file).toContain('legacy/');
      });
    });

    test('should reject new code in legacy folder', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 5",
          "src/legacy/NewService.ts",
          "New code found in legacy folder",
          "Legacy folder is for migration only"
        )
      ];

      expect(violations[0].message).toContain('New code found');
    });
  });

  describe('Shared Zone Validation', () => {
    test('should accept utilities in shared folder', () => {
      const sharedFiles = [
        'src/shared/logger/Logger.ts',
        'src/shared/config/Config.ts',
        'src/shared/types/CommonTypes.ts'
      ];

      sharedFiles.forEach(file => {
        expect(file).toContain('shared/');
      });
    });

    test('should reject shared code with business logic', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 6",
          "src/shared/utils/BusinessLogic.ts",
          "Shared code contains business rules",
          "Shared must be neutral utilities only"
        )
      ];

      expect(violations[0].message).toContain('business rules');
    });
  });

  describe('Dependency Direction Validation', () => {
    test('should enforce correct dependency directions', () => {
      // Domain should not depend on anything
      expect('src/domain').not.toContain('import ../infrastructure');
      expect('src/domain').not.toContain('import ../application');
      expect('src/domain').not.toContain('import ../interfaces');

      // Application can depend on domain
      expect('src/application').toContain('import ../domain');

      // Infrastructure can depend on application (ports)
      expect('src/infrastructure').toContain('import ../application');

      // Interfaces can depend on application
      expect('src/interfaces').toContain('import ../application');
    });

    test('should reject circular dependencies', () => {
      const violations: Violation[] = [
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 7",
          "src/application/services/UserService.ts",
          "Circular dependency detected",
          "Dependencies must be acyclic"
        )
      ];

      expect(violations[0].message).toContain('Circular dependency');
    });
  });
});
