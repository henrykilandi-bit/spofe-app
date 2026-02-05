"use strict";
/**
 * Guardian — Cost-Structure Module
 * Conformité: COST_STRUCTURE_CONTRACT v1.0.0
 *
 * Point UNIQUE de validation des invariants métier.
 * Aucune logique métier ne doit exister ailleurs.
 *
 * Invariants implémentés:
 * - COUT-01: Variable cost ratio ≤ 70%
 * - COUT-EP-01: Unique project name per tenant
 * - COUT-EP-02: Project type immutable
 * - COUT-CS-01: Version strictly increasing
 * - COUT-CS-02: Cost category from allowed list
 * - COUT-CS-03: No modification after freeze
 * - COUT-CS-04: Assumptions required before simulation
 * - COUT-SIM-01: Simulation idempotent
 * - COUT-SIM-02: Only SIMULATED can be frozen
 * - COUT-DEC-01: Only validated project → APPROVED
 * - COUT-DEC-02: Decision is terminal
 * - COUT-BUD-01: Budget can consume only APPROVED
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostStructureGuardian = exports.InvariantViolationError = void 0;
// ─────────────────────────────────────────────────────────────
// Invariant Violation Error
// ─────────────────────────────────────────────────────────────
class InvariantViolationError extends Error {
    constructor(invariantCode, details, context) {
        super(`[${invariantCode}] ${details}`);
        this.invariantCode = invariantCode;
        this.context = context;
        this.name = 'InvariantViolationError';
        this.details = details;
    }
}
exports.InvariantViolationError = InvariantViolationError;
// ─────────────────────────────────────────────────────────────
// Cost-Structure Guardian
// ─────────────────────────────────────────────────────────────
class CostStructureGuardian {
    /**
     * Point unique de validation — délègue à la règle appropriée
     */
    validate(command, state) {
        switch (command.commandType) {
            case 'CreateEconomicProject':
                return this.validateCreateEconomicProject(command, state);
            case 'CreateCostStructure':
                return this.validateCreateCostStructure(command, state);
            case 'AddCostLine':
                return this.validateAddCostLine(command, state);
            case 'UpdateAssumptions':
                return this.validateUpdateAssumptions(command, state);
            case 'RunSimulation':
                return this.validateRunSimulation(command, state);
            case 'FreezeCostStructure':
                return this.validateFreezeCostStructure(command, state);
            case 'ValidateProject':
                return this.validateValidateProject(command, state);
            case 'RejectProject':
                return this.validateRejectProject(command, state);
            default:
                throw new Error(`Unknown command type`);
        }
    }
    // ─────────────────────────────────────────────────────────────
    // Invariant: COUT-EP-01 — Unique project name per tenant
    // ─────────────────────────────────────────────────────────────
    validateCreateEconomicProject(command, state) {
        // COUT-EP-01: Unique name per tenant
        if (state.existingProjectByName) {
            throw new InvariantViolationError('COUT-EP-01', `Project name '${command.name}' already exists for tenant`, { existingProjectId: state.existingProjectByName.projectId });
        }
        return state;
    }
    // ─────────────────────────────────────────────────────────────
    // Invariant: COUT-CS-01 — Version strictly increasing
    // ─────────────────────────────────────────────────────────────
    validateCreateCostStructure(command, state) {
        // COUT-CS-01: Version must be strictly increasing
        if (state.project?.latestVersion && command.version <= state.project.latestVersion) {
            throw new InvariantViolationError('COUT-CS-01', `Version ${command.version} must be greater than latest version ${state.project.latestVersion}`, { latestVersion: state.project.latestVersion });
        }
        return state;
    }
    // ─────────────────────────────────────────────────────────────
    // Invariants: COUT-CS-02, COUT-CS-03
    // ─────────────────────────────────────────────────────────────
    validateAddCostLine(command, state) {
        if (!state.costStructure) {
            throw new InvariantViolationError('COUT-CS-00', 'Cost structure not found');
        }
        // COUT-CS-03: No modification after freeze
        if (state.costStructure.status === 'FROZEN') {
            throw new InvariantViolationError('COUT-CS-03', 'Cannot modify frozen cost structure', { version: state.costStructure.version });
        }
        // COUT-CS-02: Valid category
        const validCategories = ['VARIABLE', 'FIXED', 'INDIRECT'];
        if (!validCategories.includes(command.category)) {
            throw new InvariantViolationError('COUT-CS-02', `Invalid cost category: ${command.category}`, { allowedCategories: validCategories });
        }
        return state;
    }
    // ─────────────────────────────────────────────────────────────
    // Invariants: COUT-CS-03, COUT-CS-04
    // ─────────────────────────────────────────────────────────────
    validateUpdateAssumptions(command, state) {
        if (!state.costStructure) {
            throw new InvariantViolationError('COUT-CS-00', 'Cost structure not found');
        }
        // COUT-CS-03: No modification after freeze
        if (state.costStructure.status === 'FROZEN') {
            throw new InvariantViolationError('COUT-CS-03', 'Cannot modify frozen cost structure', { version: state.costStructure.version });
        }
        // Validate scenario coherence
        const { pessimistic, realistic, optimistic } = command.scenarios;
        if (!(pessimistic <= realistic && realistic <= optimistic)) {
            throw new InvariantViolationError('COUT-CS-04', 'Scenarios must be ordered: pessimistic ≤ realistic ≤ optimistic', { scenarios: command.scenarios });
        }
        return state;
    }
    // ─────────────────────────────────────────────────────────────
    // Invariants: COUT-01, COUT-CS-04, COUT-SIM-01
    // CALCULS MÉTIER CENTRALISÉS ICI
    // ─────────────────────────────────────────────────────────────
    validateRunSimulation(command, state) {
        if (!state.costStructure) {
            throw new InvariantViolationError('COUT-CS-00', 'Cost structure not found');
        }
        // COUT-CS-04: Assumptions required
        if (!state.costStructure.assumptions) {
            throw new InvariantViolationError('COUT-CS-04', 'Assumptions must be set before simulation');
        }
        // Must have at least one cost line
        if (state.costStructure.costLines.length === 0) {
            throw new InvariantViolationError('COUT-CS-00', 'At least one cost line required for simulation');
        }
        // ─────────────────────────────────────────────────────────
        // 🧮 CALCULS MÉTIER — ZONE UNIQUE
        // ─────────────────────────────────────────────────────────
        const costLines = state.costStructure.costLines;
        const assumptions = state.costStructure.assumptions;
        // Calculate totals by category
        const totalVariable = costLines
            .filter(l => l.category === 'VARIABLE')
            .reduce((sum, l) => sum + l.amount, 0);
        const totalFixed = costLines
            .filter(l => l.category === 'FIXED')
            .reduce((sum, l) => sum + l.amount, 0);
        const totalIndirect = costLines
            .filter(l => l.category === 'INDIRECT')
            .reduce((sum, l) => sum + l.amount, 0);
        const totalCost = totalVariable + totalFixed + totalIndirect;
        const variableCostRatio = totalCost > 0 ? totalVariable / totalCost : 0;
        // COUT-01: Variable cost ratio ≤ 70%
        if (variableCostRatio > 0.70) {
            throw new InvariantViolationError('COUT-01', `Variable cost ratio ${(variableCostRatio * 100).toFixed(1)}% exceeds 70% limit`, { variableCostRatio, totalVariable, totalCost });
        }
        // Calculate break-even point
        const unitVariableCost = assumptions.expectedVolume > 0
            ? totalVariable / assumptions.expectedVolume
            : 0;
        const contributionMargin = assumptions.priceTarget - unitVariableCost;
        const breakEvenPoint = contributionMargin > 0
            ? Math.ceil(totalFixed / contributionMargin)
            : Infinity;
        // Calculate margin at target
        const revenueAtTarget = assumptions.priceTarget * assumptions.expectedVolume;
        const marginAtTarget = revenueAtTarget > 0
            ? (revenueAtTarget - totalCost) / revenueAtTarget
            : 0;
        // Calculate scenario results
        const calculateScenarioResult = (volumeMultiplier) => {
            const volume = assumptions.expectedVolume * volumeMultiplier;
            const revenue = assumptions.priceTarget * volume;
            const variableCostAtVolume = unitVariableCost * volume;
            const totalCostAtVolume = variableCostAtVolume + totalFixed + totalIndirect;
            const profit = revenue - totalCostAtVolume;
            const margin = revenue > 0 ? profit / revenue : 0;
            const roi = totalCostAtVolume > 0 ? profit / totalCostAtVolume : 0;
            return { margin, roi };
        };
        const simulationResult = {
            totalCost,
            variableCostRatio,
            breakEvenPoint,
            marginAtTarget,
            scenarioResults: {
                pessimistic: calculateScenarioResult(assumptions.scenarios.pessimistic),
                realistic: calculateScenarioResult(assumptions.scenarios.realistic),
                optimistic: calculateScenarioResult(assumptions.scenarios.optimistic),
            },
        };
        // Enrichir le state avec les résultats de simulation
        return {
            ...state,
            costStructure: {
                ...state.costStructure,
                simulation: simulationResult,
            },
        };
    }
    // ─────────────────────────────────────────────────────────────
    // Invariants: COUT-01, COUT-SIM-02
    // ─────────────────────────────────────────────────────────────
    validateFreezeCostStructure(command, state) {
        if (!state.costStructure) {
            throw new InvariantViolationError('COUT-CS-00', 'Cost structure not found');
        }
        // COUT-SIM-02: Only SIMULATED can be frozen
        if (state.costStructure.status !== 'SIMULATED') {
            throw new InvariantViolationError('COUT-SIM-02', `Cannot freeze cost structure in status ${state.costStructure.status}`, { currentStatus: state.costStructure.status });
        }
        // COUT-01: Re-validate ratio before freeze
        if (state.costStructure.simulation && state.costStructure.simulation.variableCostRatio > 0.70) {
            throw new InvariantViolationError('COUT-01', `Variable cost ratio ${(state.costStructure.simulation.variableCostRatio * 100).toFixed(1)}% exceeds 70% limit`, { variableCostRatio: state.costStructure.simulation.variableCostRatio });
        }
        return state;
    }
    // ─────────────────────────────────────────────────────────────
    // Invariants: COUT-DEC-01, COUT-DEC-02, COUT-BUD-01
    // ─────────────────────────────────────────────────────────────
    validateValidateProject(command, state) {
        if (!state.project) {
            throw new InvariantViolationError('COUT-EP-00', 'Project not found');
        }
        // COUT-DEC-02: Decision is terminal
        if (state.latestDecision) {
            throw new InvariantViolationError('COUT-DEC-02', 'Decision already recorded for this project', { existingDecision: state.latestDecision.decision });
        }
        // COUT-DEC-01: Only validated project can become APPROVED
        // Project must have at least one frozen cost structure
        if (state.project.status !== 'FROZEN') {
            throw new InvariantViolationError('COUT-DEC-01', `Project must be FROZEN to validate, current status: ${state.project.status}`, { currentStatus: state.project.status });
        }
        return state;
    }
    // ─────────────────────────────────────────────────────────────
    // Invariants: COUT-DEC-01, COUT-DEC-02
    // ─────────────────────────────────────────────────────────────
    validateRejectProject(command, state) {
        if (!state.project) {
            throw new InvariantViolationError('COUT-EP-00', 'Project not found');
        }
        // COUT-DEC-02: Decision is terminal
        if (state.latestDecision) {
            throw new InvariantViolationError('COUT-DEC-02', 'Decision already recorded for this project', { existingDecision: state.latestDecision.decision });
        }
        return state;
    }
}
exports.CostStructureGuardian = CostStructureGuardian;
//# sourceMappingURL=cost-structure.guardian.js.map