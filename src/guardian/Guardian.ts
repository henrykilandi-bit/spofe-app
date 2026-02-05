/**
 * 🛡️ GUARDIAN INTERFACE
 * Interface pour les gardiens SPOFE
 */

export interface Guardian {
  validate(command?: any): Promise<boolean>;
}
