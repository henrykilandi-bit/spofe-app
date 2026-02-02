/**
 * Registre central des règles AGA
 * Point unique de vérité pour toutes les règles
 */

import { ArchitectureRule } from '../types/rule.interface.js';

export class RuleRegistry {
  private readonly rules: Map<string, ArchitectureRule> = new Map();

  /* ---------------------------
     Enregistrement d'une règle
     --------------------------- */
  register(rule: ArchitectureRule): void {
    if (this.rules.has(rule.id)) {
      throw new Error(
        `AGA RuleRegistry: règle déjà enregistrée (${rule.id})`
      );
    }

    this.rules.set(rule.id, rule);
  }

  /* ---------------------------
     Enregistrement multiple
     --------------------------- */
  registerMany(rules: ArchitectureRule[]): void {
    rules.forEach(rule => this.register(rule));
  }

  /* ---------------------------
     Récupération globale
     --------------------------- */
  getAll(): ArchitectureRule[] {
    return Array.from(this.rules.values());
  }

  /* ---------------------------
     Sélection par type de fichier
     --------------------------- */
  getForFileType(fileType: string): ArchitectureRule[] {
    return this.getAll().filter(rule =>
      rule.targetFileTypes.includes(fileType)
    );
  }

  /* ---------------------------
     Vérification d'existence
     --------------------------- */
  hasRule(id: string): boolean {
    return this.rules.has(id);
  }

  /* ---------------------------
     Accès direct (debug / test)
     --------------------------- */
  getById(id: string): ArchitectureRule | undefined {
    return this.rules.get(id);
  }

  /* ---------------------------
     Compteur
     --------------------------- */
  count(): number {
    return this.rules.size;
  }
}
