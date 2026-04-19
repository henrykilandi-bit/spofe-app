import { GuardianRule } from "./GuardianRule";
import { AppendOnlyRule } from "./rules/AppendOnlyRule";
import { NoFinancialComputationRule } from "./rules/NoFinancialComputationRule";
import { RoleAccessRule } from "./rules/RoleAccessRule";
import { ValidDocumentRule } from "./rules/ValidDocumentRule";
import { TenantIsolationRule } from "./rules/TenantIsolationRule";

export class InvestisseursGuardian<TCommand> {
  private rules: GuardianRule<TCommand>[] = [
    new AppendOnlyRule(),
    new NoFinancialComputationRule(),
    new TenantIsolationRule(),
    new RoleAccessRule(),
    new ValidDocumentRule(),
  ];

  validate(command: TCommand): void {
    for (const rule of this.rules) {
      rule.validate(command);
    }
  }
}
