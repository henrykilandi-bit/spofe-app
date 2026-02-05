/**
 * Controllers Barrel Export
 * cascade/modules/cost-structure/api/http/controllers/index.ts
 * 
 * ✅ Export centralisé de tous les controllers HTTP
 * ✅ Facilite l'import dans le module NestJS
 */

// ─────────────────────────────────────────────────────────────
// READ CONTROLLERS (Query Side)
// ─────────────────────────────────────────────────────────────
export { CostProjectsController } from './cost-projects.controller.js';
export { CostStructureController } from './cost-structure.controller.js';

// ─────────────────────────────────────────────────────────────
// BUDGET INTEGRATION CONTROLLER (Contract COUT-BUD-01)
// ─────────────────────────────────────────────────────────────
export { BudgetReadyController } from './budget-ready.controller.js';
