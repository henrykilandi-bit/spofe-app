/**
 * Write Controller - Module Immobilisation v1.0.0
 * 
 * HTTP Controller pour le write-side (commands).
 * Mapping HTTP → Command → Handler.
 * 
 * ❌ Aucune logique métier
 * ✅ Uniquement du routing et du mapping
 */

import * as crypto from 'crypto';
import {
  Controller,
  Post,
  Patch,
  Body,
  Headers,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
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

import {
  CreateAssetDTO,
  UpdateRenewalDTO,
  AllocateAssetDTO,
  RecordDepreciationDTO,
  RecordMaintenanceDTO,
  DisposeAssetDTO,
} from '../dto/write.dto.js';

@ApiTags('Immobilisation - Write')
@Controller('/api/immobilisation')
export class ImmobilisationWriteController {
  constructor(
    private readonly createAssetHandler: CreateAssetHandler,
    private readonly updateRenewalHandler: UpdateRenewalHandler,
    private readonly allocateAssetHandler: AllocateAssetHandler,
    private readonly recordDepreciationHandler: RecordDepreciationHandler,
    private readonly recordMaintenanceHandler: RecordMaintenanceHandler,
    private readonly disposeAssetHandler: DisposeAssetHandler,
  ) {}

  @Post('/assets')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new asset' })
  @ApiHeader({ name: 'X-Tenant-Id', required: true })
  async createAsset(
    @Headers('X-Tenant-Id') tenantId: string,
    @Body() dto: CreateAssetDTO,
  ): Promise<{ status: string; assetId: string }> {
    const command = new CreateAssetCommand(
      tenantId,
      dto.assetId,
      dto.designation,
      dto.description,
      dto.category,
      dto.acquisitionCost,
      dto.currency,
      dto.acquisitionDate,
      dto.serviceStartDate,
      dto.usefulLifeMonths,
      dto.depreciationMethod,
      dto.residualValue,
      dto.renewalDate,
      dto.replacementCost,
      dto.actorId,
    );

    await this.createAssetHandler.execute(command);

    return { status: 'CREATED', assetId: dto.assetId };
  }

  @Patch('/assets/:assetId/renewal')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Update asset renewal information' })
  @ApiHeader({ name: 'X-Tenant-Id', required: true })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  async updateRenewal(
    @Headers('X-Tenant-Id') tenantId: string,
    @Param('assetId') assetId: string,
    @Body() dto: UpdateRenewalDTO,
  ): Promise<{ status: string }> {
    const command = new UpdateRenewalCommand(
      tenantId,
      assetId,
      dto.renewalDate,
      dto.replacementCost,
      dto.currency,
      dto.actorId,
    );

    await this.updateRenewalHandler.execute(command);

    return { status: 'OK' };
  }

  @Post('/assets/:assetId/allocations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Allocate asset to a target' })
  @ApiHeader({ name: 'X-Tenant-Id', required: true })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  async allocateAsset(
    @Headers('X-Tenant-Id') tenantId: string,
    @Param('assetId') assetId: string,
    @Body() dto: AllocateAssetDTO,
  ): Promise<{ status: string }> {
    const command = new AllocateAssetCommand(
      tenantId,
      dto.allocationId || crypto.randomUUID(),
      assetId,
      dto.targetType,
      dto.targetId,
      dto.percentage,
      dto.effectiveFrom,
      dto.effectiveTo,
      dto.actorId,
    );

    await this.allocateAssetHandler.execute(command);

    return { status: 'CREATED' };
  }

  @Post('/assets/:assetId/depreciations')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record depreciation for a period' })
  @ApiHeader({ name: 'X-Tenant-Id', required: true })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  async recordDepreciation(
    @Headers('X-Tenant-Id') tenantId: string,
    @Param('assetId') assetId: string,
    @Body() dto: RecordDepreciationDTO,
  ): Promise<{ status: string }> {
    const command = new RecordDepreciationCommand(
      tenantId,
      assetId,
      dto.period,
      dto.actorId,
    );

    await this.recordDepreciationHandler.execute(command);

    return { status: 'CREATED' };
  }

  @Post('/assets/:assetId/maintenances')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Record maintenance expense' })
  @ApiHeader({ name: 'X-Tenant-Id', required: true })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  async recordMaintenance(
    @Headers('X-Tenant-Id') tenantId: string,
    @Param('assetId') assetId: string,
    @Body() dto: RecordMaintenanceDTO,
  ): Promise<{ status: string }> {
    const command = new RecordMaintenanceCommand(
      tenantId,
      crypto.randomUUID(),
      assetId,
      dto.type || 'PREVENTIVE',
      dto.description,
      dto.cost,
      dto.currency || 'XAF',
      dto.date,
      dto.vendor || null,
      dto.actorId,
    );

    await this.recordMaintenanceHandler.execute(command);

    return { status: 'CREATED' };
  }

  @Post('/assets/:assetId/dispose')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Dispose an asset' })
  @ApiHeader({ name: 'X-Tenant-Id', required: true })
  @ApiParam({ name: 'assetId', description: 'Asset ID' })
  async disposeAsset(
    @Headers('X-Tenant-Id') tenantId: string,
    @Param('assetId') assetId: string,
    @Body() dto: DisposeAssetDTO,
  ): Promise<{ status: string; gainOrLoss: number }> {
    const command = new DisposeAssetCommand(
      tenantId,
      assetId,
      dto.disposalType || 'SALE',
      dto.disposalDate,
      dto.disposalValue,
      dto.currency || 'XAF',
      dto.purchaser || null,
      dto.reason || 'Disposal',
      dto.actorId,
    );

    await this.disposeAssetHandler.execute(command);

    return { status: 'DISPOSED', gainOrLoss: 0 }; // gainOrLoss calculé par le Guardian
  }
}
