import { ALLOWED_CONTRACTS } from "../lexicon/allowed-contracts";

export class ContractRegistry {
  static isKnownContract(name: string): boolean {
    return ALLOWED_CONTRACTS.includes(name);
  }

  static getAllContracts(): string[] {
    return [...ALLOWED_CONTRACTS];
  }

  static validate(contractName: string): { valid: boolean; message?: string } {
    if (this.isKnownContract(contractName)) {
      return { valid: true };
    }
    return {
      valid: false,
      message: `Contrat inconnu: ${contractName}. Contrats autorisés: ${ALLOWED_CONTRACTS.join(", ")}`
    };
  }
}
