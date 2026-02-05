/**
 * Immobilisation Module - Aggregate: Asset (Immobilisation)
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Source unique de vérité patrimoniale
 */
import { UsefulLife, } from './value-objects';
import { createBaseEvent, } from './events';
import { AssetInvariants, SecurityInvariants } from './invariants';
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
export class Asset {
    assetId;
    tenantId;
    acquisitionCost;
    acquisitionDate;
    usefulLife;
    depreciationMethod;
    residualValue;
    _status;
    _renewalDate;
    _replacementCost;
    createdAt;
    createdBy;
    constructor(assetId, tenantId, acquisitionCost, acquisitionDate, usefulLife, depreciationMethod, residualValue, _status, _renewalDate, _replacementCost, createdAt = new Date(), createdBy = 'system') {
        this.assetId = assetId;
        this.tenantId = tenantId;
        this.acquisitionCost = acquisitionCost;
        this.acquisitionDate = acquisitionDate;
        this.usefulLife = usefulLife;
        this.depreciationMethod = depreciationMethod;
        this.residualValue = residualValue;
        this._status = _status;
        this._renewalDate = _renewalDate;
        this._replacementCost = _replacementCost;
        this.createdAt = createdAt;
        this.createdBy = createdBy;
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // GETTERS
    // ═══════════════════════════════════════════════════════════════════════════
    get status() {
        return this._status;
    }
    get renewalDate() {
        return this._renewalDate;
    }
    get replacementCost() {
        return this._replacementCost;
    }
    /**
     * Montant amortissable = acquisitionCost - residualValue
     */
    get depreciableAmount() {
        return this.acquisitionCost.subtract(this.residualValue);
    }
    /**
     * Dotation mensuelle linéaire = depreciableAmount / usefulLife
     */
    get monthlyDepreciation() {
        return this.depreciableAmount.multiply(1 / this.usefulLife.months);
    }
    /**
     * Dotation annuelle linéaire = monthlyDepreciation * 12
     */
    get annualDepreciation() {
        return this.monthlyDepreciation.multiply(12);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // FACTORY METHODS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Créer une nouvelle immobilisation
     */
    static create(params) {
        // Validation des invariants
        SecurityInvariants.validateTenantIdPresent(params.tenantId);
        AssetInvariants.validateAcquisitionCostPositive(params.acquisitionCost);
        AssetInvariants.validateAcquisitionDatePast(params.acquisitionDate);
        AssetInvariants.validateResidualValueNonNegative(params.residualValue);
        AssetInvariants.validateResidualValueWithinCost(params.residualValue, params.acquisitionCost);
        const usefulLife = new UsefulLife(params.usefulLifeMonths);
        const now = new Date();
        const aggregate = new Asset(params.assetId, params.tenantId, params.acquisitionCost, params.acquisitionDate, usefulLife, 'LINEAR', params.residualValue, 'IN_SERVICE', undefined, undefined, now, params.actorId);
        const event = {
            ...createBaseEvent(params.tenantId, params.actorId),
            type: 'AssetCreated',
            assetId: params.assetId,
            acquisitionCost: params.acquisitionCost.amount,
            currency: params.acquisitionCost.currency,
            acquisitionDate: params.acquisitionDate,
            usefulLifeMonths: usefulLife.months,
            depreciationMethod: 'LINEAR',
            residualValue: params.residualValue.amount,
        };
        return { aggregate, events: [event] };
    }
    /**
     * Reconstituer un asset depuis son état persisté
     */
    static fromState(props) {
        return new Asset(props.assetId, props.tenantId, props.acquisitionCost, props.acquisitionDate, props.usefulLife, props.depreciationMethod, props.residualValue, props.status, props.renewalDate, props.replacementCost, props.createdAt, props.createdBy);
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // COMMANDS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Mettre à jour les informations de renouvellement
     * IMM-ASS-05: Vérifie que l'asset n'est pas DISPOSED
     */
    updateRenewalInfo(params) {
        // Vérification IMM-ASS-05
        AssetInvariants.validateNotDisposed(this._status);
        this._renewalDate = params.renewalDate;
        this._replacementCost = params.replacementCost;
        const event = {
            ...createBaseEvent(this.tenantId, params.actorId),
            type: 'AssetRenewalUpdated',
            assetId: this.assetId,
            renewalDate: params.renewalDate,
            replacementCost: params.replacementCost?.amount,
            currency: params.replacementCost?.currency,
        };
        return [event];
    }
    /**
     * Vérifier si l'asset peut être amorti
     * IMM-ASS-06: status = IN_SERVICE requis
     */
    canDepreciate() {
        return this._status === 'IN_SERVICE';
    }
    /**
     * Vérifier si l'asset est modifiable
     * IMM-ASS-05: status ≠ DISPOSED et ≠ DECOMMISSIONED
     */
    isModifiable() {
        return this._status === 'IN_SERVICE';
    }
    /**
     * Marquer l'asset comme cédé (utilisé par AssetDisposal)
     */
    markAsDisposed() {
        AssetInvariants.validateNotDisposed(this._status);
        this._status = 'DISPOSED';
    }
    /**
     * Marquer l'asset comme déclassé (utilisé par AssetDisposal)
     */
    markAsDecommissioned() {
        AssetInvariants.validateNotDisposed(this._status);
        this._status = 'DECOMMISSIONED';
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // SERIALIZATION
    // ═══════════════════════════════════════════════════════════════════════════
    toState() {
        return {
            assetId: this.assetId,
            tenantId: this.tenantId,
            acquisitionCost: this.acquisitionCost,
            acquisitionDate: this.acquisitionDate,
            usefulLife: this.usefulLife,
            depreciationMethod: this.depreciationMethod,
            residualValue: this.residualValue,
            status: this._status,
            renewalDate: this._renewalDate,
            replacementCost: this._replacementCost,
            createdAt: this.createdAt,
            createdBy: this.createdBy,
        };
    }
}
//# sourceMappingURL=asset.aggregate.js.map