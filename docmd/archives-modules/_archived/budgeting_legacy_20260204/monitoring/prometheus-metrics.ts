/**
 * Prometheus Metrics - Module Budget
 * Conformité: MODULE_BUDGET_CONTRACT.md - LOT 5
 */

import { Counter, Histogram, Gauge, Registry } from 'prom-client';

const register = new Registry();

export const budgetMetrics = {
  commandsTotal: new Counter({
    name: 'budget_commands_total',
    help: 'Total budget commands executed',
    labelNames: ['command_type', 'status', 'tenant_id'],
    registers: [register],
  }),

  commandDuration: new Histogram({
    name: 'budget_command_duration_seconds',
    help: 'Budget command execution duration',
    labelNames: ['command_type'],
    buckets: [0.1, 0.5, 1, 2, 5],
    registers: [register],
  }),

  guardianRejections: new Counter({
    name: 'budget_guardian_rejections_total',
    help: 'Total Guardian rejections',
    labelNames: ['invariant_code', 'tenant_id'],
    registers: [register],
  }),

  activeReadModels: new Gauge({
    name: 'budget_active_read_models',
    help: 'Number of active read-model queries',
    registers: [register],
  }),

  rlsViolations: new Counter({
    name: 'budget_rls_violations_total',
    help: 'Total RLS policy violations',
    labelNames: ['tenant_id'],
    registers: [register],
  }),
};

export function getMetricsRegistry(): Registry {
  return register;
}
