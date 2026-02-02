/**
 * Formateur de rapports (console)
 */
export class ReportFormatter {
    static format(report) {
        if (report.isCompliant) {
            return '✅ AGA — Aucun écart architectural détecté';
        }
        const lines = [];
        lines.push('📊 AGA — Rapport architectural enrichi');
        lines.push(`🕒 ${report.timestamp}`);
        lines.push(`📁 Fichiers analysés: ${report.totalFilesAnalyzed}`);
        lines.push(`🚨 Violations: ${report.totalViolations}`);
        lines.push('');
        // Par sévérité
        for (const severity of report.bySeverity) {
            lines.push(`🔴 Sévérité: ${severity.severity.toUpperCase()} (${severity.count})`);
            for (const rule of severity.rules) {
                lines.push(`  └─ ${rule.ruleId} — ${rule.ruleName}`);
                for (const v of rule.occurrences.slice(0, 3)) { // Afficher max 3 premiers
                    const loc = v.location
                        ? `:${v.location.line}:${v.location.column}`
                        : '';
                    lines.push(`     • ${v.location.filePath}${loc}`);
                }
                if (rule.occurrences.length > 3) {
                    lines.push(`     ... et ${rule.occurrences.length - 3} autres`);
                }
            }
            lines.push('');
        }
        return lines.join('\n');
    }
    static printToConsole(report) {
        console.log(this.format(report));
    }
}
//# sourceMappingURL=ReportFormatter.js.map