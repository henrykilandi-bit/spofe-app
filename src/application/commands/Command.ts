/**
 * 📋 COMMAND INTERFACE
 * Interface pour les commandes SPOFE
 */

export interface Command {
  aggregateId: string;
  aggregateType: string;
  type: string;
  payload: any;
  userId?: string;
  guardian: {
    validate(command?: any): Promise<boolean>;
  };
}
