/**
 * Handler: UpdateRenewal
 * Module Immobilisation v1.0.0
 */

import { Injectable } from '@nestjs/common';
import { UpdateRenewalCommand } from '../../commands/update-renewal.command';
import { 
  ImmobilisationGuardian, 
  ImmobilisationState,
  AssetState 
} from '../../../guardian/immobilisation.guardian';
import { AssetRenewalInfoUpdated } from '../../../domain/events';
import { AssetWriteRepository } from '../../repository/asset.repository';

@Injectable()
export class UpdateRenewalHandler {
  constructor(
    private readonly guardian: ImmobilisationGuardian,
    private readonly repository: AssetWriteRepository,
  ) {}

  async execute(command: UpdateRenewalCommand): Promise<void> {
    // 1️⃣ LOAD STATE
    const asset = await this.repository.getAssetById(command.tenantId, command.assetId);
    
    const state: ImmobilisationState = {
      tenantId: command.tenantId,
      now: new Date(),
      asset: this.mapToAssetState(asset),
    };

    // 2️⃣ GUARDIAN VALIDATION
    this.guardian.validate(command as any, state);

    // 3️⃣ GENERATE EVENT
    const event = new AssetRenewalInfoUpdated(
      {
        tenantId: command.tenantId,
        assetId: command.assetId,
        renewalDate: command.renewalDate ? new Date(command.renewalDate) : null,
        replacementCost: command.replacementCost,
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
      renewalDate: asset.renewalDate ? new Date(asset.renewalDate) : undefined,
      replacementCost: asset.replacementCost,
    };
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
