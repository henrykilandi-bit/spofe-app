import { Violation } from "../../core/Violation";
import { Nature } from "../../core/NatureDetector";
import { FORBIDDEN_WORDS } from "../../lexicon/forbidden-words";

/**
 * SILC v2 — Article 7
 * Relations doivent suivre pattern PascalCase.relation.ts
 */
export class RelationNamingRule {
  static check(file: string, nature: Nature): Violation[] {
    if (nature !== "RELATION") return [];

    const violations: Violation[] = [];
    const fileName = file.split(/[\\/]/).pop() || "";
    const relationName = fileName.replace(".relation.ts", "");

    // Check forbidden words
    for (const word of FORBIDDEN_WORDS) {
      if (relationName.includes(word)) {
        violations.push(
          new Violation(
            "BLOCKING",
            "SILC v2 — Article 7",
            file,
            `Mot interdit "${word}" dans le nom de relation`,
            "NAMING",
            `Relation doit nommer une association entre entités`,
            `Renommer sans verbes d'action (ex: UserRoleAssignment)`
          )
        );
      }
    }

    // Check PascalCase
    if (!/^[A-Z][a-zA-Z0-9]*$/.test(relationName)) {
      violations.push(
        new Violation(
          "WARNING",
          "SILC v2 — Article 7",
          file,
          `Relation "${relationName}" ne suit pas le pattern PascalCase`,
          "NAMING",
          `Format: PascalCase.relation.ts`,
          `Renommer en: ${relationName.charAt(0).toUpperCase() + relationName.slice(1)}`
        )
      );
    }

    return violations;
  }
}
