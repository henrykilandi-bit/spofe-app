/**
 * Immobilisation Module - Aggregate: MaintenanceRecord
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Coûts réels de possession, append-only
 */
import { Money, MaintenanceType, Description, AssetStatus } from './value-objects';
import { ImmobilisationEvent } from './events';
export interface MaintenanceRecordProps {
    maintenanceId: string;
    assetId: string;
    tenantId: string;
    type: MaintenanceType;
    date: Date;
    description: string;
    cost: Money;
    performedBy: string;
    createdAt: Date;
    createdBy: string;
}
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
export declare class MaintenanceRecord {
    readonly maintenanceId: string;
    readonly assetId: string;
    readonly tenantId: string;
    readonly type: MaintenanceType;
    readonly date: Date;
    readonly description: Description;
    readonly cost: Money;
    readonly performedBy: string;
    readonly createdAt: Date;
    readonly createdBy: string;
    private constructor();
    /**
     * Enregistrer une nouvelle intervention de maintenance
     */
    static record(params: {
        maintenanceId: string;
        assetId: string;
        tenantId: string;
        type: MaintenanceType;
        date: Date;
        description: string;
        cost: Money;
        performedBy: string;
        assetStatus: AssetStatus;
        actorId: string;
    }): {
        aggregate: MaintenanceRecord;
        events: ImmobilisationEvent[];
    };
    /**
     * Reconstituer depuis l'état persisté
     */
    static fromState(props: MaintenanceRecordProps): MaintenanceRecord;
    toState(): MaintenanceRecordProps;
}
/**
 * Service d'agrégation des coûts de maintenance
 * Pour le calcul du TCO (Total Cost of Ownership)
 */
export declare class MaintenanceAggregator {
    /**
     * Calculer le coût total de maintenance pour un asset
     */
    static calculateTotalCost(records: MaintenanceRecord[]): Money;
    /**
     * Calculer le coût total par type
     */
    static calculateCostByType(records: MaintenanceRecord[]): Record<MaintenanceType, Money>;
    /**
     * Calculer le coût de maintenance pour une période
     */
    static calculateCostForPeriod(records: MaintenanceRecord[], startDate: Date, endDate: Date): Money;
    /**
     * Compter le nombre d'interventions par type
     */
    static countByType(records: MaintenanceRecord[]): Record<MaintenanceType, number>;
}
//# sourceMappingURL=maintenance-record.aggregate.d.ts.map