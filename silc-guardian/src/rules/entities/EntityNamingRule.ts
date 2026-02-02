import { Violation } from "../../core/Violation";
import { Nature } from "../../core/NatureDetector";
import { FORBIDDEN_WORDS } from "../../lexicon/forbidden-words";
import { ALLOWED_CONTRACTS } from "../../lexicon/allowed-contracts";

/**
 * SILC v2 — Article 5
 * Entités doivent être nommées d'après un contrat autorisé
 */
export class EntityNamingRule {
  static check(file: string, nature: Nature): Violation[] {
    if (nature !== "ENTITY") return [];

    const violations: Violation[] = [];
    const fileName = file.split(/[\\/]/).pop() || "";
    const entityName = fileName.replace(".entity.ts", "");

    // Check forbidde words
    for (const word of FORBIDDEN_WORDS) {
      if (entityName.includes(word)) {
        violations.push(
          new Violation(
            "BLOCKING",
            "SILC v2 — Article 5",
            file,
            `Mot interdit "${word}" dans le nom d'entité`,
            "NAMING",
            `Entité doit utiliser contrat + suffixe .entity.ts`,
            `Renommer avec un contrat autorisé: ${ALLOWED_CONTRACTS.slice(0, 3).join(", ")}...`
          )
        );
      }
    }

    // Check if name matches allowed contract
    const isValidContract = ALLOWED_CONTRACTS.some(
      contract => entityName === contract || entityName.includes(contract)
    );

    if (!isValidContract) {
      violations.push(
        new Violation(
          "BLOCKING",
          "SILC v2 — Article 5",
          file,
          `Entité "${entityName}" ne correspond à aucun contrat autorisé`,
          "NAMING",
          `Doit correspondre à: ${ALLOWED_CONTRACTS.join(", ")}`,
          `Utiliser un des contrats: ${ALLOWED_CONTRACTS.join(", ")}`
        )
      );
    }

    return violations;
  }
}
