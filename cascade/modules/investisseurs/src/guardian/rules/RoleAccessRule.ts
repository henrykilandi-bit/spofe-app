import { GuardianRule } from "../GuardianRule";

export class RoleAccessRule implements GuardianRule<any> {
  private allowedRoles = ["ENTREPRENEUR", "COACH", "SYSTEM"];

  validate(command: any): void {
    if (!this.allowedRoles.includes(command.actorRole)) {
      throw new Error(
        `Guardian rejection: role '${command.actorRole}' not allowed` 
      );
    }
  }
}
