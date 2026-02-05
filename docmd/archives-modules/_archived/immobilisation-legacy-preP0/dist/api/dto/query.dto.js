/**
 * Immobilisation Module - API Query DTOs
 * Conformité: API_READ_ONLY.md v1.0.0
 *
 * DTOs pour les paramètres de requête (query params).
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
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, IsNumber, IsEnum, Min, Max, Matches } from 'class-validator';
import { Type } from 'class-transformer';
// ═══════════════════════════════════════════════════════════════════════════
// ENUMS
// ═══════════════════════════════════════════════════════════════════════════
export var AssetStatusFilter;
(function (AssetStatusFilter) {
    AssetStatusFilter["IN_SERVICE"] = "IN_SERVICE";
    AssetStatusFilter["DISPOSED"] = "DISPOSED";
    AssetStatusFilter["SCRAPPED"] = "SCRAPPED";
})(AssetStatusFilter || (AssetStatusFilter = {}));
export var AllocationTargetTypeFilter;
(function (AllocationTargetTypeFilter) {
    AllocationTargetTypeFilter["PRODUCT"] = "PRODUCT";
    AllocationTargetTypeFilter["SERVICE"] = "SERVICE";
    AllocationTargetTypeFilter["PROJECT"] = "PROJECT";
})(AllocationTargetTypeFilter || (AllocationTargetTypeFilter = {}));
export var MaintenanceTypeFilter;
(function (MaintenanceTypeFilter) {
    MaintenanceTypeFilter["MAINTENANCE"] = "MAINTENANCE";
    MaintenanceTypeFilter["REPAIR"] = "REPAIR";
    MaintenanceTypeFilter["SERVICE"] = "SERVICE";
})(MaintenanceTypeFilter || (MaintenanceTypeFilter = {}));
export var DisposalTypeFilter;
(function (DisposalTypeFilter) {
    DisposalTypeFilter["SALE"] = "SALE";
    DisposalTypeFilter["SCRAP"] = "SCRAP";
})(DisposalTypeFilter || (DisposalTypeFilter = {}));
// ═══════════════════════════════════════════════════════════════════════════
// BASE QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Paramètres de pagination
 */
export class PaginationQueryDTO {
    page = 1;
    limit = 20;
}
__decorate([
    ApiPropertyOptional({ example: 1, description: 'Numéro de page', minimum: 1 }),
    IsOptional(),
    Type(() => Number),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], PaginationQueryDTO.prototype, "page", void 0);
__decorate([
    ApiPropertyOptional({ example: 20, description: 'Taille de page', minimum: 1, maximum: 100 }),
    IsOptional(),
    Type(() => Number),
    IsNumber(),
    Min(1),
    Max(100),
    __metadata("design:type", Number)
], PaginationQueryDTO.prototype, "limit", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// ASSET QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Query params pour la liste des actifs
 */
export class AssetListQueryDTO extends PaginationQueryDTO {
    status;
}
__decorate([
    ApiPropertyOptional({
        enum: AssetStatusFilter,
        description: 'Filtrer par statut'
    }),
    IsOptional(),
    IsEnum(AssetStatusFilter),
    __metadata("design:type", String)
], AssetListQueryDTO.prototype, "status", void 0);
/**
 * Query params pour la VNC des actifs
 */
export class AssetNetBookValueQueryDTO extends PaginationQueryDTO {
    status;
    assetId;
}
__decorate([
    ApiPropertyOptional({
        enum: AssetStatusFilter,
        description: 'Filtrer par statut'
    }),
    IsOptional(),
    IsEnum(AssetStatusFilter),
    __metadata("design:type", String)
], AssetNetBookValueQueryDTO.prototype, "status", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Filtrer par ID d\'actif' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AssetNetBookValueQueryDTO.prototype, "assetId", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Query params pour l'historique des amortissements
 */
export class DepreciationHistoryQueryDTO extends PaginationQueryDTO {
    fromPeriod;
    toPeriod;
}
__decorate([
    ApiPropertyOptional({
        example: '2024-01',
        description: 'Période de début (YYYY-MM)'
    }),
    IsOptional(),
    IsString(),
    Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'fromPeriod must be YYYY-MM format' }),
    __metadata("design:type", String)
], DepreciationHistoryQueryDTO.prototype, "fromPeriod", void 0);
__decorate([
    ApiPropertyOptional({
        example: '2025-12',
        description: 'Période de fin (YYYY-MM)'
    }),
    IsOptional(),
    IsString(),
    Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'toPeriod must be YYYY-MM format' }),
    __metadata("design:type", String)
], DepreciationHistoryQueryDTO.prototype, "toPeriod", void 0);
/**
 * Query params pour le résumé des amortissements
 * CONTRACTUEL: Cost-Structure
 */
export class DepreciationSummaryQueryDTO {
    period;
}
__decorate([
    ApiPropertyOptional({
        example: '2025-01',
        description: 'Période (YYYY-MM) - obligatoire',
        required: true
    }),
    IsString(),
    Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'period must be YYYY-MM format' }),
    __metadata("design:type", String)
], DepreciationSummaryQueryDTO.prototype, "period", void 0);
/**
 * Query params pour l'export Cost-Structure
 */
export class DepreciationCostStructureExportQueryDTO {
    period;
}
__decorate([
    ApiPropertyOptional({
        example: '2025-01',
        description: 'Période (YYYY-MM) - obligatoire',
        required: true
    }),
    IsString(),
    Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'period must be YYYY-MM format' }),
    __metadata("design:type", String)
], DepreciationCostStructureExportQueryDTO.prototype, "period", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Query params pour les allocations
 * CONTRACTUEL: Cost-Structure
 */
export class AllocationQueryDTO extends PaginationQueryDTO {
    assetId;
    targetType;
    targetId;
}
__decorate([
    ApiPropertyOptional({ description: 'Filtrer par ID d\'actif' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AllocationQueryDTO.prototype, "assetId", void 0);
__decorate([
    ApiPropertyOptional({
        enum: AllocationTargetTypeFilter,
        description: 'Filtrer par type de cible'
    }),
    IsOptional(),
    IsEnum(AllocationTargetTypeFilter),
    __metadata("design:type", String)
], AllocationQueryDTO.prototype, "targetType", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Filtrer par ID de cible' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], AllocationQueryDTO.prototype, "targetId", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Query params pour l'historique de maintenance
 */
export class MaintenanceHistoryQueryDTO extends PaginationQueryDTO {
    assetId;
    type;
    fromDate;
    toDate;
}
__decorate([
    ApiPropertyOptional({ description: 'Filtrer par ID d\'actif' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], MaintenanceHistoryQueryDTO.prototype, "assetId", void 0);
__decorate([
    ApiPropertyOptional({
        enum: MaintenanceTypeFilter,
        description: 'Filtrer par type de maintenance'
    }),
    IsOptional(),
    IsEnum(MaintenanceTypeFilter),
    __metadata("design:type", String)
], MaintenanceHistoryQueryDTO.prototype, "type", void 0);
__decorate([
    ApiPropertyOptional({
        example: '2024-01-01',
        description: 'Date de début (ISO)'
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], MaintenanceHistoryQueryDTO.prototype, "fromDate", void 0);
__decorate([
    ApiPropertyOptional({
        example: '2025-12-31',
        description: 'Date de fin (ISO)'
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], MaintenanceHistoryQueryDTO.prototype, "toDate", void 0);
/**
 * Query params pour le résumé de maintenance
 * CONTRACTUEL: Cost-Structure, Budget
 */
export class MaintenanceSummaryQueryDTO {
    assetId;
}
__decorate([
    ApiPropertyOptional({ description: 'Filtrer par ID d\'actif' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], MaintenanceSummaryQueryDTO.prototype, "assetId", void 0);
/**
 * Query params pour la maintenance par période
 * CONTRACTUEL: Cost-Structure
 */
export class MaintenanceByPeriodQueryDTO {
    fromPeriod;
    toPeriod;
}
__decorate([
    ApiPropertyOptional({
        example: '2024-01',
        description: 'Période de début (YYYY-MM)'
    }),
    IsOptional(),
    IsString(),
    Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'fromPeriod must be YYYY-MM format' }),
    __metadata("design:type", String)
], MaintenanceByPeriodQueryDTO.prototype, "fromPeriod", void 0);
__decorate([
    ApiPropertyOptional({
        example: '2025-12',
        description: 'Période de fin (YYYY-MM)'
    }),
    IsOptional(),
    IsString(),
    Matches(/^\d{4}-(0[1-9]|1[0-2])$/, { message: 'toPeriod must be YYYY-MM format' }),
    __metadata("design:type", String)
], MaintenanceByPeriodQueryDTO.prototype, "toPeriod", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// RENEWAL QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Query params pour les projections de renouvellement
 * CONTRACTUEL: Budget
 */
export class RenewalQueryDTO extends PaginationQueryDTO {
    fromYear;
    toYear;
}
__decorate([
    ApiPropertyOptional({
        example: 2026,
        description: 'Année de début'
    }),
    IsOptional(),
    Type(() => Number),
    IsNumber(),
    __metadata("design:type", Number)
], RenewalQueryDTO.prototype, "fromYear", void 0);
__decorate([
    ApiPropertyOptional({
        example: 2030,
        description: 'Année de fin'
    }),
    IsOptional(),
    Type(() => Number),
    IsNumber(),
    __metadata("design:type", Number)
], RenewalQueryDTO.prototype, "toYear", void 0);
// ═══════════════════════════════════════════════════════════════════════════
// DISPOSAL QUERY DTOs
// ═══════════════════════════════════════════════════════════════════════════
/**
 * Query params pour l'historique des cessions
 */
export class DisposalQueryDTO extends PaginationQueryDTO {
    disposalType;
    fromDate;
    toDate;
}
__decorate([
    ApiPropertyOptional({
        enum: DisposalTypeFilter,
        description: 'Filtrer par type de cession'
    }),
    IsOptional(),
    IsEnum(DisposalTypeFilter),
    __metadata("design:type", String)
], DisposalQueryDTO.prototype, "disposalType", void 0);
__decorate([
    ApiPropertyOptional({
        example: '2024-01-01',
        description: 'Date de début (ISO)'
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], DisposalQueryDTO.prototype, "fromDate", void 0);
__decorate([
    ApiPropertyOptional({
        example: '2025-12-31',
        description: 'Date de fin (ISO)'
    }),
    IsOptional(),
    IsString(),
    __metadata("design:type", String)
], DisposalQueryDTO.prototype, "toDate", void 0);
//# sourceMappingURL=query.dto.js.map