/**
 * Immobilisation Module - API Query DTOs
 * Conformité: API_READ_ONLY.md v1.0.0
 * 
 * DTOs pour les paramètres de requête (query params).
 */

import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max, Matches } from 'class-validator';
import { Type, Transform } from 'class-transformer';

// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════

export enum AssetStatusFilter {
  IN_SERVICE = 'IN_SERVICE',
  DISPOSED = 'DISPOSED',
  SCRAPPED = 'SCRAPPED',
}

export enum AllocationTargetTypeFilter {
  PRODUCT = 'PRODUCT',
  SERVICE = 'SERVICE',
  PROJECT = 'PROJECT',
}

export enum MaintenanceTypeFilter {
  MAINTENANCE = 'MAINTENANCE',
  REPAIR = 'REPAIR',
  SERVICE = 'SERVICE',
}

export enum DisposalTypeFilter {
  SALE = 'SALE',
  SCRAP = 'SCRAP',
}

// ═══════════════════════════════════════════════════════════════════════════
// BASE QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Paramètres de pagination
 */
export class PaginationQueryDTO {
  @ApiPropertyOptional({ example: 1, description: 'Numéro de page', minimum: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 20, description: 'Taille de page', minimum: 1, maximum: 100 })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number = 20;
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSET QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query params pour la liste des actifs
 */
export class AssetListQueryDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({ 
    enum: AssetStatusFilter, 
    description: 'Filtrer par statut' 
  })
  @IsOptional()
  @IsEnum(AssetStatusFilter)
  status?: AssetStatusFilter;
}

/**
 * Query params pour la VNC des actifs
 */
export class AssetNetBookValueQueryDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({ 
    enum: AssetStatusFilter, 
    description: 'Filtrer par statut' 
  })
  @IsOptional()
  @IsEnum(AssetStatusFilter)
  status?: AssetStatusFilter;

  @ApiPropertyOptional({ description: 'Filtrer par ID d\'actif' })
  @IsOptional()
  @IsString()
  assetId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query params pour l'historique des amortissements
 */
export class DepreciationHistoryQueryDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({ 
    example: '2024-01', 
    description: 'Période de début (YYYY-MM)' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'fromPeriod must be YYYY-MM format' })
  fromPeriod?: string;

  @ApiPropertyOptional({ 
    example: '2025-12', 
    description: 'Période de fin (YYYY-MM)' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'toPeriod must be YYYY-MM format' })
  toPeriod?: string;
}

/**
 * Query params pour le résumé des amortissements
 * CONTRACTUEL: Cost-Structure
 */
export class DepreciationSummaryQueryDTO {
  @ApiPropertyOptional({ 
    example: '2025-01', 
    description: 'Période (YYYY-MM) - obligatoire',
    required: true
  })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'period must be YYYY-MM format' })
  period: string;
}

/**
 * Query params pour l'export Cost-Structure
 */
export class DepreciationCostStructureExportQueryDTO {
  @ApiPropertyOptional({ 
    example: '2025-01', 
    description: 'Période (YYYY-MM) - obligatoire',
    required: true
  })
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'period must be YYYY-MM format' })
  period: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query params pour les allocations
 * CONTRACTUEL: Cost-Structure
 */
export class AllocationQueryDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({ description: 'Filtrer par ID d\'actif' })
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional({ 
    enum: AllocationTargetTypeFilter, 
    description: 'Filtrer par type de cible' 
  })
  @IsOptional()
  @IsEnum(AllocationTargetTypeFilter)
  targetType?: AllocationTargetTypeFilter;

  @ApiPropertyOptional({ description: 'Filtrer par ID de cible' })
  @IsOptional()
  @IsString()
  targetId?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query params pour l'historique de maintenance
 */
export class MaintenanceHistoryQueryDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({ description: 'Filtrer par ID d\'actif' })
  @IsOptional()
  @IsString()
  assetId?: string;

  @ApiPropertyOptional({ 
    enum: MaintenanceTypeFilter, 
    description: 'Filtrer par type de maintenance' 
  })
  @IsOptional()
  @IsEnum(MaintenanceTypeFilter)
  type?: MaintenanceTypeFilter;

  @ApiPropertyOptional({ 
    example: '2024-01-01', 
    description: 'Date de début (ISO)' 
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ 
    example: '2025-12-31', 
    description: 'Date de fin (ISO)' 
  })
  @IsOptional()
  @IsString()
  toDate?: string;
}

/**
 * Query params pour le résumé de maintenance
 * CONTRACTUEL: Cost-Structure, Budget
 */
export class MaintenanceSummaryQueryDTO {
  @ApiPropertyOptional({ description: 'Filtrer par ID d\'actif' })
  @IsOptional()
  @IsString()
  assetId?: string;
}

/**
 * Query params pour la maintenance par période
 * CONTRACTUEL: Cost-Structure
 */
export class MaintenanceByPeriodQueryDTO {
  @ApiPropertyOptional({ 
    example: '2024-01', 
    description: 'Période de début (YYYY-MM)' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'fromPeriod must be YYYY-MM format' })
  fromPeriod?: string;

  @ApiPropertyOptional({ 
    example: '2025-12', 
    description: 'Période de fin (YYYY-MM)' 
  })
  @IsOptional()
  @IsString()
  @Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'toPeriod must be YYYY-MM format' })
  toPeriod?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// RENEWAL QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query params pour les projections de renouvellement
 * CONTRACTUEL: Budget
 */
export class RenewalQueryDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({ 
    example: 2026, 
    description: 'Année de début' 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  fromYear?: number;

  @ApiPropertyOptional({ 
    example: 2030, 
    description: 'Année de fin' 
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  toYear?: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// DISPOSAL QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Query params pour l'historique des cessions
 */
export class DisposalQueryDTO extends PaginationQueryDTO {
  @ApiPropertyOptional({ 
    enum: DisposalTypeFilter, 
    description: 'Filtrer par type de cession' 
  })
  @IsOptional()
  @IsEnum(DisposalTypeFilter)
  disposalType?: DisposalTypeFilter;

  @ApiPropertyOptional({ 
    example: '2024-01-01', 
    description: 'Date de début (ISO)' 
  })
  @IsOptional()
  @IsString()
  fromDate?: string;

  @ApiPropertyOptional({ 
    example: '2025-12-31', 
    description: 'Date de fin (ISO)' 
  })
  @IsOptional()
  @IsString()
  toDate?: string;
}
