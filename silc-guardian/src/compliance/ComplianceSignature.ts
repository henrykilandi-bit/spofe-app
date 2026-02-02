import { writeFileSync, existsSync, mkdirSync } from "fs";
import { dirname } from "path";
import { Violation } from "../core/Violation";

export interface ComplianceSignature {
  status: "COMPLIANT" | "NON_COMPLIANT" | "LEGACY_MODE";
  silcVersion: "2.0";
  guardianVersion: string;
  timestamp: string;
  commit?: string;
  violations: number;
  blockingViolations: number;
  signedAt: string;
  validUntil?: string;
}

/**
 * ComplianceSignature — Signature officielle SILC
 * Rend la conformité traçable et opposable
 */
export class ComplianceSignature {
  static readonly COMPLIANCE_FILE = "architecture/compliance/SILC_COMPLIANCE.json";
  private static readonly GUARDIAN_VERSION = "1.0.0";

  static generate(violations: Violation[], mode: "standard" | "legacy" = "standard"): ComplianceSignature {
    const blocking = violations.filter(v => v.severity === "BLOCKING").length;
    const isCompliant = blocking === 0;

    const signature: ComplianceSignature = {
      status:
        isCompliant
          ? "COMPLIANT"
          : mode === "legacy"
            ? "LEGACY_MODE"
            : "NON_COMPLIANT",
      silcVersion: "2.0",
      guardianVersion: this.GUARDIAN_VERSION,
      timestamp: new Date().toISOString(),
      violations: violations.length,
      blockingViolations: blocking,
      signedAt: new Date().toISOString(),
      validUntil: this.getValidUntil()
    };

    return signature;
  }

  static write(signature: ComplianceSignature, filePath = this.COMPLIANCE_FILE) {
    const dir = dirname(filePath);

    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }

    writeFileSync(filePath, JSON.stringify(signature, null, 2), "utf-8");
    console.log(`✅ Signature SILC écrite: ${filePath}`);
  }

  static verify(filePath = this.COMPLIANCE_FILE): boolean {
    if (!existsSync(filePath)) {
      console.log(
        `❌ Aucune signature SILC trouvée — Non conforme\n`
      );
      return false;
    }

    try {
      const content = require(filePath);
      if (content.status === "COMPLIANT") {
        console.log(
          `✅ Signature SILC valide (${content.timestamp})\n`
        );
        return true;
      } else {
        console.log(
          `⚠️  Non compliant — dernière vérification: ${content.timestamp}\n`
        );
        return false;
      }
    } catch (error) {
      console.log(`❌ Erreur lecture signature SILC\n`);
      return false;
    }
  }

  private static getValidUntil(): string {
    const date = new Date();
    date.setDate(date.getDate() + 7); // Valide 7 jours
    return date.toISOString();
  }
}
