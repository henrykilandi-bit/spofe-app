/**
 * Immobilisation Module - NestJS v1.0.0
 * 
 * Module complet write + read side.
 * Conforme au contrat SPOFE et CONTRACT.md v1.0.0
 */

import { Module } from '@nestjs/common';

// Controllers
import {
  ImmobilisationReadController,
  ImmobilisationCostStructureController,
  ImmobilisationBudgetController,
  ImmobilisationWriteController,
} from './api/controllers/index.js';

// Guardian
import { ImmobilisationGuardian } from './guardian/immobilisation.guardian.js';

// Handlers (Write-side)
import {
  CreateAssetHandler,
  UpdateRenewalHandler,
  AllocateAssetHandler,
  RecordDepreciationHandler,
  RecordMaintenanceHandler,
  DisposeAssetHandler,
} from './write/handlers/index.js';

// Repositories
import {
  ASSET_REPOSITORY,
  AssetWriteRepository,
} from './write/repository/asset.repository.js';
import { AssetPgRepository } from './write/repository/asset.pg.repository.js';

@Module({
  controllers: [
    // Read controllers
    ImmobilisationReadController,
    ImmobilisationCostStructureController,
    ImmobilisationBudgetController,
    // Write controller
    ImmobilisationWriteController,
  ],
  providers: [
    // Guardian - autorité métier unique
    ImmobilisationGuardian,

    // Handlers write-side
    CreateAssetHandler,
    UpdateRenewalHandler,
    AllocateAssetHandler,
    RecordDepreciationHandler,
    RecordMaintenanceHandler,
    DisposeAssetHandler,

    // Repository write-side (interface + implémentation)
    {
      provide: ASSET_REPOSITORY,
      useClass: AssetPgRepository,
    },
  ],
  exports: [
    // Export pour autres modules (Budget, Cost-Structure)
    ImmobilisationGuardian,
    ASSET_REPOSITORY,
  ],
})
export class ImmobilisationModule {}
