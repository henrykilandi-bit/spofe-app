import { GuardianRule } from "../GuardianRule";

export class NoFinancialComputationRule implements GuardianRule<any> {
  private forbiddenFields = [
    "valuation",
    "irr",
    "moic",
    "dividend",
    "discountRate",
    "cashFlow",
    "projection",
  ];

  validate(command: any): void {
    for (const key of Object.keys(command)) {
      if (this.forbiddenFields.includes(key)) {
        throw new Error(
          `Guardian rejection: financial computation field '${key}' is forbidden` 
        );
      }
    }
  }
}
