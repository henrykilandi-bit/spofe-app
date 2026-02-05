/**
 * Handler: CreateAsset
 * Module Immobilisation v1.0.0
 * 
 * Orchestration write-side:
 * 1. Load state
 * 2. Guardian validation (UNIQUE point de validation métier)
 * 3. Generate event
 * 4. Persist
 * 
 * ❌ Aucune logique métier ici
 * ✅ Uniquement de l'orchestration
 */

import { Injectable } from '@nestjs/common';
import { CreateAssetCommand } from '../../commands/create-asset.command';
import { 
  ImmobilisationGuardian, 
  ImmobilisationState 
} from '../../../guardian/immobilisation.guardian';
import { AssetCreated } from '../../../domain/events';
import { AssetWriteRepository } from '../../repository/asset.repository';

@Injectable()
export class CreateAssetHandler {
  constructor(
    private readonly guardian: ImmobilisationGuardian,
    private readonly repository: AssetWriteRepository,
  ) {}

  async execute(command: CreateAssetCommand): Promise<void> {
    // 1️⃣ BUILD STATE (minimal pour création)
    const state: ImmobilisationState = {
      tenantId: command.tenantId,
      now: new Date(),
    };

    // 2️⃣ GUARDIAN VALIDATION (point UNIQUE de validation)
    this.guardian.validate(command as any, state);

    // 3️⃣ GENERATE EVENT
    const event = new AssetCreated(
      {
        tenantId: command.tenantId,
        assetId: command.assetId,
        designation: command.designation,
        description: command.description,
        category: command.category,
        acquisitionCost: command.acquisitionCost,
        currency: command.currency,
        acquisitionDate: new Date(command.acquisitionDate),
        serviceStartDate: new Date(command.serviceStartDate),
        usefulLifeMonths: command.usefulLifeMonths,
        depreciationMethod: command.depreciationMethod,
        residualValue: command.residualValue,
        renewalDate: command.renewalDate ? new Date(command.renewalDate) : null,
        replacementCost: command.replacementCost,
        initialNetBookValue: command.acquisitionCost, // VNC initiale = coût acquisition
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
    await this.repository.saveAsset(event);
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
  }
}
