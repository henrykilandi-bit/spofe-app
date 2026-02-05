/**
 * Immobilisation Module - Validation Schemas (Zod)
 * Conformité: COMMANDS_EVENTS.md v1.0.0
 *
 * Schemas de validation pour les DTOs d'entrée API.
 */
import { z } from 'zod';
// ═══════════════════════════════════════════════════════════════════════════
// COMMON SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════
export const tenantIdSchema = z.string().min(1, 'tenantId is required');
export const actorIdSchema = z.string().min(1, 'actorId is required');
export const assetIdSchema = z.string().min(1, 'assetId is required');
export const currencySchema = z.string().length(3, 'currency must be 3 characters (ISO 4217)');
export const isoDateSchema = z.string().datetime({ message: 'Invalid ISO 8601 date format' });
export const periodSchema = z.string().regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Period must be YYYY-MM format');
export const depreciationMethodSchema = z.literal('LINEAR');
export const allocationTargetTypeSchema = z.enum(['PRODUCT', 'SERVICE', 'PROJECT']);
export const maintenanceTypeSchema = z.enum(['MAINTENANCE', 'REPAIR', 'SERVICE']);
export const disposalTypeSchema = z.enum(['SALE', 'SCRAP']);
// ═══════════════════════════════════════════════════════════════════════════
// BASE COMMAND SCHEMA
// ═══════════════════════════════════════════════════════════════════════════
export const baseCommandSchema = z.object({
    tenantId: tenantIdSchema,
    actorId: actorIdSchema,
});
// ═══════════════════════════════════════════════════════════════════════════
// ASSET COMMAND SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════
export const createAssetCommandSchema = baseCommandSchema.extend({
    assetId: z.string().optional(),
    acquisitionCost: z.number().positive('acquisitionCost must be > 0'),
    currency: currencySchema,
    acquisitionDate: isoDateSchema,
    usefulLife: z.number().int().positive('usefulLife must be a positive integer (months)'),
    depreciationMethod: depreciationMethodSchema,
    residualValue: z.number().nonnegative('residualValue must be >= 0'),
    renewalDate: isoDateSchema.optional(),
    replacementCost: z.number().nonnegative().optional(),
}).refine((data) => data.residualValue <= data.acquisitionCost, { message: 'residualValue cannot exceed acquisitionCost', path: ['residualValue'] });
export const updateRenewalInfoCommandSchema = baseCommandSchema.extend({
    assetId: assetIdSchema,
    renewalDate: isoDateSchema,
    replacementCost: z.number().nonnegative().optional(),
    currency: currencySchema.optional(),
});
// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION COMMAND SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════
export const allocationItemSchema = z.object({
    allocationId: z.string().optional(),
    targetType: allocationTargetTypeSchema,
    targetId: z.string().min(1, 'targetId is required'),
    percentage: z.number().positive().max(100, 'percentage must be <= 100'),
});
export const allocateAssetCommandSchema = baseCommandSchema.extend({
    assetId: assetIdSchema,
    allocations: z.array(allocationItemSchema).min(1, 'At least one allocation is required'),
    effectiveFrom: isoDateSchema,
}).refine((data) => {
    const sum = data.allocations.reduce((acc, a) => acc + a.percentage, 0);
    return Math.abs(sum - 100) < 0.001;
}, { message: 'Total allocation percentages must equal 100%', path: ['allocations'] });
// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION COMMAND SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════
export const recordDepreciationCommandSchema = baseCommandSchema.extend({
    assetId: assetIdSchema,
    scheduleId: z.string().optional(),
    period: periodSchema,
});
export const calculateDepreciationsCommandSchema = baseCommandSchema.extend({
    period: periodSchema,
    assetIds: z.array(z.string()).optional(),
});
// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE COMMAND SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════
export const recordMaintenanceCommandSchema = baseCommandSchema.extend({
    assetId: assetIdSchema,
    maintenanceId: z.string().optional(),
    type: maintenanceTypeSchema,
    date: isoDateSchema,
    description: z.string().min(1, 'description is required').max(1000),
    cost: z.number().nonnegative('cost must be >= 0'),
    currency: currencySchema,
    performedBy: z.string().min(1, 'performedBy is required'),
});
// ═══════════════════════════════════════════════════════════════════════════
// DISPOSAL COMMAND SCHEMAS
// ═══════════════════════════════════════════════════════════════════════════
export const disposeAssetCommandSchema = baseCommandSchema.extend({
    assetId: assetIdSchema,
    disposalId: z.string().optional(),
    disposalDate: isoDateSchema,
    disposalValue: z.number().nonnegative('disposalValue must be >= 0'),
    currency: currencySchema,
});
export const decommissionAssetCommandSchema = baseCommandSchema.extend({
    assetId: assetIdSchema,
    disposalId: z.string().optional(),
    decommissionDate: isoDateSchema,
    reason: z.string().min(1, 'reason is required').max(500),
});
//# sourceMappingURL=validation.schema.js.map