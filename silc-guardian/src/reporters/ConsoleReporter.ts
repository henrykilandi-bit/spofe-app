import { Violation } from "../core/Violation";

/**
 * ConsoleReporter — Sortie lisible pour terminal
 */
export class ConsoleReporter {
  static report(violations: Violation[], verbose = false) {
    if (violations.length === 0) {
      console.log("✅ Aucune violation détectée — SILC compliant\n");
      return;
    }

    const blocking = violations.filter(v => v.severity === "BLOCKING");
    const warnings = violations.filter(v => v.severity === "WARNING");
    const infos = violations.filter(v => v.severity === "INFO");

    console.log("\n🛡️  RAPPORT SILC GUARDIAN\n");
    console.log(`Fichiers analysés: OK`);
    console.log(`Violations trouvées: ${violations.length}\n`);

    if (blocking.length > 0) {
      console.log(`🚫 BLOCKING (${blocking.length}):`);
      blocking.forEach(v => this.printViolation(v, verbose));
    }

    if (warnings.length > 0) {
      console.log(`\n⚠️  WARNINGS (${warnings.length}):`);
      warnings.forEach(v => this.printViolation(v, verbose));
    }

    if (infos.length > 0) {
      console.log(`\nℹ️  INFO (${infos.length}):`);
      infos.forEach(v => this.printViolation(v, verbose));
    }

    console.log("\n" + "=".repeat(70) + "\n");
  }

  private static printViolation(v: Violation, verbose: boolean) {
    console.log(`  [${v.article}] ${v.file}`);
    console.log(`    📌 ${v.message}`);
    if (verbose && v.expected) {
      console.log(`    ✓ Attendu: ${v.expected}`);
    }
    if (verbose && v.migrationTarget) {
      console.log(`    🔄 Migration: ${v.migrationTarget}`);
    }
  }

  static summary(violations: Violation[]) {
    const blocking = violations.filter(v => v.severity === "BLOCKING").length;
    const warnings = violations.filter(v => v.severity === "WARNING").length;

    if (blocking === 0) {
      console.log("\n✅ SILC COMPLIANT — Merge autorisé\n");
      return false;
    }

    console.log(
      `\n❌ ${blocking} BLOCKING violation(s) — Merge REJETÉ\n`
    );
    return true;
  }
}
