import { Violation } from "../../core/Violation";
import { Nature } from "../../core/NatureDetector";
import { FORBIDDEN_WORDS } from "../../lexicon/forbidden-words";

/**
 * SILC v2 — Article 6
 * Service = orchestration, JAMAIS décision métier
 */
export class ServiceRule {
  static check(file: string, nature: Nature): Violation[] {
    if (nature !== "SERVICE") return [];

    const violations: Violation[] = [];
    const fileName = file.split(/[\\/]/).pop() || "";
    const serviceName = fileName.replace("Service.ts", "");

    // Check if ends with Service
    if (!fileName.endsWith("Service.ts")) {
      violations.push(
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 6",
          file,
          `Service doit terminer par "Service.ts"`,
          "NAMING",
          `Format: [Name]Service.ts`,
          `Renommer avec suffixe Service.ts`
        )
      );
    }

    // Services must be in application/services
    if (!file.includes("/application/services/")) {
      violations.push(
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 6",
          file,
          `Service hors de application/services`,
          "STRUCTURE",
          `Services toujours en application/services`,
          `Déplacer à application/services/`
        )
      );
    }

    // Check forbidden decision words
    const decisionWords = ["Decide", "Approve", "Reject", "Grant", "Revoke"];
    for (const word of decisionWords) {
      if (serviceName.includes(word)) {
        violations.push(
          new Violation(
            "WARNING",
            "SILC v2 — Article 6",
            file,
            `Service semble contenir logique décisionnaire: "${word}"`,
            "NAMING",
            `Services = orchestration seulement`,
            `Extraire la décision dans un Process`
          )
        );
      }
    }

    return violations;
  }
}
