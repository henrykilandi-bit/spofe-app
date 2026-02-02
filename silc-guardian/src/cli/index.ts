#!/usr/bin/env node
import { Guardian } from "../core/Guardian";
import { ConsoleReporter } from "../reporters/ConsoleReporter";
import { JsonReporter } from "../reporters/JsonReporter";
import { ComplianceSignature } from "../compliance/ComplianceSignature";

interface CliArgs {
  command: string;
  mode?: "standard" | "legacy";
  report?: "console" | "json";
  root?: string;
  verbose?: boolean;
}

function parseArgs(): CliArgs {
  const args = process.argv.slice(2);
  const result: CliArgs = {
    command: args[0] || "validate"
  };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === "--mode=legacy") {
      result.mode = "legacy";
    } else if (arg === "--report=json") {
      result.report = "json";
    } else if (arg.startsWith("--root=")) {
      result.root = arg.split("=")[1];
    } else if (arg === "-v" || arg === "--verbose") {
      result.verbose = true;
    }
  }

  return result;
}

function showUsage() {
  console.log(`
🛡️  SILC Guardian v1.0.0

Usage:
  silc-guardian validate          Valide l'architecture SILC
  silc-guardian check-compliance  Vérifie la signature SILC
  silc-guardian help              Affiche l'aide

Options:
  --mode=legacy                   Mode de transition legacy (warnings au lieu de blocking)
  --report=json                   Sortie JSON (au lieu de console)
  --root=<path>                   Chemin racine à analyser (défaut: src)
  -v, --verbose                   Mode verbeux (détails supplémentaires)

Examples:
  silc-guardian validate
  silc-guardian validate --mode=legacy
  silc-guardian validate --report=json
  silc-guardian check-compliance
  `);
}

function main() {
  const args = parseArgs();

  if (args.command === "help" || args.command === "-h" || args.command === "--help") {
    showUsage();
    process.exit(0);
  }

  if (args.command === "check-compliance") {
    const isCompliant = ComplianceSignature.verify();
    process.exit(isCompliant ? 0 : 1);
  }

  if (args.command !== "validate") {
    console.error(`❌ Commande inconnue: ${args.command}\n`);
    showUsage();
    process.exit(1);
  }

  // Commande validate
  try {
    const guardian = new Guardian({
      mode: args.mode || "standard",
      enableAst: true,
      generateSignature: true,
      root: args.root || "src"
    });

    const violations = guardian.validate(args.root);

    if (args.report === "json") {
      JsonReporter.report(violations);
    } else {
      ConsoleReporter.report(violations, args.verbose);
      ConsoleReporter.summary(violations);
    }

    guardian.generateSignature(violations);

    // Mode legacy: afficher plan de migration
    if (args.mode === "legacy") {
      console.log("\n📋 PLAN DE MIGRATION LEGACY:\n");
      const plan = guardian.getMigrationPlan(violations);
      console.log(JSON.stringify(plan, null, 2));
    }

    const hasBlocking = guardian.hasBlockingViolations(violations);
    process.exit(hasBlocking ? 1 : 0);
  } catch (error) {
    console.error("❌ Erreur lors de la validation:", error);
    process.exit(1);
  }
}

main();
