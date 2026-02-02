export type Nature =
  | "ENTITY"
  | "RELATION"
  | "PROCESS"
  | "DTO"
  | "SERVICE"
  | "REPOSITORY"
  | "UNKNOWN";

export class NatureDetector {
  static detect(filePath: string): Nature {
    const lowerPath = filePath.toLowerCase();

    if (lowerPath.endsWith(".entity.ts")) return "ENTITY";
    if (lowerPath.endsWith(".relation.ts")) return "RELATION";
    if (lowerPath.endsWith(".process.ts")) return "PROCESS";
    if (lowerPath.endsWith("dto.ts")) return "DTO";
    if (lowerPath.endsWith("service.ts")) return "SERVICE";
    if (lowerPath.endsWith("repository.ts")) return "REPOSITORY";

    return "UNKNOWN";
  }

  static getExpectedDirectory(nature: Nature): string {
    const mapping: Record<Nature, string> = {
      ENTITY: "domain/entities",
      RELATION: "domain/relations",
      PROCESS: "domain/processes",
      DTO: "application/dtos",
      SERVICE: "application/services",
      REPOSITORY: "infrastructure/repositories",
      UNKNOWN: "unknown"
    };
    return mapping[nature];
  }

  static getFileExtension(nature: Nature): string {
    const mapping: Record<Nature, string> = {
      ENTITY: ".entity.ts",
      RELATION: ".relation.ts",
      PROCESS: ".process.ts",
      DTO: "Dto.ts",
      SERVICE: "Service.ts",
      REPOSITORY: "Repository.ts",
      UNKNOWN: ".ts"
    };
    return mapping[nature];
  }
}
