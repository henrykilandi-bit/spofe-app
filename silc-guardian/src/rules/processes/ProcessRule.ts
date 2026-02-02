import { Violation } from "../../core/Violation";
import { Nature } from "../../core/NatureDetector";
import { FORBIDDEN_WORDS } from "../../lexicon/forbidden-words";
import { ALLOWED_CONTRACTS } from "../../lexicon/allowed-contracts";

/**
 * SILC v2 — Article 4
 * Processus gouvernés basés sur contrats et verbes métier
 */
export class ProcessRule {
  static check(file: string, nature: Nature): Violation[] {
    if (nature !== "PROCESS") return [];

    const violations: Violation[] = [];
    const fileName = file.split(/[\\/]/).pop() || "";
    const processName = fileName.replace(".process.ts", "");

    // Check forbidden words (ces mots ne doivent pas être dans un processus)
    const forbiddenInProcess = ["Approve", "Grant", "Assign", "Create", "Update", "Delete"];
    for (const word of forbiddenInProcess) {
      if (processName.includes(word)) {
        violations.push(
          new Violation(
            "BLOCKING",
            "SILC v2 — Article 4",
            file,
            `Mot d'action "${word}" dans un processus`,
            "NAMING",
            `Processus doit nommer un gouvernement métier`,
            `Renommer avec contrat + contexte (ex: CompanyOnboarding.process.ts)`
          )
        );
      }
    }

    // Check if starts with allowed contract + Onboarding/Registration/etc.
    const hasValidPrefix = ALLOWED_CONTRACTS.some(contract => processName.startsWith(contract));

    if (!hasValidPrefix) {
      violations.push(
        new Violation(
          "WARNING",
          "SILC v2 — Article 4",
          file,
          `Processus ne commence pas par un contrat`,
          "NAMING",
          `Pattern: [Contract][Verb]Process.ts`,
          `Renommer: ${ALLOWED_CONTRACTS[0]}Onboarding.process.ts`
        )
      );
    }

    return violations;
  }
}
