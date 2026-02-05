/**
 * Handler: DisposeAsset
 * Module Immobilisation v1.0.0
 */

import { Injectable } from '@nestjs/common';
import { DisposeAssetCommand } from '../../commands/dispose-asset.command';
import { 
  ImmobilisationGuardian, 
  ImmobilisationState,
  AssetState,
  DepreciationState
} from '../../../guardian/immobilisation.guardian';
import { AssetDisposed } from '../../../domain/events';
import { AssetWriteRepository } from '../../repository/asset.repository';

@Injectable()
export class DisposeAssetHandler {
  constructor(
    private readonly guardian: ImmobilisationGuardian,
    private readonly repository: AssetWriteRepository,
  ) {}

  async execute(command: DisposeAssetCommand): Promise<void> {
    // 1️⃣ LOAD STATE
    const asset = await this.repository.getAssetById(command.tenantId, command.assetId);
    const depreciation = await this.repository.getDepreciationState(command.tenantId, command.assetId);
    
    const state: ImmobilisationState = {
      tenantId: command.tenantId,
      now: new Date(),
      asset: this.mapToAssetState(asset),
      depreciation: this.mapToDepreciationState(depreciation),
    };

    // 2️⃣ GUARDIAN VALIDATION
    this.guardian.validate(command as any, state);

    // 3️⃣ CALCULATE DISPOSAL (via Guardian)
    const calculation = this.guardian.calculateDisposal(
      state.asset!,
      state.depreciation!,
      command.disposalValue,
      new Date(command.disposalDate)
    );

    // 4️⃣ GENERATE EVENT
    const event = new AssetDisposed(
      {
        tenantId: command.tenantId,
        assetId: command.assetId,
        disposalDate: calculation.disposalDate,
        disposalValue: calculation.disposalValue,
        netBookValue: calculation.netBookValue,
        gainOrLoss: calculation.gainOrLoss,
        resultType: calculation.resultType,
      },
      {
        eventId: this.generateId(),
        correlationId: this.generateId(),
        actorId: command.actorId,
        timestamp: new Date(),
        version: 1,
      },
    );

    // 5️⃣ PERSIST
    await this.repository.saveEvent(event);
  }

  private mapToAssetState(asset: any): AssetState {
    return {
      assetId: asset.assetId,
      tenantId: asset.tenantId,
      status: asset.status,
      acquisitionCost: asset.acquisitionCost,
      acquisitionDate: new Date(asset.acquisitionDate),
      usefulLifeMonths: asset.usefulLifeMonths,
      residualValue: asset.residualValue,
      currency: asset.currency,
    };
  }

  private mapToDepreciationState(dep: any): DepreciationState {
    return {
      assetId: dep.assetId,
      depreciatedPeriods: dep.depreciatedPeriods,
      accumulatedDepreciation: dep.accumulatedDepreciation,
      netBookValue: dep.netBookValue,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
