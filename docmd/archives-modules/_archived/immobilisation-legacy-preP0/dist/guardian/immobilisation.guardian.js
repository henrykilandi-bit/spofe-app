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
import { GuardianError } from '../../../shared/GuardianError';
import { INVARIANT_CODES, validateTenantRequired, validateSameTenant, validateAcquisitionCostPositive, validateUsefulLifePositive, validateResidualValueNonNegative, validateAcquisitionDatePast, validateResidualWithinCost, validateAssetNotDisposed, validateAssetInService, validateRenewalDateAfterAcquisition, validateReplacementCostNonNegative, validateDepreciationAmountNonNegative, validateAccumulatedWithinCost, validateNetBookValueAboveResidual, validatePeriodNotAlreadyDepreciated, validatePercentageValid, validateAllocationSum100, validateDateRangeValid, validateNoAllocationOverlap, validateAllocationNotOnDisposed, validateMaintenanceCostNonNegative, validateMaintenanceDatePast, validateMaintenanceAssetInService, validateDisposalDateAfterAcquisition, validateDisposalAssetInService, } from './immobilisation.invariants';
// ═══════════════════════════════════════════════════════════════════════════
// GUARDIAN IMMOBILISATION
// ═══════════════════════════════════════════════════════════════════════════
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
export class ImmobilisationGuardian {
    // ═══════════════════════════════════════════════════════════════════════════
    // VALIDATION PRINCIPALE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Valide une commande contre l'état courant
     * @throws GuardianError si validation échoue
     */
    validate(command, state) {
        // Toujours vérifier l'isolation tenant en premier
        this.assertVerdict(validateTenantRequired(command.tenantId));
        this.assertVerdict(validateSameTenant(command.tenantId, state.tenantId));
        switch (command.type) {
            case 'CreateAsset':
                this.validateCreateAsset(command, state);
                break;
            case 'UpdateRenewalInfo':
                this.validateUpdateRenewalInfo(command, state);
                break;
            case 'CreateAllocation':
                this.validateCreateAllocation(command, state);
                break;
            case 'EndAllocation':
                this.validateEndAllocation(command, state);
                break;
            case 'ReallocateAsset':
                this.validateReallocateAsset(command, state);
                break;
            case 'RecordDepreciation':
                this.validateRecordDepreciation(command, state);
                break;
            case 'CalculateDepreciations':
                this.validateCalculateDepreciations(command, state);
                break;
            case 'RecordMaintenance':
                this.validateRecordMaintenance(command, state);
                break;
            case 'DisposeAsset':
                this.validateDisposeAsset(command, state);
                break;
            case 'DecommissionAsset':
                this.validateDecommissionAsset(command, state);
                break;
            default:
                throw new GuardianError(INVARIANT_CODES.IMM_CMD_01, `Unknown command type: ${command.type}`);
        }
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // CALCULS MÉTIER
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Calcul de la dotation d'amortissement linéaire pour une période
     *
     * Formule: (acquisitionCost - residualValue) / usefulLifeMonths
     *
     * Le Guardian calcule, valide et retourne le résultat.
     * Il ne persiste rien.
     */
    calculateDepreciation(asset, depreciation, period) {
        // Vérifier que l'asset est en service
        this.assertVerdict(validateAssetInService(asset.status));
        // Vérifier que la période n'est pas déjà amortie
        this.assertVerdict(validatePeriodNotAlreadyDepreciated(period, depreciation.depreciatedPeriods));
        // Calcul de la dotation mensuelle linéaire
        const depreciableAmount = asset.acquisitionCost - asset.residualValue;
        let monthlyDepreciation = depreciableAmount / asset.usefulLifeMonths;
        // Vérifier que la VNC ne descendra pas sous la valeur résiduelle
        const currentNBV = depreciation.netBookValue;
        const maxAllowedDepreciation = currentNBV - asset.residualValue;
        // Ajuster si nécessaire
        if (monthlyDepreciation > maxAllowedDepreciation) {
            monthlyDepreciation = Math.max(0, maxAllowedDepreciation);
        }
        // Arrondir à 2 décimales
        monthlyDepreciation = Math.round(monthlyDepreciation * 100) / 100;
        const newAccumulated = depreciation.accumulatedDepreciation + monthlyDepreciation;
        const newNBV = asset.acquisitionCost - newAccumulated;
        // Validation finale
        this.assertVerdict(validateDepreciationAmountNonNegative(monthlyDepreciation));
        this.assertVerdict(validateAccumulatedWithinCost(newAccumulated, asset.acquisitionCost));
        this.assertVerdict(validateNetBookValueAboveResidual(newNBV, asset.residualValue));
        return {
            period,
            depreciationAmount: monthlyDepreciation,
            newAccumulatedDepreciation: Math.round(newAccumulated * 100) / 100,
            newNetBookValue: Math.round(newNBV * 100) / 100,
        };
    }
    /**
     * Calcul des plus/moins values de cession
     */
    calculateDisposal(asset, depreciation, disposalValue, disposalDate) {
        // Vérifier que l'asset est en service
        this.assertVerdict(validateDisposalAssetInService(asset.status));
        // Vérifier la date de cession
        this.assertVerdict(validateDisposalDateAfterAcquisition(disposalDate, asset.acquisitionDate));
        const netBookValue = depreciation.netBookValue;
        const gainOrLoss = disposalValue - netBookValue;
        // Arrondir
        const roundedGainOrLoss = Math.round(gainOrLoss * 100) / 100;
        let resultType;
        if (roundedGainOrLoss > 0.01) {
            resultType = 'GAIN';
        }
        else if (roundedGainOrLoss < -0.01) {
            resultType = 'LOSS';
        }
        else {
            resultType = 'NEUTRAL';
        }
        return {
            disposalDate,
            netBookValue,
            disposalValue,
            gainOrLoss: roundedGainOrLoss,
            resultType,
        };
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // VALIDATIONS PAR COMMANDE
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * CreateAsset - Créer une immobilisation
     */
    validateCreateAsset(command, state) {
        this.assertVerdict(validateAcquisitionCostPositive(command.acquisitionCost));
        this.assertVerdict(validateUsefulLifePositive(command.usefulLifeMonths));
        this.assertVerdict(validateResidualValueNonNegative(command.residualValue));
        this.assertVerdict(validateAcquisitionDatePast(command.acquisitionDate, state.now));
        this.assertVerdict(validateResidualWithinCost(command.residualValue, command.acquisitionCost));
    }
    /**
     * UpdateRenewalInfo - Modifier date/coût de renouvellement
     */
    validateUpdateRenewalInfo(command, state) {
        if (!state.asset) {
            throw new GuardianError(INVARIANT_CODES.IMM_ASS_05, 'Asset not found');
        }
        this.assertVerdict(validateAssetNotDisposed(state.asset.status));
        if (command.renewalDate) {
            this.assertVerdict(validateRenewalDateAfterAcquisition(command.renewalDate, state.asset.acquisitionDate));
        }
        if (command.replacementCost !== undefined) {
            this.assertVerdict(validateReplacementCostNonNegative(command.replacementCost));
        }
    }
    /**
     * CreateAllocation - Affecter à des produits/projets
     */
    validateCreateAllocation(command, state) {
        if (!state.asset) {
            throw new GuardianError(INVARIANT_CODES.IMM_ALL_05, 'Asset not found');
        }
        this.assertVerdict(validateAllocationNotOnDisposed(state.asset.status));
        this.assertVerdict(validatePercentageValid(command.percentage));
        this.assertVerdict(validateDateRangeValid(command.effectiveFrom, command.effectiveTo));
        // Vérifier pas de chevauchement avec allocations existantes pour le même target
        if (state.allocations) {
            const sameTargetRanges = state.allocations
                .filter(a => a.targetType === command.targetType && a.targetId === command.targetId)
                .map(a => ({ from: a.effectiveFrom, to: a.effectiveTo }));
            this.assertVerdict(validateNoAllocationOverlap(command.effectiveFrom, command.effectiveTo, sameTargetRanges));
        }
    }
    /**
     * EndAllocation - Terminer une allocation
     */
    validateEndAllocation(command, state) {
        if (!state.asset) {
            throw new GuardianError(INVARIANT_CODES.IMM_ALL_05, 'Asset not found');
        }
        // On peut terminer une allocation même sur un asset cédé (pour clôture)
        // Mais on vérifie que l'allocation existe
        const allocation = state.allocations?.find(a => a.allocationId === command.allocationId);
        if (!allocation) {
            throw new GuardianError(INVARIANT_CODES.IMM_ALL_04, 'Allocation not found');
        }
        if (allocation.effectiveTo) {
            throw new GuardianError(INVARIANT_CODES.IMM_ALL_04, 'Allocation already ended');
        }
        this.assertVerdict(validateDateRangeValid(allocation.effectiveFrom, command.endDate));
    }
    /**
     * ReallocateAsset - Réallouer complètement un asset
     */
    validateReallocateAsset(command, state) {
        if (!state.asset) {
            throw new GuardianError(INVARIANT_CODES.IMM_ALL_05, 'Asset not found');
        }
        this.assertVerdict(validateAllocationNotOnDisposed(state.asset.status));
        // Vérifier chaque allocation
        for (const alloc of command.allocations) {
            this.assertVerdict(validatePercentageValid(alloc.percentage));
        }
        // Vérifier que la somme = 100%
        this.assertVerdict(validateAllocationSum100(command.allocations));
    }
    /**
     * RecordDepreciation - Enregistrer une dotation
     */
    validateRecordDepreciation(command, state) {
        if (!state.asset) {
            throw new GuardianError(INVARIANT_CODES.IMM_DEP_01, 'Asset not found');
        }
        if (!state.depreciation) {
            throw new GuardianError(INVARIANT_CODES.IMM_DEP_01, 'Depreciation state not found');
        }
        this.assertVerdict(validateAssetInService(state.asset.status));
        this.assertVerdict(validatePeriodNotAlreadyDepreciated(command.period, state.depreciation.depreciatedPeriods));
    }
    /**
     * CalculateDepreciations - Batch de calcul (Guardian only)
     */
    validateCalculateDepreciations(command, state) {
        // Validation de base - le period doit être valide
        const periodMatch = command.period.match(/^\d{4}-(0[1-9]|1[0-2])$/);
        if (!periodMatch) {
            throw new GuardianError(INVARIANT_CODES.IMM_DEP_05, `Invalid period format: ${command.period}, expected YYYY-MM`);
        }
    }
    /**
     * RecordMaintenance - Tracer une maintenance
     */
    validateRecordMaintenance(command, state) {
        if (!state.asset) {
            throw new GuardianError(INVARIANT_CODES.IMM_MNT_03, 'Asset not found');
        }
        this.assertVerdict(validateMaintenanceAssetInService(state.asset.status));
        this.assertVerdict(validateMaintenanceCostNonNegative(command.cost));
        this.assertVerdict(validateMaintenanceDatePast(command.date, state.now));
    }
    /**
     * DisposeAsset - Céder l'actif
     */
    validateDisposeAsset(command, state) {
        if (!state.asset) {
            throw new GuardianError(INVARIANT_CODES.IMM_DIS_02, 'Asset not found');
        }
        this.assertVerdict(validateDisposalAssetInService(state.asset.status));
        this.assertVerdict(validateDisposalDateAfterAcquisition(command.disposalDate, state.asset.acquisitionDate));
    }
    /**
     * DecommissionAsset - Déclasser l'actif
     */
    validateDecommissionAsset(command, state) {
        if (!state.asset) {
            throw new GuardianError(INVARIANT_CODES.IMM_DIS_02, 'Asset not found');
        }
        this.assertVerdict(validateDisposalAssetInService(state.asset.status));
        this.assertVerdict(validateDisposalDateAfterAcquisition(command.decommissionDate, state.asset.acquisitionDate));
    }
    // ═══════════════════════════════════════════════════════════════════════════
    // HELPERS
    // ═══════════════════════════════════════════════════════════════════════════
    /**
     * Convertit un verdict en exception si violation
     */
    assertVerdict(verdict) {
        if (!verdict.ok) {
            throw new GuardianError(verdict.violationCode, verdict.message, verdict.metadata);
        }
    }
}
// ═══════════════════════════════════════════════════════════════════════════
// EXPORT SINGLETON
// ═══════════════════════════════════════════════════════════════════════════
export const immobilisationGuardian = new ImmobilisationGuardian();
//# sourceMappingURL=immobilisation.guardian.js.map