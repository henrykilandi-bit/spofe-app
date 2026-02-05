/**
 * Immobilisation Module - Aggregate: AssetDisposal
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Sortie définitive d'immobilisation
 */

import { Money, DisposalType, AssetStatus } from './value-objects';
import {
  ImmobilisationEvent,
  AssetDisposedEvent,
  AssetDecommissionedEvent,
  createBaseEvent,
} from './events';
import { DisposalInvariants, SecurityInvariants } from './invariants';

// ═══════════════════════════════════════════════════════════════════════════
// ASSET DISPOSAL AGGREGATE
// ═══════════════════════════════════════════════════════════════════════════

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
export class AssetDisposal {
  private constructor(
    public readonly disposalId: string,
    public readonly assetId: string,
    public readonly tenantId: string,
    public readonly disposalDate: Date,
    public readonly disposalType: DisposalType,
    public readonly disposalValue: Money,
    public readonly netBookValue: Money,
    public readonly gainOrLoss: Money,
    public readonly reason?: string,
    public readonly createdAt: Date = new Date(),
    public readonly createdBy: string = 'system'
  ) {}

  // ═══════════════════════════════════════════════════════════════════════════
  // COMPUTED PROPERTIES
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Indique si la cession a généré une plus-value
   */
  get isGain(): boolean {
    return this.gainOrLoss.amount > 0;
  }

  /**
   * Indique si la cession a généré une moins-value
   */
  get isLoss(): boolean {
    return this.gainOrLoss.amount < 0;
  }

  /**
   * Indique si la cession est neutre (pas de plus/moins value)
   */
  get isNeutral(): boolean {
    return Math.abs(this.gainOrLoss.amount) < 0.01;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // FACTORY METHODS
  // ═══════════════════════════════════════════════════════════════════════════

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
  }): { aggregate: AssetDisposal; events: ImmobilisationEvent[] } {
    return AssetDisposal.record({
      ...params,
      disposalType: 'SALE',
    });
  }

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
  }): { aggregate: AssetDisposal; events: ImmobilisationEvent[] } {
    // Pour un déclassement, la valeur de cession est 0
    const disposalValue = Money.nonNegative(0, params.netBookValue.currency);

    return AssetDisposal.record({
      ...params,
      disposalType: 'SCRAP',
      disposalValue,
    });
  }

  /**
   * Méthode interne d'enregistrement
   */
  private static record(params: {
    disposalId: string;
    assetId: string;
    tenantId: string;
    disposalDate: Date;
    disposalType: DisposalType;
    disposalValue: Money;
    netBookValue: Money;
    acquisitionDate: Date;
    assetStatus: AssetStatus;
    reason?: string;
    actorId: string;
  }): { aggregate: AssetDisposal; events: ImmobilisationEvent[] } {
    // Validation des invariants
    SecurityInvariants.validateTenantIdPresent(params.tenantId);
    DisposalInvariants.validateAssetInService(params.assetStatus);
    DisposalInvariants.validateDisposalDateAfterAcquisition(
      params.disposalDate,
      params.acquisitionDate
    );

    // Calcul du gain/perte
    const gainOrLoss = params.disposalValue.subtract(params.netBookValue);
    DisposalInvariants.validateGainLossFormula(gainOrLoss, params.disposalValue, params.netBookValue);

    const now = new Date();

    const aggregate = new AssetDisposal(
      params.disposalId,
      params.assetId,
      params.tenantId,
      params.disposalDate,
      params.disposalType,
      params.disposalValue,
      params.netBookValue,
      gainOrLoss,
      params.reason,
      now,
      params.actorId
    );

    // Création de l'événement approprié selon le type
    let events: ImmobilisationEvent[];

    if (params.disposalType === 'SALE') {
      const event: AssetDisposedEvent = {
        ...createBaseEvent(params.tenantId, params.actorId),
        type: 'AssetDisposed',
        assetId: params.assetId,
        disposalDate: params.disposalDate,
        disposalType: params.disposalType,
        disposalValue: params.disposalValue.amount,
        netBookValue: params.netBookValue.amount,
        gainOrLoss: gainOrLoss.amount,
        currency: params.disposalValue.currency,
      };
      events = [event];
    } else {
      const event: AssetDecommissionedEvent = {
        ...createBaseEvent(params.tenantId, params.actorId),
        type: 'AssetDecommissioned',
        assetId: params.assetId,
        decommissionDate: params.disposalDate,
        netBookValue: params.netBookValue.amount,
        currency: params.netBookValue.currency,
        reason: params.reason || 'Déclassement',
      };
      events = [event];
    }

    return { aggregate, events };
  }

  /**
   * Reconstituer depuis l'état persisté
   */
  static fromState(props: AssetDisposalProps): AssetDisposal {
    return new AssetDisposal(
      props.disposalId,
      props.assetId,
      props.tenantId,
      props.disposalDate,
      props.disposalType,
      props.disposalValue,
      props.netBookValue,
      props.gainOrLoss,
      props.reason,
      props.createdAt,
      props.createdBy
    );
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // SERIALIZATION
  // ═══════════════════════════════════════════════════════════════════════════

  toState(): AssetDisposalProps {
    return {
      disposalId: this.disposalId,
      assetId: this.assetId,
      tenantId: this.tenantId,
      disposalDate: this.disposalDate,
      disposalType: this.disposalType,
      disposalValue: this.disposalValue,
      netBookValue: this.netBookValue,
      gainOrLoss: this.gainOrLoss,
      reason: this.reason,
      createdAt: this.createdAt,
      createdBy: this.createdBy,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DISPOSAL CALCULATOR
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculateur pour les cessions d'immobilisation
 */
export class DisposalCalculator {
  /**
   * Calculer le gain ou la perte de cession
   */
  static calculateGainOrLoss(disposalValue: Money, netBookValue: Money): Money {
    return disposalValue.subtract(netBookValue);
  }

  /**
   * Déterminer le type de résultat de cession
   */
  static determineResultType(
    gainOrLoss: Money
  ): 'GAIN' | 'LOSS' | 'NEUTRAL' {
    if (gainOrLoss.amount > 0.01) return 'GAIN';
    if (gainOrLoss.amount < -0.01) return 'LOSS';
    return 'NEUTRAL';
  }
}
