export type Severity = "BLOCKING" | "WARNING" | "INFO";
export type RuleCategory = "STRUCTURE" | "NAMING" | "AST" | "COMPLIANCE" | "LEGACY";

export class Violation {
  constructor(
    public readonly severity: Severity,
    public readonly article: string,
    public readonly file: string,
    public readonly message: string,
    public readonly category: RuleCategory,
    public readonly expected?: string,
    public readonly migrationTarget?: string
  ) {}

  toJSON() {
    return {
      severity: this.severity,
      article: this.article,
      file: this.file,
      message: this.message,
      category: this.category,
      expected: this.expected,
      migrationTarget: this.migrationTarget
    };
  }
}
