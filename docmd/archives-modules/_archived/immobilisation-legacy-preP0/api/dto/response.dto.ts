/**
 * Immobilisation Module - API Response DTOs
 * Conformité: API_READ_ONLY.md v1.0.0
 * 
 * DTOs pour les réponses API (read-only).
 */

import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ═══════════════════════════════════════════════════════════════════════════
// COMMON RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Réponse paginée générique
 */
export class PaginatedResponseDTO<T> {
  @ApiProperty({ description: 'Liste des éléments' })
  items: T[];

  @ApiProperty({ example: 1, description: 'Numéro de page' })
  page: number;

  @ApiProperty({ example: 20, description: 'Taille de page' })
  limit: number;

  @ApiProperty({ example: 42, description: 'Nombre total d\'éléments' })
  total: number;

  @ApiProperty({ example: true, description: 'Indique s\'il y a plus de résultats' })
  hasMore: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSET RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO pour un actif dans la liste
 */
export class AssetListItemDTO {
  @ApiProperty({ example: 'asset-001' })
  assetId: string;

  @ApiProperty({ example: 12000000 })
  acquisitionCost: number;

  @ApiProperty({ example: 'XAF' })
  currency: string;

  @ApiProperty({ example: '2024-01-01' })
  acquisitionDate: string;

  @ApiProperty({ example: 60 })
  usefulLifeMonths: number;

  @ApiProperty({ example: 'LINEAR' })
  depreciationMethod: string;

  @ApiProperty({ example: 1000000 })
  residualValue: number;

  @ApiPropertyOptional({ example: '2029-01-01' })
  renewalDate?: string;

  @ApiPropertyOptional({ example: 15000000 })
  replacementCost?: number;

  @ApiProperty({ example: 'IN_SERVICE', enum: ['IN_SERVICE', 'DISPOSED', 'SCRAPPED'] })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;
}

/**
 * DTO pour la VNC d'un actif
 */
export class AssetNetBookValueDTO {
  @ApiProperty({ example: 'asset-001' })
  assetId: string;

  @ApiProperty({ example: 12000000 })
  acquisitionCost: number;

  @ApiProperty({ example: 1000000 })
  residualValue: number;

  @ApiProperty({ example: 2200000 })
  accumulatedDepreciation: number;

  @ApiProperty({ example: 9800000 })
  netBookValue: number;

  @ApiProperty({ example: 'XAF' })
  currency: string;

  @ApiProperty({ example: 'IN_SERVICE' })
  status: string;

  @ApiPropertyOptional({ example: '2025-01' })
  lastPeriod?: string;
}

/**
 * DTO pour le détail complet d'un actif
 */
export class AssetDetailDTO {
  @ApiProperty({ type: AssetListItemDTO })
  asset: AssetListItemDTO;

  @ApiProperty({ type: AssetNetBookValueDTO })
  netBookValue: AssetNetBookValueDTO;

  @ApiProperty({ type: () => [DepreciationHistoryItemDTO] })
  depreciationHistory: DepreciationHistoryItemDTO[];

  @ApiProperty({ type: () => [MaintenanceHistoryItemDTO] })
  maintenanceHistory: MaintenanceHistoryItemDTO[];

  @ApiProperty({ type: () => [AllocationItemDTO] })
  allocations: AllocationItemDTO[];
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO pour un enregistrement d'amortissement
 */
export class DepreciationHistoryItemDTO {
  @ApiProperty({ example: 'sched-001' })
  scheduleId: string;

  @ApiProperty({ example: '2024-01' })
  period: string;

  @ApiProperty({ example: 183333.33 })
  depreciationAmount: number;

  @ApiProperty({ example: 183333.33 })
  accumulatedDepreciation: number;

  @ApiProperty({ example: 11816666.67 })
  netBookValue: number;

  @ApiProperty({ example: 'XAF' })
  currency: string;

  @ApiProperty({ example: '2024-01-31T00:00:00.000Z' })
  calculatedAt: string;
}

/**
 * DTO pour le résumé des amortissements par période
 * CONTRACTUEL: Cost-Structure
 */
export class DepreciationSummaryDTO {
  @ApiProperty({ example: '2025-01' })
  period: string;

  @ApiProperty({ example: 4500000 })
  totalDepreciation: number;

  @ApiProperty({ example: 12 })
  assetCount: number;

  @ApiProperty({ example: 'XAF' })
  currency: string;
}

/**
 * DTO pour une dotation ventilée
 * CONTRACTUEL: Cost-Structure
 */
export class DepreciationCostStructureExportItemDTO {
  @ApiProperty({ example: 'asset-001' })
  assetId: string;

  @ApiProperty({ example: 183333.33 })
  depreciationAmount: number;

  @ApiProperty({ example: 'PRODUCT', enum: ['PRODUCT', 'SERVICE', 'PROJECT'] })
  targetType: string;

  @ApiProperty({ example: 'product-001' })
  targetId: string;

  @ApiProperty({ example: 60 })
  percentage: number;

  @ApiProperty({ example: 110000 })
  allocatedAmount: number;

  @ApiProperty({ example: 'XAF' })
  currency: string;
}

/**
 * DTO pour l'export Cost-Structure
 */
export class DepreciationCostStructureExportDTO {
  @ApiProperty({ example: '2025-01' })
  period: string;

  @ApiProperty({ type: [DepreciationCostStructureExportItemDTO] })
  items: DepreciationCostStructureExportItemDTO[];

  @ApiProperty({ example: 5 })
  total: number;
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO pour une affectation
 * CONTRACTUEL: Cost-Structure
 */
export class AllocationItemDTO {
  @ApiProperty({ example: 'alloc-001' })
  allocationId: string;

  @ApiProperty({ example: 'asset-001' })
  assetId: string;

  @ApiProperty({ example: 'PRODUCT', enum: ['PRODUCT', 'SERVICE', 'PROJECT'] })
  targetType: string;

  @ApiProperty({ example: 'product-001' })
  targetId: string;

  @ApiProperty({ example: 60 })
  percentage: number;

  @ApiProperty({ example: '2024-01-01' })
  effectiveFrom: string;

  @ApiPropertyOptional({ example: null })
  effectiveTo?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO pour un enregistrement de maintenance
 */
export class MaintenanceHistoryItemDTO {
  @ApiProperty({ example: 'mnt-001' })
  maintenanceId: string;

  @ApiProperty({ example: 'asset-001' })
  assetId: string;

  @ApiProperty({ example: 'MAINTENANCE', enum: ['MAINTENANCE', 'REPAIR', 'SERVICE'] })
  maintenanceType: string;

  @ApiProperty({ example: '2024-06-15' })
  maintenanceDate: string;

  @ApiProperty({ example: 'Maintenance préventive semestrielle' })
  description: string;

  @ApiProperty({ example: 150000 })
  cost: number;

  @ApiProperty({ example: 'XAF' })
  currency: string;

  @ApiProperty({ example: 'Technicien A' })
  performedBy: string;

  @ApiProperty({ example: '2024-06-15T10:00:00.000Z' })
  recordedAt: string;
}

/**
 * DTO pour le résumé de maintenance par actif
 * CONTRACTUEL: Cost-Structure, Budget
 */
export class MaintenanceSummaryItemDTO {
  @ApiProperty({ example: 'asset-001' })
  assetId: string;

  @ApiProperty({ example: 500000 })
  totalMaintenanceCost: number;

  @ApiProperty({ example: 3 })
  interventionCount: number;

  @ApiPropertyOptional({ example: '2024-06-15' })
  firstIntervention?: string;

  @ApiPropertyOptional({ example: '2025-01-10' })
  lastIntervention?: string;

  @ApiProperty({ example: 'XAF' })
  currency: string;
}

/**
 * DTO pour la maintenance par période
 * CONTRACTUEL: Cost-Structure
 */
export class MaintenanceByPeriodItemDTO {
  @ApiProperty({ example: '2025-01' })
  period: string;

  @ApiProperty({ example: 225000 })
  totalMaintenanceCost: number;

  @ApiProperty({ example: 5 })
  interventionCount: number;

  @ApiProperty({ example: 3 })
  assetsMaintained: number;

  @ApiProperty({ example: 'XAF' })
  currency: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// RENEWAL RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO pour une projection de renouvellement
 * CONTRACTUEL: Budget
 */
export class RenewalProjectionItemDTO {
  @ApiProperty({ example: 'asset-001' })
  assetId: string;

  @ApiProperty({ example: 12000000 })
  acquisitionCost: number;

  @ApiProperty({ example: '2029-01-01' })
  renewalDate: string;

  @ApiPropertyOptional({ example: 15000000 })
  replacementCost?: number;

  @ApiProperty({ example: 2029 })
  renewalYear: number;

  @ApiProperty({ example: 1 })
  renewalMonth: number;

  @ApiProperty({ example: 'XAF' })
  currency: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DISPOSAL RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO pour un historique de cession
 */
export class DisposalHistoryItemDTO {
  @ApiProperty({ example: 'disp-001' })
  disposalId: string;

  @ApiProperty({ example: 'asset-003' })
  assetId: string;

  @ApiProperty({ example: '2025-01-15' })
  disposalDate: string;

  @ApiProperty({ example: 'SALE', enum: ['SALE', 'SCRAP'] })
  disposalType: string;

  @ApiProperty({ example: 300000 })
  disposalValue: number;

  @ApiProperty({ example: 100000 })
  netBookValue: number;

  @ApiProperty({ example: 200000 })
  gainOrLoss: number;

  @ApiProperty({ example: 'XAF' })
  currency: string;

  @ApiPropertyOptional({ example: null })
  reason?: string;

  @ApiProperty({ example: '2025-01-15T14:00:00.000Z' })
  disposedAt: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// KPI RESPONSE DTO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DTO pour les KPIs patrimoniales
 */
export class ImmobilisationKpiDTO {
  @ApiProperty({ example: 42 })
  assetsInService: number;

  @ApiProperty({ example: 5 })
  assetsDisposed: number;

  @ApiProperty({ example: 2 })
  assetsScrapped: number;

  @ApiProperty({ example: 49 })
  totalAssets: number;

  @ApiPropertyOptional({ example: 250000000 })
  totalAcquisitionCost?: number;

  @ApiPropertyOptional({ example: 180000000 })
  totalNetBookValue?: number;

  @ApiPropertyOptional({ example: 70000000 })
  totalAccumulatedDepreciation?: number;

  @ApiProperty({ example: 'XAF' })
  currency: string;
}
