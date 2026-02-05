/**
 * Commands Index — Cost-Structure Module
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 */

export { CreateEconomicProjectCommand } from './create-economic-project.command.js';
export { CreateCostStructureCommand } from './create-cost-structure.command.js';
export { AddCostLineCommand, type CostCategory } from './add-cost-line.command.js';
export { UpdateAssumptionsCommand, type ScenarioSet } from './update-assumptions.command.js';
export { RunSimulationCommand } from './run-simulation.command.js';
export { FreezeCostStructureCommand } from './freeze-cost-structure.command.js';
export { ValidateProjectCommand } from './validate-project.command.js';
export { RejectProjectCommand } from './reject-project.command.js';

export type CostStructureCommand =
  | import('./create-economic-project.command.js').CreateEconomicProjectCommand
  | import('./create-cost-structure.command.js').CreateCostStructureCommand
  | import('./add-cost-line.command.js').AddCostLineCommand
  | import('./update-assumptions.command.js').UpdateAssumptionsCommand
  | import('./run-simulation.command.js').RunSimulationCommand
  | import('./freeze-cost-structure.command.js').FreezeCostStructureCommand
  | import('./validate-project.command.js').ValidateProjectCommand
  | import('./reject-project.command.js').RejectProjectCommand;
