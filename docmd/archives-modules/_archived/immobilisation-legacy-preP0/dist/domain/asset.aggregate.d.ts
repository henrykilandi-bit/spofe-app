/**
 * Immobilisation Module - Aggregate: Asset (Immobilisation)
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Source unique de vérité patrimoniale
 */
import { Money, UsefulLife, AssetStatus, DepreciationMethod } from './value-objects';
import { ImmobilisationEvent } from './events';
export interface AssetProps {
    assetId: string;
    tenantId: string;
    acquisitionCost: Money;
    acquisitionDate: Date;
    usefulLife: UsefulLife;
    depreciationMethod: DepreciationMethod;
    residualValue: Money;
    status: AssetStatus;
    renewalDate?: Date;
    replacementCost?: Money;
    createdAt: Date;
    createdBy: string;
}
/**
 * Asset - Aggregate Racine
 *
 * Représente un actif immobilisé réel, de son acquisition jusqu'à sa sortie.
 *
 * Responsabilités:
 * - Source unique de vérité patrimoniale
 * - Point d'ancrage de l'amortissement, maintenance, affectation, cession
 *
 * Invariants:
 * - IMM-ASS-01: acquisitionCost > 0
 * - IMM-ASS-02: usefulLife > 0
 * - IMM-ASS-03: residualValue >= 0
 * - IMM-ASS-04: acquisitionDate <= now
 * - IMM-ASS-05: status = DISPOSED ⇒ asset immutable
 * - IMM-ASS-06: status ≠ IN_SERVICE ⇒ no depreciation
 * - IMM-ASS-07: residualValue <= acquisitionCost
 */
export declare class Asset {
    readonly assetId: string;
    readonly tenantId: string;
    readonly acquisitionCost: Money;
    readonly acquisitionDate: Date;
    readonly usefulLife: UsefulLife;
    readonly depreciationMethod: DepreciationMethod;
    readonly residualValue: Money;
    private _status;
    private _renewalDate?;
    private _replacementCost?;
    readonly createdAt: Date;
    readonly createdBy: string;
    private constructor();
    get status(): AssetStatus;
    get renewalDate(): Date | undefined;
    get replacementCost(): Money | undefined;
    /**
     * Montant amortissable = acquisitionCost - residualValue
     */
    get depreciableAmount(): Money;
    /**
     * Dotation mensuelle linéaire = depreciableAmount / usefulLife
     */
    get monthlyDepreciation(): Money;
    /**
     * Dotation annuelle linéaire = monthlyDepreciation * 12
     */
    get annualDepreciation(): Money;
    /**
     * Créer une nouvelle immobilisation
     */
    static create(params: {
        assetId: string;
        tenantId: string;
        acquisitionCost: Money;
        acquisitionDate: Date;
        usefulLifeMonths: number;
        residualValue: Money;
        actorId: string;
    }): {
        aggregate: Asset;
        events: ImmobilisationEvent[];
    };
    /**
     * Reconstituer un asset depuis son état persisté
     */
    static fromState(props: AssetProps): Asset;
    /**
     * Mettre à jour les informations de renouvellement
     * IMM-ASS-05: Vérifie que l'asset n'est pas DISPOSED
     */
    updateRenewalInfo(params: {
        renewalDate?: Date;
        replacementCost?: Money;
        actorId: string;
    }): ImmobilisationEvent[];
    /**
     * Vérifier si l'asset peut être amorti
     * IMM-ASS-06: status = IN_SERVICE requis
     */
    canDepreciate(): boolean;
    /**
     * Vérifier si l'asset est modifiable
     * IMM-ASS-05: status ≠ DISPOSED et ≠ DECOMMISSIONED
     */
    isModifiable(): boolean;
    /**
     * Marquer l'asset comme cédé (utilisé par AssetDisposal)
     */
    markAsDisposed(): void;
    /**
     * Marquer l'asset comme déclassé (utilisé par AssetDisposal)
     */
    markAsDecommissioned(): void;
    toState(): AssetProps;
}
//# sourceMappingURL=asset.aggregate.d.ts.map