/**
 * Handler: RecordDepreciation
 * Module Immobilisation v1.0.0
 */

import { Injectable } from '@nestjs/common';
import { RecordDepreciationCommand } from '../../commands/record-depreciation.command';
import { 
  ImmobilisationGuardian, 
  ImmobilisationState,
  AssetState,
  DepreciationState
} from '../../../guardian/immobilisation.guardian';
import { DepreciationRecorded } from '../../../domain/events';
import { AssetWriteRepository } from '../../repository/asset.repository';

@Injectable()
export class RecordDepreciationHandler {
  constructor(
    private readonly guardian: ImmobilisationGuardian,
    private readonly repository: AssetWriteRepository,
  ) {}

  async execute(command: RecordDepreciationCommand): Promise<void> {
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

    // 3️⃣ CALCULATE DEPRECIATION (via Guardian)
    const calculation = this.guardian.calculateDepreciation(
      state.asset!,
      state.depreciation!,
      command.period
    );

    // 4️⃣ GENERATE EVENT
    const event = new DepreciationRecorded(
      {
        tenantId: command.tenantId,
        assetId: command.assetId,
        period: calculation.period,
        depreciationAmount: calculation.depreciationAmount,
        accumulatedDepreciation: calculation.newAccumulatedDepreciation,
        netBookValue: calculation.newNetBookValue,
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
