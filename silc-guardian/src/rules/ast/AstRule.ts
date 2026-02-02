import { Violation } from "../../core/Violation";
import { Nature } from "../../core/NatureDetector";
import { AstAnalyzer } from "./AstAnalyzer";

/**
 * AstRule — Analyse sémantique intelligente
 * Détecte les violations qui ne peuvent pas être contournées par renommage
 */
export class AstRule {
  static check(file: string, nature: Nature): Violation[] {
    const violations: Violation[] = [];

    const ast = AstAnalyzer.parseFile(file);
    if (!ast) return violations; // Erreur parsing

    const methods = AstAnalyzer.extractClassMethods(ast);
    const classNames = AstAnalyzer.extractClassNames(ast);

    // Règle 1: Entity ne doit jamais exécuter d'actions
    if (nature === "ENTITY") {
      const actionMethods = methods.filter(m =>
        ["create", "assign", "approve", "grant", "delete", "execute"].includes(
          m.toLowerCase()
        )
      );

      if (actionMethods.length > 0) {
        violations.push(
          new Violation(
            "BLOCKING",
            "SILC v2 — Article 5 (AST)",
            file,
            `Entité contient logique d'action: ${actionMethods.join(", ")}`,
            "AST",
            `Entités = structure pure, pas d'exécution`,
            `Extraire les actions dans un Process ou Service`
          )
        );
      }
    }

    // Règle 2: Service ne doit jamais décider
    if (nature === "SERVICE") {
      const decisionMethods = methods.filter(m =>
        ["decide", "approve", "reject", "validate", "authorize"].includes(
          m.toLowerCase()
        )
      );

      if (decisionMethods.length > 0) {
        violations.push(
          new Violation(
            "BLOCKING",
            "SILC v2 — Article 6 (AST)",
            file,
            `Service contient logique décisionnaire: ${decisionMethods.join(", ")}`,
            "AST",
            `Services = orchestration, pas de décision`,
            `Extraire la décision dans un Process`
          )
        );
      }
    }

    // Règle 3: Process doit contenir au moins une logique métier
    if (nature === "PROCESS") {
      const hasLogic =
        methods.length > 0 ||
        (classNames.length > 0 && file.includes("execute"));

      if (methods.length === 0) {
        violations.push(
          new Violation(
            "INFO",
            "SILC v2 — Article 4 (AST)",
            file,
            `Processus ne contient pas de méthodes`,
            "AST",
            `Processus doit définir un gouvernement`,
            `Ajouter des méthodes de logique métier`
          )
        );
      }
    }

    return violations;
  }
}
