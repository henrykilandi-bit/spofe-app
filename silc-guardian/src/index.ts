/**
 * Index principal — Export de tous les modules publics
 */
export { Guardian, GuardianOptions } from "./core/Guardian";
export { Violation } from "./core/Violation";
export { NatureDetector, Nature } from "./core/NatureDetector";
export { ContractRegistry } from "./core/ContractRegistry";

export { ConsoleReporter } from "./reporters/ConsoleReporter";
export { JsonReporter } from "./reporters/JsonReporter";

export { ComplianceSignature } from "./compliance/ComplianceSignature";
export { LegacyAuditMode } from "./compliance/LegacyAuditMode";

export { AstAnalyzer } from "./rules/ast/AstAnalyzer";
export { AstRule } from "./rules/ast/AstRule";
