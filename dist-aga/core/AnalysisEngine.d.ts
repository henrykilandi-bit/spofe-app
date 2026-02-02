/**
 * Moteur d'analyse AGA
 * Orchestre scanner → règles → rapport enrichi
 */
import { AnalysisReport, FileAnalysisResult } from './types/architecture.types.js';
export declare class AnalysisEngine {
    private registry;
    constructor();
    /**
     * Analyse un fichier unique
     */
    analyzeFile(filePath: string): FileAnalysisResult;
    /**
     * Analyse tous les fichiers dans un répertoire
     */
    analyzeDirectory(rootDir: string): AnalysisReport;
    /**
     * Construit le rapport enrichi
     */
    private buildReport;
}
//# sourceMappingURL=AnalysisEngine.d.ts.map