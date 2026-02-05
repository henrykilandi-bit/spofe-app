"use strict";
/**
 * Cost-Structure Module - Aggregate: CostStructure
 * Conformité: COUTFLEX Specification
 * Principe: Versioning strict, FROZEN = immutable
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.CostStructure = void 0;
const value_objects_1 = require("./value-objects");
/**
 * CostStructure - Aggregate (versionné)
 */
class CostStructure {
    constructor(costStructureId, projectId, version, tenantId, status, costLines, assumptions, computedMetrics, createdBy, createdAt, frozenAt, frozenBy) {
        this.costStructureId = costStructureId;
        this.projectId = projectId;
        this.version = version;
        this.tenantId = tenantId;
        this.status = status;
        this.costLines = costLines;
        this.assumptions = assumptions;
        this.computedMetrics = computedMetrics;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.frozenAt = frozenAt;
        this.frozenBy = frozenBy;
    }
    /**
     * COUT-CS-03: Vérifier immutabilité FROZEN
     */
    assertNotFrozen() {
        if (this.status === 'FROZEN') {
            throw new Error('COST_STRUCTURE_FROZEN: Cannot modify FROZEN cost structure');
        }
    }
    /**
     * Créer une nouvelle structure de coûts
     */
    static create(costStructureId, projectId, version, tenantId, actorId) {
        const now = new Date();
        const aggregate = new CostStructure(costStructureId, projectId, version, tenantId, 'DRAFT', [], null, null, actorId, now);
        const events = [
            {
                type: 'CostStructureCreated',
                projectId,
                version,
                createdBy: actorId,
                createdAt: now,
            },
        ];
        return { aggregate, events };
    }
    /**
     * Ajouter une ligne de coût
     * COUT-CS-02: amount > 0, category valide
     */
    addCostLine(category, label, amount, allocationRule, actorId) {
        this.assertNotFrozen();
        const costLine = new value_objects_1.CostLine(category, label, amount, allocationRule);
        this.costLines.push(costLine);
        const now = new Date();
        return [
            {
                type: 'CostLineAdded',
                projectId: this.projectId,
                version: this.version,
                category,
                label,
                amount: amount.amount,
                currency: amount.currency,
                allocationRule,
                addedBy: actorId,
                addedAt: now,
            },
        ];
    }
    /**
     * Mettre à jour les hypothèses économiques
     * COUT-CS-04: Hypothèses complètes
     */
    updateAssumptions(assumptions, actorId) {
        this.assertNotFrozen();
        this.assumptions = assumptions;
        const now = new Date();
        return [
            {
                type: 'AssumptionsUpdated',
                projectId: this.projectId,
                version: this.version,
                priceTarget: assumptions.priceTarget.amount,
                expectedVolume: assumptions.expectedVolume.value,
                capacityMax: assumptions.capacityMax.value,
                scenarios: {
                    pessimistic: assumptions.scenarios.pessimistic,
                    realistic: assumptions.scenarios.realistic,
                    optimistic: assumptions.scenarios.optimistic,
                },
                updatedBy: actorId,
                updatedAt: now,
            },
        ];
    }
    /**
     * Exécuter la simulation
     * COUT-SIM-01: Calcul reproductible
     * COUT-01: Test 70% calculé
     */
    runSimulation(metrics, actorId) {
        this.assertNotFrozen();
        if (!this.assumptions) {
            throw new Error('ASSUMPTIONS_REQUIRED: Cannot simulate without assumptions');
        }
        if (this.costLines.length === 0) {
            throw new Error('COST_LINES_REQUIRED: Cannot simulate without cost lines');
        }
        this.computedMetrics = metrics;
        const now = new Date();
        return [
            {
                type: 'CostStructureSimulated',
                projectId: this.projectId,
                version: this.version,
                metrics: {
                    unitCost: metrics.unitCost.amount,
                    totalCost: metrics.totalCost.amount,
                    grossMargin: metrics.grossMargin,
                    netMargin: metrics.netMargin,
                    marginAt70: metrics.marginAt70,
                },
                viableAt70: metrics.viableAt70,
                simulatedBy: actorId,
                simulatedAt: now,
            },
        ];
    }
    /**
     * Geler la structure de coûts
     * COUT-01: Test 70% doit être OK
     */
    freeze(actorId) {
        this.assertNotFrozen();
        if (!this.computedMetrics) {
            throw new Error('SIMULATION_REQUIRED: Cannot freeze without simulation');
        }
        if (this.computedMetrics.marginAt70 <= 0) {
            throw new Error(`COUT_01_VIOLATION: Margin at 70% is ${this.computedMetrics.marginAt70.toFixed(2)}% (must be > 0)`);
        }
        this.status = 'FROZEN';
        const now = new Date();
        this.frozenAt = now;
        this.frozenBy = actorId;
        return [
            {
                type: 'CostStructureFrozen',
                projectId: this.projectId,
                version: this.version,
                frozenBy: actorId,
                frozenAt: now,
            },
        ];
    }
    /**
     * Vérifier si la structure est prête pour Budget
     * COUT-BUD-01: FROZEN + viable
     */
    isBudgetReady() {
        return (this.status === 'FROZEN' &&
            this.computedMetrics !== null &&
            this.computedMetrics.viableAt70 === true);
    }
    /**
     * Obtenir le résumé pour audit
     */
    getSummary() {
        return {
            version: this.version,
            status: this.status,
            costLinesCount: this.costLines.length,
            totalCost: this.computedMetrics?.totalCost.amount || null,
            marginAt70: this.computedMetrics?.marginAt70 || null,
            viableAt70: this.computedMetrics?.viableAt70 || null,
        };
    }
}
exports.CostStructure = CostStructure;
//# sourceMappingURL=cost-structure.aggregate.js.map