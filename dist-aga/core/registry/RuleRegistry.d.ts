/**
 * Registre central des règles AGA
 * Point unique de vérité pour toutes les règles
 */
import { ArchitectureRule } from '../types/rule.interface.js';
export declare class RuleRegistry {
    private readonly rules;
    register(rule: ArchitectureRule): void;
    registerMany(rules: ArchitectureRule[]): void;
    getAll(): ArchitectureRule[];
    getForFileType(fileType: string): ArchitectureRule[];
    hasRule(id: string): boolean;
    getById(id: string): ArchitectureRule | undefined;
    count(): number;
}
//# sourceMappingURL=RuleRegistry.d.ts.map