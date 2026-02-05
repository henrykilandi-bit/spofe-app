/**
 * Immobilisation Module - Aggregate: AssetDisposal
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Sortie définitive d'immobilisation
 */
import { Money, DisposalType, AssetStatus } from './value-objects';
import { ImmobilisationEvent } from './events';
export interface AssetDisposalProps {
    disposalId: string;
    assetId: string;
    tenantId: string;
    disposalDate: Date;
    disposalType: DisposalType;
    disposalValue: Money;
    netBookValue: Money;
    gainOrLoss: Money;
    reason?: string;
    createdAt: Date;
    createdBy: string;
}
/**
 * AssetDisposal - Aggregate
 *
 * Formalise la sortie définitive d'une immobilisation :
 * - cession (SALE)
 * - déclassement (SCRAP)
 *
 * Invariants:
 * - IMM-DIS-01: disposalDate >= acquisitionDate
 * - IMM-DIS-02: asset.status must be IN_SERVICE
 * - IMM-DIS-03: gainOrLoss = disposalValue - netBookValue
 * - IMM-DIS-04: disposal is final
 *
 * 📌 Après disposal :
 * - aucun amortissement
 * - aucune maintenance
 * - aucun changement d'allocation
 */
export declare class AssetDisposal {
    readonly disposalId: string;
    readonly assetId: string;
    readonly tenantId: string;
    readonly disposalDate: Date;
    readonly disposalType: DisposalType;
    readonly disposalValue: Money;
    readonly netBookValue: Money;
    readonly gainOrLoss: Money;
    readonly reason?: string | undefined;
    readonly createdAt: Date;
    readonly createdBy: string;
    private constructor();
    /**
     * Indique si la cession a généré une plus-value
     */
    get isGain(): boolean;
    /**
     * Indique si la cession a généré une moins-value
     */
    get isLoss(): boolean;
    /**
     * Indique si la cession est neutre (pas de plus/moins value)
     */
    get isNeutral(): boolean;
    /**
     * Enregistrer une cession d'immobilisation (SALE)
     */
    static recordSale(params: {
        disposalId: string;
        assetId: string;
        tenantId: string;
        disposalDate: Date;
        disposalValue: Money;
        netBookValue: Money;
        acquisitionDate: Date;
        assetStatus: AssetStatus;
        actorId: string;
    }): {
        aggregate: AssetDisposal;
        events: ImmobilisationEvent[];
    };
    /**
     * Enregistrer un déclassement d'immobilisation (SCRAP)
     */
    static recordScrap(params: {
        disposalId: string;
        assetId: string;
        tenantId: string;
        disposalDate: Date;
        netBookValue: Money;
        acquisitionDate: Date;
        assetStatus: AssetStatus;
        reason: string;
        actorId: string;
    }): {
        aggregate: AssetDisposal;
        events: ImmobilisationEvent[];
    };
    /**
     * Méthode interne d'enregistrement
     */
    private static record;
    /**
     * Reconstituer depuis l'état persisté
     */
    static fromState(props: AssetDisposalProps): AssetDisposal;
    toState(): AssetDisposalProps;
}
/**
 * Calculateur pour les cessions d'immobilisation
 */
export declare class DisposalCalculator {
    /**
     * Calculer le gain ou la perte de cession
     */
    static calculateGainOrLoss(disposalValue: Money, netBookValue: Money): Money;
    /**
     * Déterminer le type de résultat de cession
     */
    static determineResultType(gainOrLoss: Money): 'GAIN' | 'LOSS' | 'NEUTRAL';
}
//# sourceMappingURL=asset-disposal.aggregate.d.ts.map