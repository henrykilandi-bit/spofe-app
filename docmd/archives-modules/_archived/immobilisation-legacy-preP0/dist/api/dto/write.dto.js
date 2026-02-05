/**
 * DTOs pour Write-Side - Module Immobilisation v1.0.0
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
import { IsString, IsNumber, IsOptional, IsDateString, IsIn, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
export class CreateAssetDTO {
    assetId;
    designation;
    description;
    category;
    acquisitionCost;
    currency;
    acquisitionDate;
    serviceStartDate;
    usefulLifeMonths;
    depreciationMethod;
    residualValue;
    renewalDate;
    replacementCost;
    actorId;
}
__decorate([
    ApiProperty({ description: 'Asset unique identifier' }),
    IsString(),
    __metadata("design:type", String)
], CreateAssetDTO.prototype, "assetId", void 0);
__decorate([
    ApiProperty({ description: 'Asset designation' }),
    IsString(),
    __metadata("design:type", String)
], CreateAssetDTO.prototype, "designation", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Asset description' }),
    IsOptional(),
    IsString(),
    __metadata("design:type", Object)
], CreateAssetDTO.prototype, "description", void 0);
__decorate([
    ApiProperty({ description: 'Asset category' }),
    IsString(),
    __metadata("design:type", String)
], CreateAssetDTO.prototype, "category", void 0);
__decorate([
    ApiProperty({ description: 'Acquisition cost' }),
    IsNumber(),
    Min(0.01),
    __metadata("design:type", Number)
], CreateAssetDTO.prototype, "acquisitionCost", void 0);
__decorate([
    ApiProperty({ description: 'Currency code (ISO 4217)' }),
    IsString(),
    __metadata("design:type", String)
], CreateAssetDTO.prototype, "currency", void 0);
__decorate([
    ApiProperty({ description: 'Acquisition date (ISO 8601)' }),
    IsDateString(),
    __metadata("design:type", String)
], CreateAssetDTO.prototype, "acquisitionDate", void 0);
__decorate([
    ApiProperty({ description: 'Service start date (ISO 8601)' }),
    IsDateString(),
    __metadata("design:type", String)
], CreateAssetDTO.prototype, "serviceStartDate", void 0);
__decorate([
    ApiProperty({ description: 'Useful life in months' }),
    IsNumber(),
    Min(1),
    __metadata("design:type", Number)
], CreateAssetDTO.prototype, "usefulLifeMonths", void 0);
__decorate([
    ApiProperty({ description: 'Depreciation method', enum: ['LINEAR', 'DECLINING_BALANCE'] }),
    IsIn(['LINEAR', 'DECLINING_BALANCE']),
    __metadata("design:type", String)
], CreateAssetDTO.prototype, "depreciationMethod", void 0);
__decorate([
    ApiProperty({ description: 'Residual value' }),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], CreateAssetDTO.prototype, "residualValue", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Renewal date (ISO 8601)' }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", Object)
], CreateAssetDTO.prototype, "renewalDate", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Replacement cost' }),
    IsOptional(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Object)
], CreateAssetDTO.prototype, "replacementCost", void 0);
__decorate([
    ApiProperty({ description: 'Actor ID performing the action' }),
    IsString(),
    __metadata("design:type", String)
], CreateAssetDTO.prototype, "actorId", void 0);
export class UpdateRenewalDTO {
    renewalDate;
    replacementCost;
    actorId;
}
__decorate([
    ApiPropertyOptional({ description: 'New renewal date (ISO 8601)' }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", Object)
], UpdateRenewalDTO.prototype, "renewalDate", void 0);
__decorate([
    ApiPropertyOptional({ description: 'New replacement cost' }),
    IsOptional(),
    IsNumber(),
    Min(0),
    __metadata("design:type", Object)
], UpdateRenewalDTO.prototype, "replacementCost", void 0);
__decorate([
    ApiProperty({ description: 'Actor ID performing the action' }),
    IsString(),
    __metadata("design:type", String)
], UpdateRenewalDTO.prototype, "actorId", void 0);
export class AllocateAssetDTO {
    targetType;
    targetId;
    percentage;
    effectiveFrom;
    effectiveTo;
    actorId;
}
__decorate([
    ApiProperty({ description: 'Allocation target type', enum: ['PRODUCT', 'PROJECT', 'ACTIVITY'] }),
    IsIn(['PRODUCT', 'PROJECT', 'ACTIVITY']),
    __metadata("design:type", String)
], AllocateAssetDTO.prototype, "targetType", void 0);
__decorate([
    ApiProperty({ description: 'Target ID' }),
    IsString(),
    __metadata("design:type", String)
], AllocateAssetDTO.prototype, "targetId", void 0);
__decorate([
    ApiProperty({ description: 'Allocation percentage (0-100)' }),
    IsNumber(),
    Min(0),
    Max(100),
    __metadata("design:type", Number)
], AllocateAssetDTO.prototype, "percentage", void 0);
__decorate([
    ApiProperty({ description: 'Effective from date (ISO 8601)' }),
    IsDateString(),
    __metadata("design:type", String)
], AllocateAssetDTO.prototype, "effectiveFrom", void 0);
__decorate([
    ApiPropertyOptional({ description: 'Effective to date (ISO 8601)' }),
    IsOptional(),
    IsDateString(),
    __metadata("design:type", Object)
], AllocateAssetDTO.prototype, "effectiveTo", void 0);
__decorate([
    ApiProperty({ description: 'Actor ID performing the action' }),
    IsString(),
    __metadata("design:type", String)
], AllocateAssetDTO.prototype, "actorId", void 0);
export class RecordDepreciationDTO {
    period;
    actorId;
}
__decorate([
    ApiProperty({ description: 'Period (YYYY-MM)' }),
    IsString(),
    __metadata("design:type", String)
], RecordDepreciationDTO.prototype, "period", void 0);
__decorate([
    ApiProperty({ description: 'Actor ID performing the action' }),
    IsString(),
    __metadata("design:type", String)
], RecordDepreciationDTO.prototype, "actorId", void 0);
export class RecordMaintenanceDTO {
    date;
    cost;
    description;
    actorId;
}
__decorate([
    ApiProperty({ description: 'Maintenance date (ISO 8601)' }),
    IsDateString(),
    __metadata("design:type", String)
], RecordMaintenanceDTO.prototype, "date", void 0);
__decorate([
    ApiProperty({ description: 'Maintenance cost' }),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], RecordMaintenanceDTO.prototype, "cost", void 0);
__decorate([
    ApiProperty({ description: 'Maintenance description' }),
    IsString(),
    __metadata("design:type", String)
], RecordMaintenanceDTO.prototype, "description", void 0);
__decorate([
    ApiProperty({ description: 'Actor ID performing the action' }),
    IsString(),
    __metadata("design:type", String)
], RecordMaintenanceDTO.prototype, "actorId", void 0);
export class DisposeAssetDTO {
    disposalDate;
    disposalValue;
    actorId;
}
__decorate([
    ApiProperty({ description: 'Disposal date (ISO 8601)' }),
    IsDateString(),
    __metadata("design:type", String)
], DisposeAssetDTO.prototype, "disposalDate", void 0);
__decorate([
    ApiProperty({ description: 'Disposal value' }),
    IsNumber(),
    Min(0),
    __metadata("design:type", Number)
], DisposeAssetDTO.prototype, "disposalValue", void 0);
__decorate([
    ApiProperty({ description: 'Actor ID performing the action' }),
    IsString(),
    __metadata("design:type", String)
], DisposeAssetDTO.prototype, "actorId", void 0);
//# sourceMappingURL=write.dto.js.map