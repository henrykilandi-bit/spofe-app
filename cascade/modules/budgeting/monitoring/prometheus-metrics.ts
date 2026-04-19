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

  businessMetrics: new Gauge({
    name: 'budget_business_kpis',
    help: 'Business KPIs for budgeting',
    labelNames: ['metric_type', 'tenant_id'],
    registers: [register],
  }),

  tenantActivity: new Gauge({
    name: 'budget_tenant_activity',
    help: 'Active tenants using budget module',
    registers: [register],
  }),
};

// Instrumenter les métriques métier
export function recordBusinessMetrics(tenantId: string, metrics: {
  totalBudgets: number;
  activeBudgets: number;
  budgetVariance: number;
}) {
  budgetMetrics.businessMetrics
    .labels('total_budgets', tenantId)
    .set(metrics.totalBudgets);
    
  budgetMetrics.businessMetrics
    .labels('active_budgets', tenantId)
    .set(metrics.activeBudgets);
    
  budgetMetrics.businessMetrics
    .labels('budget_variance', tenantId)
    .set(metrics.budgetVariance);
}

// Instrumenter les commandes
export function recordCommand(
  commandType: string, 
  tenantId: string, 
  status: 'success' | 'error',
  duration: number
) {
  budgetMetrics.commandsTotal
    .labels(commandType, status, tenantId)
    .inc();
    
  budgetMetrics.commandDuration
    .labels(commandType)
    .observe(duration);
}

// Instrumenter les violations Guardian
export function recordGuardianRejection(
  invariantCode: string, 
  tenantId: string
) {
  budgetMetrics.guardianRejections
    .labels(invariantCode, tenantId)
    .inc();
}

// Instrumenter les violations RLS
export function recordRLSViolation(tenantId: string) {
  budgetMetrics.rlsViolations
    .labels(tenantId)
    .inc();
}

export function getMetricsRegistry(): Registry {
  return register;
}
