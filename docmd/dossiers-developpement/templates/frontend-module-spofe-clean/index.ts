/**
 * Module Entry Point
 *
 * This file is the public API of the module.
 * It should only contain registration functions.
 *
 * ❌ NO business logic
 * ❌ NO API calls
 * ❌ NO conditional logic
 *
 * See: SPOFE Frontend Module Contract v1.0.0, Section 4 (Structure)
 */

import { registerRoutes } from './routes/module.routes';

/**
 * Register this module with the application.
 *
 * @example
 * ```typescript
 * import { registerModule as registerBudgetingModule } from './modules/budgeting';
 *
 * registerBudgetingModule();
 * ```
 */
export function registerModule() {
  registerRoutes();
}

export { ModuleView } from './ui/ModuleView';
export { loadModuleData, handleUserAction } from './ui/module.ui';
export { useModuleUI } from './hooks/useModuleUI';
