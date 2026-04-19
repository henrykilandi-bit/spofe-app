import { GuardianRule } from "../GuardianRule";

export class ValidDocumentRule implements GuardianRule<any> {
  validate(command: any): void {
    if (
      command.documentStatus &&
      command.documentStatus !== "VALIDATED"
    ) {
      throw new Error(
        "Guardian rejection: document must be VALIDATED before exposure"
      );
    }
  }
}
