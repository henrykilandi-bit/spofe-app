/**
 * Handler: RecordDepreciation
 * Module Immobilisation v1.0.0
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
import { DepreciationRecorded } from '../../../domain/events';
import { AssetWriteRepository } from '../../repository/asset.repository';
let RecordDepreciationHandler = class RecordDepreciationHandler {
    guardian;
    repository;
    constructor(guardian, repository) {
        this.guardian = guardian;
        this.repository = repository;
    }
    async execute(command) {
        // 1️⃣ LOAD STATE
        const asset = await this.repository.getAssetById(command.tenantId, command.assetId);
        const depreciation = await this.repository.getDepreciationState(command.tenantId, command.assetId);
        const state = {
            tenantId: command.tenantId,
            now: new Date(),
            asset: this.mapToAssetState(asset),
            depreciation: this.mapToDepreciationState(depreciation),
        };
        // 2️⃣ GUARDIAN VALIDATION
        this.guardian.validate(command, state);
        // 3️⃣ CALCULATE DEPRECIATION (via Guardian)
        const calculation = this.guardian.calculateDepreciation(state.asset, state.depreciation, command.period);
        // 4️⃣ GENERATE EVENT
        const event = new DepreciationRecorded({
            tenantId: command.tenantId,
            assetId: command.assetId,
            period: calculation.period,
            depreciationAmount: calculation.depreciationAmount,
            accumulatedDepreciation: calculation.newAccumulatedDepreciation,
            netBookValue: calculation.newNetBookValue,
        }, {
            eventId: this.generateId(),
            correlationId: this.generateId(),
            actorId: command.actorId,
            timestamp: new Date(),
            version: 1,
        });
        // 5️⃣ PERSIST
        await this.repository.saveEvent(event);
    }
    mapToAssetState(asset) {
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
    mapToDepreciationState(dep) {
        return {
            assetId: dep.assetId,
            depreciatedPeriods: dep.depreciatedPeriods,
            accumulatedDepreciation: dep.accumulatedDepreciation,
            netBookValue: dep.netBookValue,
        };
    }
    generateId() {
        return `${Date.now()}-${Math.random().toString(36).substring(2, 11)}`;
    }
};
RecordDepreciationHandler = __decorate([
    Injectable(),
    __metadata("design:paramtypes", [typeof (_a = typeof ImmobilisationGuardian !== "undefined" && ImmobilisationGuardian) === "function" ? _a : Object, typeof (_b = typeof AssetWriteRepository !== "undefined" && AssetWriteRepository) === "function" ? _b : Object])
], RecordDepreciationHandler);
export { RecordDepreciationHandler };
//# sourceMappingURL=record-depreciation.handler.js.map