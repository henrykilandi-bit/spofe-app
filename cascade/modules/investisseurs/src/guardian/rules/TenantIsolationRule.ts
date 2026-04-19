import { GuardianRule } from "../GuardianRule";

export class TenantIsolationRule implements GuardianRule<any> {
  validate(command: any): void {
    if (!command.tenantId) {
      throw new Error(
        "Guardian rejection: tenantId is mandatory"
      );
    }
  }
}
