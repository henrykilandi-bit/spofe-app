/**
 * Handler: AllocateAsset
 * Module Immobilisation v1.0.0
 */

import { Injectable } from '@nestjs/common';
import { AllocateAssetCommand } from '../../commands/allocate-asset.command.js';
import { 
  ImmobilisationGuardian, 
  ImmobilisationState,
  AssetState 
} from '../../../guardian/immobilisation.guardian.js';
import { AssetAllocated } from '../../../domain/events/index.js';
import { AssetWriteRepository } from '../../repository/asset.repository.js';

@Injectable()
export class AllocateAssetHandler {
  constructor(
    private readonly guardian: ImmobilisationGuardian,
    private readonly repository: AssetWriteRepository,
  ) {}

  async execute(command: AllocateAssetCommand): Promise<void> {
    // 1️⃣ LOAD STATE
    const asset = await this.repository.getAssetById(command.tenantId, command.assetId);
    const allocations = await this.repository.getActiveAllocations(command.tenantId, command.assetId);
    
    const state: ImmobilisationState = {
      tenantId: command.tenantId,
      now: new Date(),
      asset: this.mapToAssetState(asset),
      allocations: allocations.map(a => ({
        allocationId: a.allocationId,
        assetId: a.assetId,
        targetType: a.targetType,
        targetId: a.targetId,
        percentage: a.percentage,
        effectiveFrom: new Date(a.effectiveFrom),
        effectiveTo: a.effectiveTo ? new Date(a.effectiveTo) : undefined,
      })),
    };

    // 2️⃣ GUARDIAN VALIDATION
    this.guardian.validate(command as any, state);

    // 3️⃣ GENERATE EVENT
    const event = new AssetAllocated(
      {
        tenantId: command.tenantId,
        assetId: command.assetId,
        allocationId: this.generateId(),
        targetType: command.targetType,
        targetId: command.targetId,
        percentage: command.percentage,
        effectiveFrom: new Date(command.effectiveFrom),
        effectiveTo: command.effectiveTo ? new Date(command.effectiveTo) : null,
      },
      {
        eventId: this.generateId(),
        correlationId: this.generateId(),
        actorId: command.actorId,
        timestamp: new Date(),
        version: 1,
      },
    );

    // 4️⃣ PERSIST
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

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
