"use strict";
/**
 * Prometheus Metrics - Module Budget
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 5
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.budgetMetrics = void 0;
exports.getMetricsRegistry = getMetricsRegistry;
const prom_client_1 = require("prom-client");
const register = new prom_client_1.Registry();
exports.budgetMetrics = {
    commandsTotal: new prom_client_1.Counter({
        name: 'budget_commands_total',
        help: 'Total budget commands executed',
        labelNames: ['command_type', 'status', 'tenant_id'],
        registers: [register],
    }),
    commandDuration: new prom_client_1.Histogram({
        name: 'budget_command_duration_seconds',
        help: 'Budget command execution duration',
        labelNames: ['command_type'],
        buckets: [0.1, 0.5, 1, 2, 5],
        registers: [register],
    }),
    guardianRejections: new prom_client_1.Counter({
        name: 'budget_guardian_rejections_total',
        help: 'Total Guardian rejections',
        labelNames: ['invariant_code', 'tenant_id'],
        registers: [register],
    }),
    activeReadModels: new prom_client_1.Gauge({
        name: 'budget_active_read_models',
        help: 'Number of active read-model queries',
        registers: [register],
    }),
    rlsViolations: new prom_client_1.Counter({
        name: 'budget_rls_violations_total',
        help: 'Total RLS policy violations',
        labelNames: ['tenant_id'],
        registers: [register],
    }),
};
function getMetricsRegistry() {
    return register;
}
//# sourceMappingURL=prometheus-metrics.js.map