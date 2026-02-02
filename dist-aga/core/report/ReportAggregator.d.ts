/**
 * Agrégateur de rapports
 * Transforme violations plates en vision architecturale
 */
import { ArchitectureViolation } from '../types/architecture.types.js';
import { EnrichedReport } from './ReportTypes.js';
export declare class ReportAggregator {
    static build(filesAnalyzed: number, violations: ArchitectureViolation[]): EnrichedReport;
}
//# sourceMappingURL=ReportAggregator.d.ts.map