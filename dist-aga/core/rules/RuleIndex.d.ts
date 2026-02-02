/**
 * Index officiel de toutes les règles AGA
 * Point unique de vérité pour le RuleRegistry
 */
import { ArchitectureRule } from '../types/rule.interface.js';
/**
 * Liste officielle de toutes les règles AGA v0.1
 * ✔ Toutes les règles sont actives par défaut
 * ✔ Chaque règle a un ID unique
 * ✔ Chaque règle est indépendante et réutilisable
 */
export declare const ALL_AGA_RULES: ArchitectureRule[];
export declare function getRulesIndex(): Map<string, ArchitectureRule>;
//# sourceMappingURL=RuleIndex.d.ts.map