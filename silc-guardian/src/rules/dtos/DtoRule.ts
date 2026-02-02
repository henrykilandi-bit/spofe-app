import { Violation } from "../../core/Violation";
import { Nature } from "../../core/NatureDetector";
import { FORBIDDEN_WORDS } from "../../lexicon/forbidden-words";

/**
 * SILC v2 — Article 9
 * DTO = Data Transfer Object (structuration applicative)
 */
export class DtoRule {
  static check(file: string, nature: Nature): Violation[] {
    if (nature !== "DTO") return [];

    const violations: Violation[] = [];
    const fileName = file.split(/[\\/]/).pop() || "";
    const dtoName = fileName.replace("Dto.ts", "");

    // Check forbidden words
    const forbiddenInDto = ["Approve", "Grant", "Assign", "Delete", "Workflow"];
    for (const word of forbiddenInDto) {
      if (dtoName.includes(word)) {
        violations.push(
          new Violation(
            "BLOCKING",
            "SILC v2 — Article 9",
            file,
            `DTO ne doit pas contenir "${word}"`,
            "NAMING",
            `DTO = structuration de données, pas logique métier`,
            `Renommer en: [Contrat]Dto ou [Contrat]ResponseDto`
          )
        );
      }
    }

    // Check suffix
    if (!fileName.endsWith("Dto.ts")) {
      violations.push(
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 9",
          file,
          `DTO doit terminer par "Dto.ts"`,
          "NAMING",
          `Format: [Name]Dto.ts`,
          `Renommer avec suffixe Dto.ts`
        )
      );
    }

    return violations;
  }
}
