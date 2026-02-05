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
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var _a, _b;
import { Injectable } from '@nestjs/common';
import { ImmobilisationGuardian } from '../../../guardian/immobilisation.guardian';
import { AssetCreated } from '../../../domain/events';
import { AssetWriteRepository } from '../../repository/asset.repository';
let CreateAssetHandler = class CreateAssetHandler {
    guardian;
    repository;
    constructor(guardian, repository) {
        this.guardian = guardian;
        this.repository = repository;
    }
    async execute(command) {
        // 1️⃣ BUILD STATE (minimal pour création)
        const state = {
            tenantId: command.tenantId,
            now: new Date(),
        };
        // 2️⃣ GUARDIAN VALIDATION (point UNIQUE de validation)
        this.guardian.validate(command, state);
        // 3️⃣ GENERATE EVENT
        const event = new AssetCreated({
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
        }, {
            eventId: this.generateId(),
            correlationId: this.generateId(),
            actorId: command.actorId,
            timestamp: new Date(),
            version: 1,
        });
        // 4️⃣ PERSIST
        await this.repository.saveAsset(event);
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
};
CreateAssetHandler = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof ImmobilisationGuardian !== "undefined" && ImmobilisationGuardian) === "function" ? _a : Object, typeof (_b = typeof AssetWriteRepository !== "undefined" && AssetWriteRepository) === "function" ? _b : Object])
], CreateAssetHandler);
export { CreateAssetHandler };
//# sourceMappingURL=create-asset.handler.js.map