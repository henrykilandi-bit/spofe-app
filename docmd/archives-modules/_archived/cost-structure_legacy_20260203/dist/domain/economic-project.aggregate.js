"use strict";
/**
 * Cost-Structure Module - Aggregate Root: EconomicProject
 * Conformité: COUTFLEX Specification
 * Principe: Aggregate = source de vérité, état + comportements
 * Invariants: COUT-PROJ-01, COUT-PROJ-02, COUT-PROJ-03
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.EconomicProject = void 0;
const value_objects_1 = require("./value-objects");
const invariants_1 = require("./invariants");
/**
 * EconomicProject - Aggregate Root
 */
class EconomicProject {
    constructor(projectId, tenantId, name, type, status, versions, createdBy, createdAt, validatedAt, validatedBy, rejectedAt, rejectedBy, rejectionReason) {
        this.projectId = projectId;
        this.tenantId = tenantId;
        this.name = name;
        this.type = type;
        this.status = status;
        this.versions = versions;
        this.createdBy = createdBy;
        this.createdAt = createdAt;
        this.validatedAt = validatedAt;
        this.validatedBy = validatedBy;
        this.rejectedAt = rejectedAt;
        this.rejectedBy = rejectedBy;
        this.rejectionReason = rejectionReason;
    }
    /**
     * COUT-PROJ-03: Vérifier immutabilité post-décision
     */
    assertNotTerminal() {
        if ((0, invariants_1.isTerminalStatus)(this.status)) {
            throw new Error(`PROJECT_IMMUTABLE: Project is ${this.status} and cannot be modified (COUT-PROJ-03)`);
        }
    }
    /**
     * COUT-PROJ-02: Vérifier transition de statut autorisée
     */
    assertStatusTransition(newStatus) {
        if (!(0, invariants_1.isStatusTransitionAllowed)(this.status, newStatus)) {
            throw new Error(`INVALID_STATUS_TRANSITION: Cannot transition from ${this.status} to ${newStatus} (COUT-PROJ-02)`);
        }
    }
    /**
     * Obtenir la version courante (dernière FROZEN)
     */
    getCurrentVersion() {
        const frozenVersions = this.versions.filter((v) => v.status === 'FROZEN');
        return frozenVersions.length > 0 ? frozenVersions[frozenVersions.length - 1] : null;
    }
    /**
     * Vérifier si le projet est prêt pour Budget
     * COUT-BUD-01: status=VALIDATED + structure=FROZEN
     */
    isBudgetReady() {
        if (this.status !== 'VALIDATED') {
            return false;
        }
        const currentVersion = this.getCurrentVersion();
        if (!currentVersion) {
            return false;
        }
        return (currentVersion.status === 'FROZEN' &&
            currentVersion.simulationMetrics !== undefined &&
            currentVersion.simulationMetrics.viableAt70 === true);
    }
    /**
     * Créer un nouveau projet économique
     */
    static create(projectId, tenantId, name, type, actorId) {
        const now = new Date();
        const aggregate = new EconomicProject(projectId, tenantId, name, type, 'DRAFT', [], actorId, now);
        const events = [
            {
                type: 'EconomicProjectCreated',
                projectId,
                tenantId,
                name,
                projectType: type,
                createdBy: actorId,
                createdAt: now,
            },
        ];
        return { aggregate, events };
    }
    /**
     * Créer une nouvelle version de structure de coûts
     * COUT-PROJ-03: Interdit si projet terminal
     */
    createCostStructure(actorId) {
        this.assertNotTerminal();
        const version = this.versions.length + 1;
        const now = new Date();
        const newVersion = {
            version,
            status: 'DRAFT',
            costLines: [],
            createdAt: now,
        };
        this.versions.push(newVersion);
        return [
            {
                type: 'CostStructureCreated',
                projectId: this.projectId,
                version,
                createdBy: actorId,
                createdAt: now,
            },
        ];
    }
    /**
     * Ajouter une ligne de coût
     */
    addCostLine(version, category, label, amount, allocationRule, actorId) {
        const targetVersion = this.versions.find((v) => v.version === version);
        if (!targetVersion) {
            throw new Error(`Version ${version} not found`);
        }
        const costLine = new value_objects_1.CostLine(category, label, amount, allocationRule);
        targetVersion.costLines.push(costLine);
        const now = new Date();
        return [
            {
                type: 'CostLineAdded',
                projectId: this.projectId,
                version,
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
     */
    updateAssumptions(version, assumptions, actorId) {
        const targetVersion = this.versions.find((v) => v.version === version);
        if (!targetVersion) {
            throw new Error(`Version ${version} not found`);
        }
        targetVersion.assumptions = assumptions;
        const now = new Date();
        return [
            {
                type: 'AssumptionsUpdated',
                projectId: this.projectId,
                version,
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
     * COUT-PROJ-02: Transition DRAFT → SIMULATED
     */
    runSimulation(version, metrics, actorId) {
        const targetVersion = this.versions.find((v) => v.version === version);
        if (!targetVersion) {
            throw new Error(`Version ${version} not found`);
        }
        this.assertStatusTransition('SIMULATED');
        targetVersion.simulationMetrics = metrics;
        this.status = 'SIMULATED';
        const now = new Date();
        return [
            {
                type: 'CostStructureSimulated',
                projectId: this.projectId,
                version,
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
     * Geler une version de structure de coûts
     */
    freezeCostStructure(version, actorId) {
        const targetVersion = this.versions.find((v) => v.version === version);
        if (!targetVersion) {
            throw new Error(`Version ${version} not found`);
        }
        targetVersion.status = 'FROZEN';
        const now = new Date();
        targetVersion.frozenAt = now;
        targetVersion.frozenBy = actorId;
        return [
            {
                type: 'CostStructureFrozen',
                projectId: this.projectId,
                version,
                frozenBy: actorId,
                frozenAt: now,
            },
        ];
    }
    /**
     * Valider le projet
     * COUT-PROJ-02: Transition SIMULATED → VALIDATED
     * COUT-SIM-02: Simulation obligatoire avant validation
     */
    validate(actorId) {
        this.assertStatusTransition('VALIDATED');
        if (this.status !== 'SIMULATED') {
            throw new Error('SIMULATION_REQUIRED: Project must be SIMULATED before validation (COUT-SIM-02)');
        }
        this.status = 'VALIDATED';
        const now = new Date();
        this.validatedAt = now;
        this.validatedBy = actorId;
        return [
            {
                type: 'ProjectValidated',
                projectId: this.projectId,
                tenantId: this.tenantId,
                validatedBy: actorId,
                validatedAt: now,
            },
        ];
    }
    /**
     * Rejeter le projet
     * COUT-PROJ-02: Transition SIMULATED → REJECTED
     * COUT-DEC-01: Autorité humaine requise
     */
    reject(reason, actorId) {
        this.assertStatusTransition('REJECTED');
        if (!actorId || actorId.trim().length === 0) {
            throw new Error('ACTOR_REQUIRED: Human authority required for rejection (COUT-DEC-01)');
        }
        if (!reason || reason.trim().length === 0) {
            throw new Error('REASON_REQUIRED: Justification required for rejection');
        }
        this.status = 'REJECTED';
        const now = new Date();
        this.rejectedAt = now;
        this.rejectedBy = actorId;
        this.rejectionReason = reason;
        return [
            {
                type: 'ProjectRejected',
                projectId: this.projectId,
                tenantId: this.tenantId,
                reason,
                rejectedBy: actorId,
                rejectedAt: now,
            },
        ];
    }
}
exports.EconomicProject = EconomicProject;
//# sourceMappingURL=economic-project.aggregate.js.map