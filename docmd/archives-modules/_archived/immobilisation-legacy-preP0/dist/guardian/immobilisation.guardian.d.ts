/**
 * Immobilisation Guardian - Autorité Métier Centrale
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Guardian = Autorité unique de validation
 *
 * ❌ Aucun invariant complexe dans les aggregates
 * ❌ Aucun calcul métier dans les services applicatifs
 * ✅ Tout passe par le Guardian
 * ✅ Le Guardian est déterministe, pur, testable
 *
 * Le Guardian ne persiste rien.
 * Il ne connaît pas la base de données.
 * Il ne parle qu'en faits métier.
 */
import { ImmobilisationCommand } from '../domain/commands';
import { AssetStatus, AllocationTargetType } from '../domain/value-objects';
/**
 * État d'un asset pour validation Guardian
 */
export interface AssetState {
    assetId: string;
    tenantId: string;
    status: AssetStatus;
    acquisitionCost: number;
    acquisitionDate: Date;
    usefulLifeMonths: number;
    residualValue: number;
    currency: string;
    renewalDate?: Date;
    replacementCost?: number;
}
/**
 * État des amortissements pour validation Guardian
 */
export interface DepreciationState {
    assetId: string;
    depreciatedPeriods: string[];
    accumulatedDepreciation: number;
    netBookValue: number;
}
/**
 * État des allocations pour validation Guardian
 */
export interface AllocationState {
    allocationId: string;
    assetId: string;
    targetType: AllocationTargetType;
    targetId: string;
    percentage: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
}
/**
 * Contexte complet pour validation Guardian
 */
export interface ImmobilisationState {
    tenantId: string;
    now: Date;
    asset?: AssetState;
    depreciation?: DepreciationState;
    allocations?: AllocationState[];
}
/**
 * Résultat du calcul d'amortissement
 */
export interface DepreciationCalculation {
    period: string;
    depreciationAmount: number;
    newAccumulatedDepreciation: number;
    newNetBookValue: number;
}
/**
 * Résultat du calcul de cession
 */
export interface DisposalCalculation {
    disposalDate: Date;
    netBookValue: number;
    disposalValue: number;
    gainOrLoss: number;
    resultType: 'GAIN' | 'LOSS' | 'NEUTRAL';
}
/**
 * Guardian Immobilisation - Point d'entrée unique
 *
 * Responsabilités:
 * - valider les Commands
 * - vérifier les invariants métier transverses
 * - calculer les dotations d'amortissement
 * - produire des verdicts validés
 * - refuser toute mutation invalide
 */
export declare class ImmobilisationGuardian {
    /**
     * Valide une commande contre l'état courant
     * @throws GuardianError si validation échoue
     */
    validate(command: ImmobilisationCommand, state: ImmobilisationState): void;
    /**
     * Calcul de la dotation d'amortissement linéaire pour une période
     *
     * Formule: (acquisitionCost - residualValue) / usefulLifeMonths
     *
     * Le Guardian calcule, valide et retourne le résultat.
     * Il ne persiste rien.
     */
    calculateDepreciation(asset: AssetState, depreciation: DepreciationState, period: string): DepreciationCalculation;
    /**
     * Calcul des plus/moins values de cession
     */
    calculateDisposal(asset: AssetState, depreciation: DepreciationState, disposalValue: number, disposalDate: Date): DisposalCalculation;
    /**
     * CreateAsset - Créer une immobilisation
     */
    private validateCreateAsset;
    /**
     * UpdateRenewalInfo - Modifier date/coût de renouvellement
     */
    private validateUpdateRenewalInfo;
    /**
     * CreateAllocation - Affecter à des produits/projets
     */
    private validateCreateAllocation;
    /**
     * EndAllocation - Terminer une allocation
     */
    private validateEndAllocation;
    /**
     * ReallocateAsset - Réallouer complètement un asset
     */
    private validateReallocateAsset;
    /**
     * RecordDepreciation - Enregistrer une dotation
     */
    private validateRecordDepreciation;
    /**
     * CalculateDepreciations - Batch de calcul (Guardian only)
     */
    private validateCalculateDepreciations;
    /**
     * RecordMaintenance - Tracer une maintenance
     */
    private validateRecordMaintenance;
    /**
     * DisposeAsset - Céder l'actif
     */
    private validateDisposeAsset;
    /**
     * DecommissionAsset - Déclasser l'actif
     */
    private validateDecommissionAsset;
    /**
     * Convertit un verdict en exception si violation
     */
    private assertVerdict;
}
export declare const immobilisationGuardian: ImmobilisationGuardian;
//# sourceMappingURL=immobilisation.guardian.d.ts.map