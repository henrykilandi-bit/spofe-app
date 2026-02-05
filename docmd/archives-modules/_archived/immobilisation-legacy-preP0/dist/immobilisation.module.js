/**
 * Immobilisation Module - NestJS v1.0.0
 *
 * Module complet write + read side.
 * Conforme au contrat SPOFE et CONTRACT.md v1.0.0
 */
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
import { Module } from '@nestjs/common';
// Controllers
import { ImmobilisationReadController, ImmobilisationCostStructureController, ImmobilisationBudgetController, ImmobilisationWriteController, } from './api/controllers/index.js';
// Guardian
import { ImmobilisationGuardian } from './guardian/immobilisation.guardian.js';
// Handlers (Write-side)
import { CreateAssetHandler, UpdateRenewalHandler, AllocateAssetHandler, RecordDepreciationHandler, RecordMaintenanceHandler, DisposeAssetHandler, } from './write/handlers/index.js';
// Repositories
import { ASSET_REPOSITORY, } from './write/repository/asset.repository.js';
import { AssetPgRepository } from './write/repository/asset.pg.repository.js';
let ImmobilisationModule = class ImmobilisationModule {
};
ImmobilisationModule = __decorate([
    Module({
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
], ImmobilisationModule);
export { ImmobilisationModule };
//# sourceMappingURL=immobilisation.module.js.map