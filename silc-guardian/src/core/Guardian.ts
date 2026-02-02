import { glob } from "glob";
import { readdirSync, statSync } from "fs";
import { join } from "path";
import { Violation } from "./Violation";
import { NatureDetector } from "./NatureDetector";
import { StructureRule } from "../rules/structure/StructureRule";
import { EntityNamingRule } from "../rules/entities/EntityNamingRule";
import { RelationNamingRule } from "../rules/relations/RelationNamingRule";
import { ProcessRule } from "../rules/processes/ProcessRule";
import { DtoRule } from "../rules/dtos/DtoRule";
import { ServiceRule } from "../rules/services/ServiceRule";
import { RepositoryRule } from "../rules/repositories/RepositoryRule";
import { AstRule } from "../rules/ast/AstRule";
import { LegacyAuditMode } from "../compliance/LegacyAuditMode";
import { ComplianceSignature } from "../compliance/ComplianceSignature";

export interface GuardianOptions {
  mode?: "standard" | "legacy";
  enableAst?: boolean;
  generateSignature?: boolean;
  root?: string;
}

/**
 * Guardian — Orchestrateur principal
 * Coordonne tous les validateurs et applique les règles SILC v2
 */
export class Guardian {
  private options: GuardianOptions = {
    mode: "standard",
    enableAst: true,
    generateSignature: true,
    root: "src"
  };

  constructor(options?: GuardianOptions) {
    this.options = { ...this.options, ...options };
  }

  validate(root?: string): Violation[] {
    const searchRoot = root || this.options.root || "src";
    const files = this.findTypeScriptFiles(searchRoot);
    const violations: Violation[] = [];

    console.log(`🔍 Analyse de ${files.length} fichiers...`);

    for (const file of files) {
      const nature = NatureDetector.detect(file);

      // Règles structurelles et lexicales
      violations.push(
        ...StructureRule.check(file, nature),
        ...EntityNamingRule.check(file, nature),
        ...RelationNamingRule.check(file, nature),
        ...ProcessRule.check(file, nature),
        ...DtoRule.check(file, nature),
        ...ServiceRule.check(file, nature),
        ...RepositoryRule.check(file, nature)
      );

      // Analyse AST (niveau 2 d'intelligence)
      if (this.options.enableAst) {
        violations.push(...AstRule.check(file, nature));
      }
    }

    // Application du mode legacy si activé
    if (this.options.mode === "legacy") {
      return LegacyAuditMode.filterViolations(violations, true);
    }

    return violations;
  }

  generateSignature(violations: Violation[]): void {
    if (!this.options.generateSignature) return;

    const signature = ComplianceSignature.generate(
      violations,
      this.options.mode
    );
    ComplianceSignature.write(signature);
  }

  getMigrationPlan(violations: Violation[]): any {
    return LegacyAuditMode.generateMigrationPlan(violations);
  }

  hasBlockingViolations(violations: Violation[]): boolean {
    return violations.some(v => v.severity === "BLOCKING");
  }

  private findTypeScriptFiles(rootDir: string): string[] {
    const files: string[] = [];
    
    const explore = (dir: string) => {
      try {
        const entries = readdirSync(dir);
        for (const entry of entries) {
          const fullPath = join(dir, entry);
          const stat = statSync(fullPath);
          
          if (stat.isDirectory() && !entry.startsWith(".") && entry !== "node_modules" && entry !== "dist") {
            explore(fullPath);
          } else if (entry.endsWith(".ts") && !entry.endsWith(".d.ts")) {
            files.push(fullPath);
          }
        }
      } catch (error) {
        // Ignore directories we can't read
      }
    };
    
    explore(rootDir);
    return files;
  }}