import { Violation } from "../core/Violation";

interface JsonReport {
  status: "COMPLIANT" | "VIOLATIONS";
  timestamp: string;
  totalViolations: number;
  violations: {
    blocking: any[];
    warnings: any[];
    info: any[];
  };
  summary: {
    byCategory: Record<string, number>;
    bySeverity: Record<string, number>;
  };
}

/**
 * JsonReporter — Sortie JSON pour CI/CD
 */
export class JsonReporter {
  static report(violations: Violation[]): JsonReport {
    const blocking = violations.filter(v => v.severity === "BLOCKING");
    const warnings = violations.filter(v => v.severity === "WARNING");
    const infos = violations.filter(v => v.severity === "INFO");

    const byCategory = violations.reduce((acc, v) => {
      acc[v.category] = (acc[v.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const bySeverity = {
      BLOCKING: blocking.length,
      WARNING: warnings.length,
      INFO: infos.length
    };

    const report: JsonReport = {
      status: blocking.length === 0 ? "COMPLIANT" : "VIOLATIONS",
      timestamp: new Date().toISOString(),
      totalViolations: violations.length,
      violations: {
        blocking: blocking.map(v => v.toJSON()),
        warnings: warnings.map(v => v.toJSON()),
        info: infos.map(v => v.toJSON())
      },
      summary: {
        byCategory,
        bySeverity
      }
    };

    console.log(JSON.stringify(report, null, 2));
    return report;
  }
}
