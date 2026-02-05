/**
 * DTOs pour Write-Side - Module Immobilisation v1.0.0
 */

import { IsString, IsNumber, IsOptional, IsDateString, IsIn, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateAssetDTO {
  @ApiProperty({ description: 'Asset unique identifier' })
  @IsString()
  assetId!: string;

  @ApiProperty({ description: 'Asset designation' })
  @IsString()
  designation!: string;

  @ApiPropertyOptional({ description: 'Asset description' })
  @IsOptional()
  @IsString()
  description!: string | null;

  @ApiProperty({ description: 'Asset category' })
  @IsString()
  category!: string;

  @ApiProperty({ description: 'Acquisition cost' })
  @IsNumber()
  @Min(0.01)
  acquisitionCost!: number;

  @ApiProperty({ description: 'Currency code (ISO 4217)' })
  @IsString()
  currency!: string;

  @ApiProperty({ description: 'Acquisition date (ISO 8601)' })
  @IsDateString()
  acquisitionDate!: string;

  @ApiProperty({ description: 'Service start date (ISO 8601)' })
  @IsDateString()
  serviceStartDate!: string;

  @ApiProperty({ description: 'Useful life in months' })
  @IsNumber()
  @Min(1)
  usefulLifeMonths!: number;

  @ApiProperty({ description: 'Depreciation method', enum: ['LINEAR', 'DECLINING_BALANCE'] })
  @IsIn(['LINEAR', 'DECLINING_BALANCE'])
  depreciationMethod!: 'LINEAR' | 'DECLINING_BALANCE';

  @ApiProperty({ description: 'Residual value' })
  @IsNumber()
  @Min(0)
  residualValue!: number;

  @ApiPropertyOptional({ description: 'Renewal date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  renewalDate!: string | null;

  @ApiPropertyOptional({ description: 'Replacement cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  replacementCost!: number | null;

  @ApiProperty({ description: 'Actor ID performing the action' })
  @IsString()
  actorId!: string;
}

export class UpdateRenewalDTO {
  @ApiPropertyOptional({ description: 'New renewal date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  renewalDate!: string | null;

  @ApiPropertyOptional({ description: 'New replacement cost' })
  @IsOptional()
  @IsNumber()
  @Min(0)
  replacementCost!: number | null;

  @ApiProperty({ description: 'Actor ID performing the action' })
  @IsString()
  actorId!: string;
}

export class AllocateAssetDTO {
  @ApiProperty({ description: 'Allocation target type', enum: ['PRODUCT', 'PROJECT', 'ACTIVITY'] })
  @IsIn(['PRODUCT', 'PROJECT', 'ACTIVITY'])
  targetType!: 'PRODUCT' | 'PROJECT' | 'ACTIVITY';

  @ApiProperty({ description: 'Target ID' })
  @IsString()
  targetId!: string;

  @ApiProperty({ description: 'Allocation percentage (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  percentage!: number;

  @ApiProperty({ description: 'Effective from date (ISO 8601)' })
  @IsDateString()
  effectiveFrom!: string;

  @ApiPropertyOptional({ description: 'Effective to date (ISO 8601)' })
  @IsOptional()
  @IsDateString()
  effectiveTo!: string | null;

  @ApiProperty({ description: 'Actor ID performing the action' })
  @IsString()
  actorId!: string;
}

export class RecordDepreciationDTO {
  @ApiProperty({ description: 'Period (YYYY-MM)' })
  @IsString()
  period!: string;

  @ApiProperty({ description: 'Actor ID performing the action' })
  @IsString()
  actorId!: string;
}

export class RecordMaintenanceDTO {
  @ApiProperty({ description: 'Maintenance date (ISO 8601)' })
  @IsDateString()
  date!: string;

  @ApiProperty({ description: 'Maintenance cost' })
  @IsNumber()
  @Min(0)
  cost!: number;

  @ApiProperty({ description: 'Maintenance description' })
  @IsString()
  description!: string;

  @ApiProperty({ description: 'Actor ID performing the action' })
  @IsString()
  actorId!: string;
}

export class DisposeAssetDTO {
  @ApiProperty({ description: 'Disposal date (ISO 8601)' })
  @IsDateString()
  disposalDate!: string;

  @ApiProperty({ description: 'Disposal value' })
  @IsNumber()
  @Min(0)
  disposalValue!: number;

  @ApiProperty({ description: 'Actor ID performing the action' })
  @IsString()
  actorId!: string;
}
