#!/usr/bin/env node

/**
 * Script de test SILC Guardian
 * Valide les règles sur des exemples synthétiques
 */

import { Guardian } from "../dist/core/Guardian";
import { ConsoleReporter } from "../dist/reporters/ConsoleReporter";
import { Violation } from "../dist/core/Violation";

const mockViolations: Violation[] = [
  new Violation(
    "BLOCKING",
    "SILC v2 — Article 8",
    "src/models/User.entity.ts",
    "Entité hors de domain/entities",
    "STRUCTURE",
    "Doit être dans domain/entities"
  ),
  new Violation(
    "BLOCKING",
    "SILC v2 — Article 5",
    "src/domain/entities/AdminUser.entity.ts",
    'Mot interdit "Admin" dans le nom d\'entité',
    "NAMING",
    'Utiliser contrat autorisé'
  ),
  new Violation(
    "WARNING",
    "SILC v2 — Article 7",
    "src/domain/relations/userRole.relation.ts",
    "Relation ne suit pas le pattern PascalCase",
    "NAMING",
    "Format: PascalCase.relation.ts"
  ),
  new Violation(
    "BLOCKING",
    "SILC v2 — Article 6 (AST)",
    "src/application/services/ApprovalService.ts",
    'Service contient logique décisionnaire: approve, reject',
    "AST",
    "Services = orchestration, pas de décision"
  )
];

console.log("🧪 Test SILC Guardian Report\n");
ConsoleReporter.report(mockViolations, true);
ConsoleReporter.summary(mockViolations);

console.log("\n✅ Test terminé");
