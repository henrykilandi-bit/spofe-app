import { Violation } from "../../core/Violation";
import { Nature } from "../../core/NatureDetector";

/**
 * SILC v2 — Article 10
 * Repository = accès données, PAS logique métier
 */
export class RepositoryRule {
  static check(file: string, nature: Nature): Violation[] {
    if (nature !== "REPOSITORY") return [];

    const violations: Violation[] = [];
    const fileName = file.split(/[\\/]/).pop() || "";

    // Check if ends with Repository
    if (!fileName.endsWith("Repository.ts")) {
      violations.push(
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 10",
          file,
          `Repository doit terminer par "Repository.ts"`,
          "NAMING",
          `Format: [Entity]Repository.ts`,
          `Renommer avec suffixe Repository.ts`
        )
      );
    }

    // Repositories must be in infrastructure/repositories
    if (!file.includes("/infrastructure/repositories/")) {
      violations.push(
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 10",
          file,
          `Repository hors de infrastructure/repositories`,
          "STRUCTURE",
          `Repositories toujours en infrastructure/repositories`,
          `Déplacer à infrastructure/repositories/`
        )
      );
    }

    // Repository must relate to an entity
    const repositoryName = fileName.replace("Repository.ts", "");
    if (!repositoryName) {
      violations.push(
        new Violation(
          "WARNING",
          "SILC v2 — Article 10",
          file,
          `Repository doit avoir un préfixe significatif`,
          "NAMING",
          `Pattern: [Entity]Repository.ts`,
          `Renommer: UserRepository.ts, CompanyRepository.ts, etc.`
        )
      );
    }

    return violations;
  }
}
