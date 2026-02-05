/**
 * Immobilisation Module - API Response DTOs
 * Conformité: API_READ_ONLY.md v1.0.0
 *
 * DTOs pour les réponses API (read-only).
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
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
// ═══════════════════════════════════════════════════════════════════════════
// COMMON RESPONSE TYPES
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Réponse paginée générique
 */
export class PaginatedResponseDTO {
    items;
    page;
    limit;
    total;
    hasMore;
}
__decorate([
    ApiProperty({ description: 'Liste des éléments' }),
    __metadata("design:type", Array)
], PaginatedResponseDTO.prototype, "items", void 0);
__decorate([
    ApiProperty({ example: 1, description: 'Numéro de page' }),
    __metadata("design:type", Number)
], PaginatedResponseDTO.prototype, "page", void 0);
__decorate([
    ApiProperty({ example: 20, description: 'Taille de page' }),
    __metadata("design:type", Number)
], PaginatedResponseDTO.prototype, "limit", void 0);
__decorate([
    ApiProperty({ example: 42, description: 'Nombre total d\'éléments' }),
    __metadata("design:type", Number)
], PaginatedResponseDTO.prototype, "total", void 0);
__decorate([
    ApiProperty({ example: true, description: 'Indique s\'il y a plus de résultats' }),
    __metadata("design:type", Boolean)
], PaginatedResponseDTO.prototype, "hasMore", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// ASSET RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * DTO pour un actif dans la liste
 */
export class AssetListItemDTO {
    assetId;
    acquisitionCost;
    currency;
    acquisitionDate;
    usefulLifeMonths;
    depreciationMethod;
    residualValue;
    renewalDate;
    replacementCost;
    status;
    createdAt;
}
__decorate([
    ApiProperty({ example: 'asset-001' }),
    __metadata("design:type", String)
], AssetListItemDTO.prototype, "assetId", void 0);
__decorate([
    ApiProperty({ example: 12000000 }),
    __metadata("design:type", Number)
], AssetListItemDTO.prototype, "acquisitionCost", void 0);
__decorate([
    ApiProperty({ example: 'XAF' }),
    __metadata("design:type", String)
], AssetListItemDTO.prototype, "currency", void 0);
__decorate([
    ApiProperty({ example: '2024-01-01' }),
    __metadata("design:type", String)
], AssetListItemDTO.prototype, "acquisitionDate", void 0);
__decorate([
    ApiProperty({ example: 60 }),
    __metadata("design:type", Number)
], AssetListItemDTO.prototype, "usefulLifeMonths", void 0);
__decorate([
    ApiProperty({ example: 'LINEAR' }),
    __metadata("design:type", String)
], AssetListItemDTO.prototype, "depreciationMethod", void 0);
__decorate([
    ApiProperty({ example: 1000000 }),
    __metadata("design:type", Number)
], AssetListItemDTO.prototype, "residualValue", void 0);
__decorate([
    ApiPropertyOptional({ example: '2029-01-01' }),
    __metadata("design:type", String)
], AssetListItemDTO.prototype, "renewalDate", void 0);
__decorate([
    ApiPropertyOptional({ example: 15000000 }),
    __metadata("design:type", Number)
], AssetListItemDTO.prototype, "replacementCost", void 0);
__decorate([
    ApiProperty({ example: 'IN_SERVICE', enum: ['IN_SERVICE', 'DISPOSED', 'SCRAPPED'] }),
    __metadata("design:type", String)
], AssetListItemDTO.prototype, "status", void 0);
__decorate([
    ApiProperty({ example: '2024-01-01T00:00:00.000Z' }),
    __metadata("design:type", String)
], AssetListItemDTO.prototype, "createdAt", void 0);
/**
 * DTO pour la VNC d'un actif
 */
export class AssetNetBookValueDTO {
    assetId;
    acquisitionCost;
    residualValue;
    accumulatedDepreciation;
    netBookValue;
    currency;
    status;
    lastPeriod;
}
__decorate([
    ApiProperty({ example: 'asset-001' }),
    __metadata("design:type", String)
], AssetNetBookValueDTO.prototype, "assetId", void 0);
__decorate([
    ApiProperty({ example: 12000000 }),
    __metadata("design:type", Number)
], AssetNetBookValueDTO.prototype, "acquisitionCost", void 0);
__decorate([
    ApiProperty({ example: 1000000 }),
    __metadata("design:type", Number)
], AssetNetBookValueDTO.prototype, "residualValue", void 0);
__decorate([
    ApiProperty({ example: 2200000 }),
    __metadata("design:type", Number)
], AssetNetBookValueDTO.prototype, "accumulatedDepreciation", void 0);
__decorate([
    ApiProperty({ example: 9800000 }),
    __metadata("design:type", Number)
], AssetNetBookValueDTO.prototype, "netBookValue", void 0);
__decorate([
    ApiProperty({ example: 'XAF' }),
    __metadata("design:type", String)
], AssetNetBookValueDTO.prototype, "currency", void 0);
__decorate([
    ApiProperty({ example: 'IN_SERVICE' }),
    __metadata("design:type", String)
], AssetNetBookValueDTO.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ example: '2025-01' }),
    __metadata("design:type", String)
], AssetNetBookValueDTO.prototype, "lastPeriod", void 0);
/**
 * DTO pour le détail complet d'un actif
 */
export class AssetDetailDTO {
    asset;
    netBookValue;
    depreciationHistory;
    maintenanceHistory;
    allocations;
}
__decorate([
    ApiProperty({ type: AssetListItemDTO }),
    __metadata("design:type", AssetListItemDTO)
], AssetDetailDTO.prototype, "asset", void 0);
__decorate([
    ApiProperty({ type: AssetNetBookValueDTO }),
    __metadata("design:type", AssetNetBookValueDTO)
], AssetDetailDTO.prototype, "netBookValue", void 0);
__decorate([
    ApiProperty({ type: () => [DepreciationHistoryItemDTO] }),
    __metadata("design:type", Array)
], AssetDetailDTO.prototype, "depreciationHistory", void 0);
__decorate([
    ApiProperty({ type: () => [MaintenanceHistoryItemDTO] }),
    __metadata("design:type", Array)
], AssetDetailDTO.prototype, "maintenanceHistory", void 0);
__decorate([
    ApiProperty({ type: () => [AllocationItemDTO] }),
    __metadata("design:type", Array)
], AssetDetailDTO.prototype, "allocations", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * DTO pour un enregistrement d'amortissement
 */
export class DepreciationHistoryItemDTO {
    scheduleId;
    period;
    depreciationAmount;
    accumulatedDepreciation;
    netBookValue;
    currency;
    calculatedAt;
}
__decorate([
    ApiProperty({ example: 'sched-001' }),
    __metadata("design:type", String)
], DepreciationHistoryItemDTO.prototype, "scheduleId", void 0);
__decorate([
    ApiProperty({ example: '2024-01' }),
    __metadata("design:type", String)
], DepreciationHistoryItemDTO.prototype, "period", void 0);
__decorate([
    ApiProperty({ example: 183333.33 }),
    __metadata("design:type", Number)
], DepreciationHistoryItemDTO.prototype, "depreciationAmount", void 0);
__decorate([
    ApiProperty({ example: 183333.33 }),
    __metadata("design:type", Number)
], DepreciationHistoryItemDTO.prototype, "accumulatedDepreciation", void 0);
__decorate([
    ApiProperty({ example: 11816666.67 }),
    __metadata("design:type", Number)
], DepreciationHistoryItemDTO.prototype, "netBookValue", void 0);
__decorate([
    ApiProperty({ example: 'XAF' }),
    __metadata("design:type", String)
], DepreciationHistoryItemDTO.prototype, "currency", void 0);
__decorate([
    ApiProperty({ example: '2024-01-31T00:00:00.000Z' }),
    __metadata("design:type", String)
], DepreciationHistoryItemDTO.prototype, "calculatedAt", void 0);
/**
 * DTO pour le résumé des amortissements par période
 * CONTRACTUEL: Cost-Structure
 */
export class DepreciationSummaryDTO {
    period;
    totalDepreciation;
    assetCount;
    currency;
}
__decorate([
    ApiProperty({ example: '2025-01' }),
    __metadata("design:type", String)
], DepreciationSummaryDTO.prototype, "period", void 0);
__decorate([
    ApiProperty({ example: 4500000 }),
    __metadata("design:type", Number)
], DepreciationSummaryDTO.prototype, "totalDepreciation", void 0);
__decorate([
    ApiProperty({ example: 12 }),
    __metadata("design:type", Number)
], DepreciationSummaryDTO.prototype, "assetCount", void 0);
__decorate([
    ApiProperty({ example: 'XAF' }),
    __metadata("design:type", String)
], DepreciationSummaryDTO.prototype, "currency", void 0);
/**
 * DTO pour une dotation ventilée
 * CONTRACTUEL: Cost-Structure
 */
export class DepreciationCostStructureExportItemDTO {
    assetId;
    depreciationAmount;
    targetType;
    targetId;
    percentage;
    allocatedAmount;
    currency;
}
__decorate([
    ApiProperty({ example: 'asset-001' }),
    __metadata("design:type", String)
], DepreciationCostStructureExportItemDTO.prototype, "assetId", void 0);
__decorate([
    ApiProperty({ example: 183333.33 }),
    __metadata("design:type", Number)
], DepreciationCostStructureExportItemDTO.prototype, "depreciationAmount", void 0);
__decorate([
    ApiProperty({ example: 'PRODUCT', enum: ['PRODUCT', 'SERVICE', 'PROJECT'] }),
    __metadata("design:type", String)
], DepreciationCostStructureExportItemDTO.prototype, "targetType", void 0);
__decorate([
    ApiProperty({ example: 'product-001' }),
    __metadata("design:type", String)
], DepreciationCostStructureExportItemDTO.prototype, "targetId", void 0);
__decorate([
    ApiProperty({ example: 60 }),
    __metadata("design:type", Number)
], DepreciationCostStructureExportItemDTO.prototype, "percentage", void 0);
__decorate([
    ApiProperty({ example: 110000 }),
    __metadata("design:type", Number)
], DepreciationCostStructureExportItemDTO.prototype, "allocatedAmount", void 0);
__decorate([
    ApiProperty({ example: 'XAF' }),
    __metadata("design:type", String)
], DepreciationCostStructureExportItemDTO.prototype, "currency", void 0);
/**
 * DTO pour l'export Cost-Structure
 */
export class DepreciationCostStructureExportDTO {
    period;
    items;
    total;
}
__decorate([
    ApiProperty({ example: '2025-01' }),
    __metadata("design:type", String)
], DepreciationCostStructureExportDTO.prototype, "period", void 0);
__decorate([
    ApiProperty({ type: [DepreciationCostStructureExportItemDTO] }),
    __metadata("design:type", Array)
], DepreciationCostStructureExportDTO.prototype, "items", void 0);
__decorate([
    ApiProperty({ example: 5 }),
    __metadata("design:type", Number)
], DepreciationCostStructureExportDTO.prototype, "total", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * DTO pour une affectation
 * CONTRACTUEL: Cost-Structure
 */
export class AllocationItemDTO {
    allocationId;
    assetId;
    targetType;
    targetId;
    percentage;
    effectiveFrom;
    effectiveTo;
}
__decorate([
    ApiProperty({ example: 'alloc-001' }),
    __metadata("design:type", String)
], AllocationItemDTO.prototype, "allocationId", void 0);
__decorate([
    ApiProperty({ example: 'asset-001' }),
    __metadata("design:type", String)
], AllocationItemDTO.prototype, "assetId", void 0);
__decorate([
    ApiProperty({ example: 'PRODUCT', enum: ['PRODUCT', 'SERVICE', 'PROJECT'] }),
    __metadata("design:type", String)
], AllocationItemDTO.prototype, "targetType", void 0);
__decorate([
    ApiProperty({ example: 'product-001' }),
    __metadata("design:type", String)
], AllocationItemDTO.prototype, "targetId", void 0);
__decorate([
    ApiProperty({ example: 60 }),
    __metadata("design:type", Number)
], AllocationItemDTO.prototype, "percentage", void 0);
__decorate([
    ApiProperty({ example: '2024-01-01' }),
    __metadata("design:type", String)
], AllocationItemDTO.prototype, "effectiveFrom", void 0);
__decorate([
    ApiPropertyOptional({ example: null }),
    __metadata("design:type", String)
], AllocationItemDTO.prototype, "effectiveTo", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * DTO pour un enregistrement de maintenance
 */
export class MaintenanceHistoryItemDTO {
    maintenanceId;
    assetId;
    maintenanceType;
    maintenanceDate;
    description;
    cost;
    currency;
    performedBy;
    recordedAt;
}
__decorate([
    ApiProperty({ example: 'mnt-001' }),
    __metadata("design:type", String)
], MaintenanceHistoryItemDTO.prototype, "maintenanceId", void 0);
__decorate([
    ApiProperty({ example: 'asset-001' }),
    __metadata("design:type", String)
], MaintenanceHistoryItemDTO.prototype, "assetId", void 0);
__decorate([
    ApiProperty({ example: 'MAINTENANCE', enum: ['MAINTENANCE', 'REPAIR', 'SERVICE'] }),
    __metadata("design:type", String)
], MaintenanceHistoryItemDTO.prototype, "maintenanceType", void 0);
__decorate([
    ApiProperty({ example: '2024-06-15' }),
    __metadata("design:type", String)
], MaintenanceHistoryItemDTO.prototype, "maintenanceDate", void 0);
__decorate([
    ApiProperty({ example: 'Maintenance préventive semestrielle' }),
    __metadata("design:type", String)
], MaintenanceHistoryItemDTO.prototype, "description", void 0);
__decorate([
    ApiProperty({ example: 150000 }),
    __metadata("design:type", Number)
], MaintenanceHistoryItemDTO.prototype, "cost", void 0);
__decorate([
    ApiProperty({ example: 'XAF' }),
    __metadata("design:type", String)
], MaintenanceHistoryItemDTO.prototype, "currency", void 0);
__decorate([
    ApiProperty({ example: 'Technicien A' }),
    __metadata("design:type", String)
], MaintenanceHistoryItemDTO.prototype, "performedBy", void 0);
__decorate([
    ApiProperty({ example: '2024-06-15T10:00:00.000Z' }),
    __metadata("design:type", String)
], MaintenanceHistoryItemDTO.prototype, "recordedAt", void 0);
/**
 * DTO pour le résumé de maintenance par actif
 * CONTRACTUEL: Cost-Structure, Budget
 */
export class MaintenanceSummaryItemDTO {
    assetId;
    totalMaintenanceCost;
    interventionCount;
    firstIntervention;
    lastIntervention;
    currency;
}
__decorate([
    ApiProperty({ example: 'asset-001' }),
    __metadata("design:type", String)
], MaintenanceSummaryItemDTO.prototype, "assetId", void 0);
__decorate([
    ApiProperty({ example: 500000 }),
    __metadata("design:type", Number)
], MaintenanceSummaryItemDTO.prototype, "totalMaintenanceCost", void 0);
__decorate([
    ApiProperty({ example: 3 }),
    __metadata("design:type", Number)
], MaintenanceSummaryItemDTO.prototype, "interventionCount", void 0);
__decorate([
    ApiPropertyOptional({ example: '2024-06-15' }),
    __metadata("design:type", String)
], MaintenanceSummaryItemDTO.prototype, "firstIntervention", void 0);
__decorate([
    ApiPropertyOptional({ example: '2025-01-10' }),
    __metadata("design:type", String)
], MaintenanceSummaryItemDTO.prototype, "lastIntervention", void 0);
__decorate([
    ApiProperty({ example: 'XAF' }),
    __metadata("design:type", String)
], MaintenanceSummaryItemDTO.prototype, "currency", void 0);
/**
 * DTO pour la maintenance par période
 * CONTRACTUEL: Cost-Structure
 */
export class MaintenanceByPeriodItemDTO {
    period;
    totalMaintenanceCost;
    interventionCount;
    assetsMaintained;
    currency;
}
__decorate([
    ApiProperty({ example: '2025-01' }),
    __metadata("design:type", String)
], MaintenanceByPeriodItemDTO.prototype, "period", void 0);
__decorate([
    ApiProperty({ example: 225000 }),
    __metadata("design:type", Number)
], MaintenanceByPeriodItemDTO.prototype, "totalMaintenanceCost", void 0);
__decorate([
    ApiProperty({ example: 5 }),
    __metadata("design:type", Number)
], MaintenanceByPeriodItemDTO.prototype, "interventionCount", void 0);
__decorate([
    ApiProperty({ example: 3 }),
    __metadata("design:type", Number)
], MaintenanceByPeriodItemDTO.prototype, "assetsMaintained", void 0);
__decorate([
    ApiProperty({ example: 'XAF' }),
    __metadata("design:type", String)
], MaintenanceByPeriodItemDTO.prototype, "currency", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// RENEWAL RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * DTO pour une projection de renouvellement
 * CONTRACTUEL: Budget
 */
export class RenewalProjectionItemDTO {
    assetId;
    acquisitionCost;
    renewalDate;
    replacementCost;
    renewalYear;
    renewalMonth;
    currency;
}
__decorate([
    ApiProperty({ example: 'asset-001' }),
    __metadata("design:type", String)
], RenewalProjectionItemDTO.prototype, "assetId", void 0);
__decorate([
    ApiProperty({ example: 12000000 }),
    __metadata("design:type", Number)
], RenewalProjectionItemDTO.prototype, "acquisitionCost", void 0);
__decorate([
    ApiProperty({ example: '2029-01-01' }),
    __metadata("design:type", String)
], RenewalProjectionItemDTO.prototype, "renewalDate", void 0);
__decorate([
    ApiPropertyOptional({ example: 15000000 }),
    __metadata("design:type", Number)
], RenewalProjectionItemDTO.prototype, "replacementCost", void 0);
__decorate([
    ApiProperty({ example: 2029 }),
    __metadata("design:type", Number)
], RenewalProjectionItemDTO.prototype, "renewalYear", void 0);
__decorate([
    ApiProperty({ example: 1 }),
    __metadata("design:type", Number)
], RenewalProjectionItemDTO.prototype, "renewalMonth", void 0);
__decorate([
    ApiProperty({ example: 'XAF' }),
    __metadata("design:type", String)
], RenewalProjectionItemDTO.prototype, "currency", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// DISPOSAL RESPONSE DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * DTO pour un historique de cession
 */
export class DisposalHistoryItemDTO {
    disposalId;
    assetId;
    disposalDate;
    disposalType;
    disposalValue;
    netBookValue;
    gainOrLoss;
    currency;
    reason;
    disposedAt;
}
__decorate([
    ApiProperty({ example: 'disp-001' }),
    __metadata("design:type", String)
], DisposalHistoryItemDTO.prototype, "disposalId", void 0);
__decorate([
    ApiProperty({ example: 'asset-003' }),
    __metadata("design:type", String)
], DisposalHistoryItemDTO.prototype, "assetId", void 0);
__decorate([
    ApiProperty({ example: '2025-01-15' }),
    __metadata("design:type", String)
], DisposalHistoryItemDTO.prototype, "disposalDate", void 0);
__decorate([
    ApiProperty({ example: 'SALE', enum: ['SALE', 'SCRAP'] }),
    __metadata("design:type", String)
], DisposalHistoryItemDTO.prototype, "disposalType", void 0);
__decorate([
    ApiProperty({ example: 300000 }),
    __metadata("design:type", Number)
], DisposalHistoryItemDTO.prototype, "disposalValue", void 0);
__decorate([
    ApiProperty({ example: 100000 }),
    __metadata("design:type", Number)
], DisposalHistoryItemDTO.prototype, "netBookValue", void 0);
__decorate([
    ApiProperty({ example: 200000 }),
    __metadata("design:type", Number)
], DisposalHistoryItemDTO.prototype, "gainOrLoss", void 0);
__decorate([
    ApiProperty({ example: 'XAF' }),
    __metadata("design:type", String)
], DisposalHistoryItemDTO.prototype, "currency", void 0);
__decorate([
    ApiPropertyOptional({ example: null }),
    __metadata("design:type", String)
], DisposalHistoryItemDTO.prototype, "reason", void 0);
__decorate([
    ApiProperty({ example: '2025-01-15T14:00:00.000Z' }),
    __metadata("design:type", String)
], DisposalHistoryItemDTO.prototype, "disposedAt", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// KPI RESPONSE DTO
// ═══════════════════════════════════════════════════════════════════════════
/**
 * DTO pour les KPIs patrimoniales
 */
export class ImmobilisationKpiDTO {
    assetsInService;
    assetsDisposed;
    assetsScrapped;
    totalAssets;
    totalAcquisitionCost;
    totalNetBookValue;
    totalAccumulatedDepreciation;
    currency;
}
__decorate([
    ApiProperty({ example: 42 }),
    __metadata("design:type", Number)
], ImmobilisationKpiDTO.prototype, "assetsInService", void 0);
__decorate([
    ApiProperty({ example: 5 }),
    __metadata("design:type", Number)
], ImmobilisationKpiDTO.prototype, "assetsDisposed", void 0);
__decorate([
    ApiProperty({ example: 2 }),
    __metadata("design:type", Number)
], ImmobilisationKpiDTO.prototype, "assetsScrapped", void 0);
__decorate([
    ApiProperty({ example: 49 }),
    __metadata("design:type", Number)
], ImmobilisationKpiDTO.prototype, "totalAssets", void 0);
__decorate([
    ApiPropertyOptional({ example: 250000000 }),
    __metadata("design:type", Number)
], ImmobilisationKpiDTO.prototype, "totalAcquisitionCost", void 0);
__decorate([
    ApiPropertyOptional({ example: 180000000 }),
    __metadata("design:type", Number)
], ImmobilisationKpiDTO.prototype, "totalNetBookValue", void 0);
__decorate([
    ApiPropertyOptional({ example: 70000000 }),
    __metadata("design:type", Number)
], ImmobilisationKpiDTO.prototype, "totalAccumulatedDepreciation", void 0);
__decorate([
    ApiProperty({ example: 'XAF' }),
    __metadata("design:type", String)
], ImmobilisationKpiDTO.prototype, "currency", void 0);
//# sourceMappingURL=response.dto.js.map