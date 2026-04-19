/**
 * Prometheus Metrics - Module Budget
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 5
 */
import { Counter, Histogram, Gauge, Registry } from 'prom-client';
export declare const budgetMetrics: {
    commandsTotal: Counter<"command_type" | "status" | "tenant_id">;
    commandDuration: Histogram<"command_type">;
    guardianRejections: Counter<"tenant_id" | "invariant_code">;
    activeReadModels: Gauge<string>;
    rlsViolations: Counter<"tenant_id">;
};
export declare function getMetricsRegistry(): Registry;
//# sourceMappingURL=prometheus-metrics.d.ts.map