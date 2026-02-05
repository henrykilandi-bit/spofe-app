/**
 * Immobilisation Module - Aggregate: MaintenanceRecord
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Coûts réels de possession, append-only
 */
import { Money, Description } from './value-objects';
import { createBaseEvent } from './events';
import { MaintenanceInvariants, SecurityInvariants } from './invariants';
/**
 * MaintenanceRecord - Aggregate
 *
 * Trace les coûts réels engagés sur une immobilisation :
 * - maintenance
 * - réparation
 * - entretien
 *
 * 👉 Aucune logique prédictive
 * 👉 Aucune modification de l'amortissement
 *
 * Invariants:
 * - IMM-MNT-01: cost >= 0
 * - IMM-MNT-02: date <= now
 * - IMM-MNT-03: asset.status = IN_SERVICE
 * - IMM-MNT-04: maintenance immutable after creation
 *
 * 📌 Append-only
 * 📌 Sert au TCO (Total Cost of Ownership), pas à l'amortissement
 */
export class MaintenanceRecord {
    maintenanceId;
    assetId;
    tenantId;
    type;
    date;
    description;
    cost;
    performedBy;
    createdAt;
    createdBy;
    constructor(maintenanceId, assetId, tenantId, type, date, description, cost, performedBy, createdAt, createdBy) {
        this.maintenanceId = maintenanceId;
        this.assetId = assetId;
        this.tenantId = tenantId;
        this.type = type;
        this.date = date;
        this.description = description;
        this.cost = cost;
        this.performedBy = performedBy;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // FACTORY METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Enregistrer une nouvelle intervention de maintenance
     */
    static record(params) {
        // Validation des invariants
        SecurityInvariants.validateTenantIdPresent(params.tenantId);
        MaintenanceInvariants.validateCostNonNegative(params.cost);
        MaintenanceInvariants.validateDatePast(params.date);
        MaintenanceInvariants.validateAssetInService(params.assetStatus);
        const description = new Description(params.description);
        const now = new Date();
        const aggregate = new MaintenanceRecord(params.maintenanceId, params.assetId, params.tenantId, params.type, params.date, description, params.cost, params.performedBy, now, params.actorId);
        const event = {
            ...createBaseEvent(params.tenantId, params.actorId),
            type: 'MaintenanceRecorded',
            maintenanceId: params.maintenanceId,
            assetId: params.assetId,
            maintenanceType: params.type,
            date: params.date,
            description: params.description,
            cost: params.cost.amount,
            currency: params.cost.currency,
            performedBy: params.performedBy,
        };
        return { aggregate, events: [event] };
    }
    /**
     * Reconstituer depuis l'état persisté
     */
    static fromState(props) {
        return new MaintenanceRecord(props.maintenanceId, props.assetId, props.tenantId, props.type, props.date, new Description(props.description), props.cost, props.performedBy, props.createdAt, props.createdBy);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SERIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    toState() {
        return {
            maintenanceId: this.maintenanceId,
            assetId: this.assetId,
            tenantId: this.tenantId,
            type: this.type,
            date: this.date,
            description: this.description.value,
            cost: this.cost,
            performedBy: this.performedBy,
            createdAt: this.createdAt,
            createdBy: this.createdBy,
        };
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE AGGREGATOR
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Service d'agrégation des coûts de maintenance
 * Pour le calcul du TCO (Total Cost of Ownership)
 */
export class MaintenanceAggregator {
    /**
     * Calculer le coût total de maintenance pour un asset
     */
    static calculateTotalCost(records) {
        if (records.length === 0) {
            return Money.nonNegative(0, 'XAF');
        }
        const currency = records[0].cost.currency;
        const total = records.reduce((sum, r) => sum + r.cost.amount, 0);
        return Money.nonNegative(total, currency);
    }
    /**
     * Calculer le coût total par type
     */
    static calculateCostByType(records) {
        const currency = records.length > 0 ? records[0].cost.currency : 'XAF';
        const byType = {
            MAINTENANCE: 0,
            REPAIR: 0,
            SERVICE: 0,
        };
        for (const record of records) {
            byType[record.type] += record.cost.amount;
        }
        return {
            MAINTENANCE: Money.nonNegative(byType.MAINTENANCE, currency),
            REPAIR: Money.nonNegative(byType.REPAIR, currency),
            SERVICE: Money.nonNegative(byType.SERVICE, currency),
        };
    }
    /**
     * Calculer le coût de maintenance pour une période
     */
    static calculateCostForPeriod(records, startDate, endDate) {
        const currency = records.length > 0 ? records[0].cost.currency : 'XAF';
        const filteredRecords = records.filter(r => r.date >= startDate && r.date <= endDate);
        return this.calculateTotalCost(filteredRecords);
    }
    /**
     * Compter le nombre d'interventions par type
     */
    static countByType(records) {
        const counts = {
            MAINTENANCE: 0,
            REPAIR: 0,
            SERVICE: 0,
        };
        for (const record of records) {
            counts[record.type]++;
        }
        return counts;
    }
}
//# sourceMappingURL=maintenance-record.aggregate.js.map