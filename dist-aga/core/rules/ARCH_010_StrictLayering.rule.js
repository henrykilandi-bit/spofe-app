/**
 * ARCH_010 — Strict Layering Enforcement
 * Domain cannot depend on Application or Infrastructure
 */
import { Severity } from '../types/architecture.types.js';
const LAYER_ORDER = {
    domain: 1,
    application: 2,
    infrastructure: 3
};
export const ARCH_010_StrictLayering = {
    id: 'ARCH_010',
    name: 'Strict Layering Enforcement',
    description: 'Enforce unidirectional dependency: domain -> application -> infrastructure',
    severity: Severity.ERROR,
    targetFileTypes: ['unknown'],
    check(context) {
        const violations = [];
        if (!context.layer || context.layer === 'unknown') {
            return violations;
        }
        const currentLayer = context.layer;
        const currentRank = LAYER_ORDER[currentLayer];
        // Domain cannot depend on Application or Infrastructure
        if (currentLayer === 'domain') {
            if (context.fileContent.includes("from '@/application") ||
                context.fileContent.includes("from '@/infrastructure")) {
                violations.push({
                    ruleId: this.id,
                    ruleName: this.name,
                    severity: Severity.ERROR,
                    message: `Violation de layering: ${currentLayer} ne peut pas dépendre de couches supérieures`,
                    location: {
                        filePath: context.filePath,
                        line: 1,
                        column: 1
                    },
                    autoFixable: false,
                    category: 'layer'
                });
            }
        }
        return violations;
    }
};
//# sourceMappingURL=ARCH_010_StrictLayering.rule.js.map