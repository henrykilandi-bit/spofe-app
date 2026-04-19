import { GuardianRule } from "../GuardianRule";

export class AppendOnlyRule<T> implements GuardianRule<T> {
  validate(_: T): void {
    // Toute commande est supposée créer un nouvel état
    // Toute tentative de "update" serait détectée au niveau application
    return;
  }
}
