#!/usr/bin/env node
/**
 * AGA CLI v0.1
 * Outil autonome d'analyse architecturale SPOFE/SILC
 */
import { AnalysisEngine } from './core/AnalysisEngine.js';
import { ReportAggregator } from './core/report/ReportAggregator.js';
import { ReportFormatter } from './core/report/ReportFormatter.js';
function main() {
    const args = process.argv.slice(2);
    if (args.length === 0) {
        console.log('Usage: aga <directory>');
        console.log('Example: aga src');
        process.exit(1);
    }
    const targetDir = args[0];
    console.log(`🔍 AGA v0.1 — Analyse architecturale SPOFE/SILC`);
    console.log(`📂 Cible: ${targetDir}\n`);
    const engine = new AnalysisEngine();
    const analysisReport = engine.analyzeDirectory(targetDir);
    const enrichedReport = ReportAggregator.build(analysisReport.files.length, analysisReport.files.flatMap(f => f.violations));
    ReportFormatter.printToConsole(enrichedReport);
    // Exit code
    if (!enrichedReport.isCompliant) {
        const hasBlockers = enrichedReport.bySeverity.some(s => s.severity === 'error' || s.severity === 'blocker');
        process.exit(hasBlockers ? 1 : 0);
    }
}
main();
//# sourceMappingURL=cli.js.map