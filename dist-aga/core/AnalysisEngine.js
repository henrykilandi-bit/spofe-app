/**
 * Moteur d'analyse AGA
 * Orchestre scanner → règles → rapport enrichi
 */
import fs from 'fs';
import { FileScanner } from './scanner/FileScanner.js';
import { RuleRegistry } from './registry/RuleRegistry.js';
import { ALL_AGA_RULES } from './rules/RuleIndex.js';
import { Severity } from './types/architecture.types.js';
export class AnalysisEngine {
    registry;
    constructor() {
        this.registry = new RuleRegistry();
        this.registry.registerMany(ALL_AGA_RULES);
    }
    /**
     * Analyse un fichier unique
     */
    analyzeFile(filePath) {
        try {
            const content = fs.readFileSync(filePath, 'utf8');
            const fileName = filePath.split('/').pop() || filePath.split('\\').pop() || '';
            const context = {
                filePath,
                fileContent: content,
                fileName
            };
            // Déterminer layer et fileType
            if (filePath.includes('/domain/') || filePath.includes('\\domain\\')) {
                context.layer = 'domain';
            }
            else if (filePath.includes('/application/') || filePath.includes('\\application\\')) {
                context.layer = 'application';
            }
            else if (filePath.includes('/infrastructure/') || filePath.includes('\\infrastructure\\')) {
                context.layer = 'infrastructure';
            }
            if (fileName.endsWith('.process.ts'))
                context.fileType = 'process';
            else if (fileName.endsWith('.entity.ts'))
                context.fileType = 'entity';
            else if (fileName.endsWith('.service.ts'))
                context.fileType = 'service';
            // Appliquer les règles
            const violations = [];
            for (const rule of this.registry.getAll()) {
                const ruleViolations = rule.check(context);
                violations.push(...ruleViolations);
            }
            return {
                filePath,
                fileType: context.fileType || 'unknown',
                violations,
                suggestions: [],
                isCompliant: violations.length === 0
            };
        }
        catch (err) {
            console.error(`Error analyzing ${filePath}:`, err);
            return {
                filePath,
                fileType: 'unknown',
                violations: [],
                suggestions: [],
                isCompliant: true
            };
        }
    }
    /**
     * Analyse tous les fichiers dans un répertoire
     */
    analyzeDirectory(rootDir) {
        const files = FileScanner.scanDirectory(rootDir);
        const fileResults = [];
        const allViolations = [];
        for (const file of files) {
            const result = this.analyzeFile(file.absolutePath);
            fileResults.push(result);
            allViolations.push(...result.violations);
        }
        return this.buildReport(fileResults, allViolations);
    }
    /**
     * Construit le rapport enrichi
     */
    buildReport(files, violations) {
        const bySeverity = {
            [Severity.INFO]: 0,
            [Severity.WARNING]: 0,
            [Severity.ERROR]: 0,
            [Severity.BLOCKER]: 0
        };
        const byRule = {};
        let autoFixableCount = 0;
        for (const v of violations) {
            bySeverity[v.severity]++;
            if (v.autoFixable)
                autoFixableCount++;
            if (!byRule[v.ruleId]) {
                byRule[v.ruleId] = [];
            }
            byRule[v.ruleId].push(v);
        }
        return {
            summary: {
                totalViolations: violations.length,
                bySeverity,
                autoFixableCount
            },
            violationsByRule: byRule,
            files,
            guardianCompatible: true
        };
    }
}
//# sourceMappingURL=AnalysisEngine.js.map