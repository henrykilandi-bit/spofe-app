import { Violation } from "../core/Violation";

/**
 * LegacyAuditMode — Transition contrôlée legacy → SILC
 * Permet de coexister du code legacy avec du code conforme SILC
 */
export class LegacyAuditMode {
  // Chemins whitelistés en mode legacy
  static readonly LEGACY_PATHS = [
    "src/controllers/**",
    "src/models/**",
    "src/services/legacy/**",
    "src/utils/**",
    "src/helpers/**",
    "legacy/**"
  ];

  static isLegacyPath(filePath: string): boolean {
    const normalized = filePath.replace(/\\/g, "/");
    return this.LEGACY_PATHS.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*/g, ".*"));
      return regex.test(normalized);
    });
  }

  static convertToWarning(violation: Violation): Violation {
    if (this.isLegacyPath(violation.file)) {
      return new Violation(
        "WARNING",
        violation.article,
        violation.file,
        violation.message + " [LEGACY WHITELIST]",
        violation.category,
        violation.expected,
        violation.migrationTarget
      );
    }
    return violation;
  }

  static filterViolations(
    violations: Violation[],
    legacyMode: boolean
  ): Violation[] {
    if (!legacyMode) return violations;

    return violations.map(v => {
      if (this.isLegacyPath(v.file) && v.severity === "BLOCKING") {
        return this.convertToWarning(v);
      }
      return v;
    });
  }

  static generateMigrationPlan(violations: Violation[]): any {
    const legacyViolations = violations.filter(v =>
      this.isLegacyPath(v.file)
    );

    const plan: Record<string, any[]> = {};

    legacyViolations.forEach(v => {
      if (!plan[v.file]) {
        plan[v.file] = [];
      }
      plan[v.file].push({
        violation: v.message,
        migrationTarget: v.migrationTarget || "À déterminer",
        priority: v.severity === "BLOCKING" ? "HIGH" : "MEDIUM"
      });
    });

    return {
      timestamp: new Date().toISOString(),
      totalLegacyFiles: Object.keys(plan).length,
      migrationItems: plan,
      estimatedEffort: `${Math.ceil(Object.keys(plan).length / 5)} sprints`
    };
  }
}
