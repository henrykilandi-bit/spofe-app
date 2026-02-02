import { Violation } from "../../core/Violation";
import { Nature } from "../../core/NatureDetector";

/**
 * SILC v2 — Article 8
 * Structure de répertoires obligatoire
 */
export class StructureRule {
  static check(file: string, nature: Nature): Violation[] {
    const violations: Violation[] = [];
    const normalizedPath = file.replace(/\\/g, "/");

    const structureRules: Record<Nature, string[]> = {
      ENTITY: ["domain/entities"],
      RELATION: ["domain/relations"],
      PROCESS: ["domain/processes"],
      DTO: ["application/dtos"],
      SERVICE: ["application/services"],
      REPOSITORY: ["infrastructure/repositories"],
      UNKNOWN: []
    };

    if (nature !== "UNKNOWN") {
      const allowedDirs = structureRules[nature];
      const matchesStructure = allowedDirs.some(dir =>
        normalizedPath.includes(`/${dir}/`)
      );

      if (!matchesStructure) {
        violations.push(
          new Violation(
            "BLOCKING",
            "SILC v2 — Article 8",
            file,
            `Fichier ${nature} hors de sa structure obligatoire`,
            "STRUCTURE",
            `Doit être dans: ${allowedDirs.join(" ou ")}`,
            `Déplacer vers ${allowedDirs[0]}/`
          )
        );
      }
    }

    return violations;
  }
}
