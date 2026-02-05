/**
 * Write Controller - Module Immobilisation v1.0.0
 *
 * HTTP Controller pour le write-side (commands).
 * Mapping HTTP → Command → Handler.
 *
 * ❌ Aucune logique métier
 * ✅ Uniquement du routing et du mapping
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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
import * as crypto from 'crypto';
import { Controller, Post, Patch, Body, Headers, Param, HttpCode, HttpStatus, } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiHeader, ApiParam } from '@nestjs/swagger';
import { CreateAssetHandler } from '../../write/handlers/create-asset.handler.js';
import { UpdateRenewalHandler } from '../../write/handlers/update-renewal.handler.js';
import { AllocateAssetHandler } from '../../write/handlers/allocate-asset.handler.js';
import { RecordDepreciationHandler } from '../../write/handlers/record-depreciation.handler.js';
import { RecordMaintenanceHandler } from '../../write/handlers/record-maintenance.handler.js';
import { DisposeAssetHandler } from '../../write/handlers/dispose-asset.handler.js';
import { CreateAssetCommand } from '../../write/commands/create-asset.command.js';
import { UpdateRenewalCommand } from '../../write/commands/update-renewal.command.js';
import { AllocateAssetCommand } from '../../write/commands/allocate-asset.command.js';
import { RecordDepreciationCommand } from '../../write/commands/record-depreciation.command.js';
import { RecordMaintenanceCommand } from '../../write/commands/record-maintenance.command.js';
import { DisposeAssetCommand } from '../../write/commands/dispose-asset.command.js';
import { CreateAssetDTO, UpdateRenewalDTO, AllocateAssetDTO, RecordDepreciationDTO, RecordMaintenanceDTO, DisposeAssetDTO, } from '../dto/write.dto.js';
let ImmobilisationWriteController = class ImmobilisationWriteController {
    createAssetHandler;
    updateRenewalHandler;
    allocateAssetHandler;
    recordDepreciationHandler;
    recordMaintenanceHandler;
    disposeAssetHandler;
    constructor(createAssetHandler, updateRenewalHandler, allocateAssetHandler, recordDepreciationHandler, recordMaintenanceHandler, disposeAssetHandler) {
        this.createAssetHandler = createAssetHandler;
        this.updateRenewalHandler = updateRenewalHandler;
        this.allocateAssetHandler = allocateAssetHandler;
        this.recordDepreciationHandler = recordDepreciationHandler;
        this.recordMaintenanceHandler = recordMaintenanceHandler;
        this.disposeAssetHandler = disposeAssetHandler;
    }
    async createAsset(tenantId, dto) {
        const command = new CreateAssetCommand(tenantId, dto.assetId, dto.designation, dto.description, dto.category, dto.acquisitionCost, dto.currency, dto.acquisitionDate, dto.serviceStartDate, dto.usefulLifeMonths, dto.depreciationMethod, dto.residualValue, dto.renewalDate, dto.replacementCost, dto.actorId);
        await this.createAssetHandler.execute(command);
        return { status: 'CREATED', assetId: dto.assetId };
    }
    async updateRenewal(tenantId, assetId, dto) {
        const command = new UpdateRenewalCommand(tenantId, assetId, dto.renewalDate, dto.replacementCost, dto.currency, dto.actorId);
        await this.updateRenewalHandler.execute(command);
        return { status: 'OK' };
    }
    async allocateAsset(tenantId, assetId, dto) {
        const command = new AllocateAssetCommand(tenantId, dto.allocationId || crypto.randomUUID(), assetId, dto.targetType, dto.targetId, dto.percentage, dto.effectiveFrom, dto.effectiveTo, dto.actorId);
        await this.allocateAssetHandler.execute(command);
        return { status: 'CREATED' };
    }
    async recordDepreciation(tenantId, assetId, dto) {
        const command = new RecordDepreciationCommand(tenantId, assetId, dto.period, dto.actorId);
        await this.recordDepreciationHandler.execute(command);
        return { status: 'CREATED' };
    }
    async recordMaintenance(tenantId, assetId, dto) {
        const command = new RecordMaintenanceCommand(tenantId, crypto.randomUUID(), assetId, dto.type || 'PREVENTIVE', dto.description, dto.cost, dto.currency || 'XAF', dto.date, dto.vendor || null, dto.actorId);
        await this.recordMaintenanceHandler.execute(command);
        return { status: 'CREATED' };
    }
    async disposeAsset(tenantId, assetId, dto) {
        const command = new DisposeAssetCommand(tenantId, assetId, dto.disposalType || 'SALE', dto.disposalDate, dto.disposalValue, dto.currency || 'XAF', dto.purchaser || null, dto.reason || 'Disposal', dto.actorId);
        await this.disposeAssetHandler.execute(command);
        return { status: 'DISPOSED', gainOrLoss: 0 }; // gainOrLoss calculé par le Guardian
    }
};
__decorate([
    Post('/assets'),
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ summary: 'Create a new asset' }),
    ApiHeader({ name: 'X-Tenant-Id', required: true }),
    __param(0, Headers('X-Tenant-Id')),
    __param(1, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, CreateAssetDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationWriteController.prototype, "createAsset", null);
__decorate([
    Patch('/assets/:assetId/renewal'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Update asset renewal information' }),
    ApiHeader({ name: 'X-Tenant-Id', required: true }),
    ApiParam({ name: 'assetId', description: 'Asset ID' }),
    __param(0, Headers('X-Tenant-Id')),
    __param(1, Param('assetId')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, UpdateRenewalDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationWriteController.prototype, "updateRenewal", null);
__decorate([
    Post('/assets/:assetId/allocations'),
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ summary: 'Allocate asset to a target' }),
    ApiHeader({ name: 'X-Tenant-Id', required: true }),
    ApiParam({ name: 'assetId', description: 'Asset ID' }),
    __param(0, Headers('X-Tenant-Id')),
    __param(1, Param('assetId')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, AllocateAssetDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationWriteController.prototype, "allocateAsset", null);
__decorate([
    Post('/assets/:assetId/depreciations'),
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ summary: 'Record depreciation for a period' }),
    ApiHeader({ name: 'X-Tenant-Id', required: true }),
    ApiParam({ name: 'assetId', description: 'Asset ID' }),
    __param(0, Headers('X-Tenant-Id')),
    __param(1, Param('assetId')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, RecordDepreciationDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationWriteController.prototype, "recordDepreciation", null);
__decorate([
    Post('/assets/:assetId/maintenances'),
    HttpCode(HttpStatus.CREATED),
    ApiOperation({ summary: 'Record maintenance expense' }),
    ApiHeader({ name: 'X-Tenant-Id', required: true }),
    ApiParam({ name: 'assetId', description: 'Asset ID' }),
    __param(0, Headers('X-Tenant-Id')),
    __param(1, Param('assetId')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, RecordMaintenanceDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationWriteController.prototype, "recordMaintenance", null);
__decorate([
    Post('/assets/:assetId/dispose'),
    HttpCode(HttpStatus.OK),
    ApiOperation({ summary: 'Dispose an asset' }),
    ApiHeader({ name: 'X-Tenant-Id', required: true }),
    ApiParam({ name: 'assetId', description: 'Asset ID' }),
    __param(0, Headers('X-Tenant-Id')),
    __param(1, Param('assetId')),
    __param(2, Body()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, String, DisposeAssetDTO]),
    __metadata("design:returntype", Promise)
], ImmobilisationWriteController.prototype, "disposeAsset", null);
ImmobilisationWriteController = __decorate([
    ApiTags('Immobilisation - Write'),
    Controller('/api/immobilisation'),
    __metadata("design:paramtypes", [CreateAssetHandler,
        UpdateRenewalHandler,
        AllocateAssetHandler,
        RecordDepreciationHandler,
        RecordMaintenanceHandler,
        DisposeAssetHandler])
], ImmobilisationWriteController);
export { ImmobilisationWriteController };
//# sourceMappingURL=immobilisation-write.controller.js.map