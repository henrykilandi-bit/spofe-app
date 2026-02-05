/**
 * Immobilisation Module - Validation Schemas (Zod)
 * Conformité: COMMANDS_EVENTS.md v1.0.0
 *
 * Schemas de validation pour les DTOs d'entrée API.
 */
import { z } from 'zod';
export declare const tenantIdSchema: z.ZodString;
export declare const actorIdSchema: z.ZodString;
export declare const assetIdSchema: z.ZodString;
export declare const currencySchema: z.ZodString;
export declare const isoDateSchema: z.ZodString;
export declare const periodSchema: z.ZodString;
export declare const depreciationMethodSchema: z.ZodLiteral<"LINEAR">;
export declare const allocationTargetTypeSchema: z.ZodEnum<{
    PRODUCT: "PRODUCT";
    SERVICE: "SERVICE";
    PROJECT: "PROJECT";
}>;
export declare const maintenanceTypeSchema: z.ZodEnum<{
    SERVICE: "SERVICE";
    MAINTENANCE: "MAINTENANCE";
    REPAIR: "REPAIR";
}>;
export declare const disposalTypeSchema: z.ZodEnum<{
    SALE: "SALE";
    SCRAP: "SCRAP";
}>;
export declare const baseCommandSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodString;
}, z.core.$strip>;
export declare const createAssetCommandSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodString;
    assetId: z.ZodOptional<z.ZodString>;
    acquisitionCost: z.ZodNumber;
    currency: z.ZodString;
    acquisitionDate: z.ZodString;
    usefulLife: z.ZodNumber;
    depreciationMethod: z.ZodLiteral<"LINEAR">;
    residualValue: z.ZodNumber;
    renewalDate: z.ZodOptional<z.ZodString>;
    replacementCost: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
export declare const updateRenewalInfoCommandSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodString;
    assetId: z.ZodString;
    renewalDate: z.ZodString;
    replacementCost: z.ZodOptional<z.ZodNumber>;
    currency: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
export declare const allocationItemSchema: z.ZodObject<{
    allocationId: z.ZodOptional<z.ZodString>;
    targetType: z.ZodEnum<{
        PRODUCT: "PRODUCT";
        SERVICE: "SERVICE";
        PROJECT: "PROJECT";
    }>;
    targetId: z.ZodString;
    percentage: z.ZodNumber;
}, z.core.$strip>;
export declare const allocateAssetCommandSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodString;
    assetId: z.ZodString;
    allocations: z.ZodArray<z.ZodObject<{
        allocationId: z.ZodOptional<z.ZodString>;
        targetType: z.ZodEnum<{
            PRODUCT: "PRODUCT";
            SERVICE: "SERVICE";
            PROJECT: "PROJECT";
        }>;
        targetId: z.ZodString;
        percentage: z.ZodNumber;
    }, z.core.$strip>>;
    effectiveFrom: z.ZodString;
}, z.core.$strip>;
export declare const recordDepreciationCommandSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodString;
    assetId: z.ZodString;
    scheduleId: z.ZodOptional<z.ZodString>;
    period: z.ZodString;
}, z.core.$strip>;
export declare const calculateDepreciationsCommandSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodString;
    period: z.ZodString;
    assetIds: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>;
export declare const recordMaintenanceCommandSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodString;
    assetId: z.ZodString;
    maintenanceId: z.ZodOptional<z.ZodString>;
    type: z.ZodEnum<{
        SERVICE: "SERVICE";
        MAINTENANCE: "MAINTENANCE";
        REPAIR: "REPAIR";
    }>;
    date: z.ZodString;
    description: z.ZodString;
    cost: z.ZodNumber;
    currency: z.ZodString;
    performedBy: z.ZodString;
}, z.core.$strip>;
export declare const disposeAssetCommandSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodString;
    assetId: z.ZodString;
    disposalId: z.ZodOptional<z.ZodString>;
    disposalDate: z.ZodString;
    disposalValue: z.ZodNumber;
    currency: z.ZodString;
}, z.core.$strip>;
export declare const decommissionAssetCommandSchema: z.ZodObject<{
    tenantId: z.ZodString;
    actorId: z.ZodString;
    assetId: z.ZodString;
    disposalId: z.ZodOptional<z.ZodString>;
    decommissionDate: z.ZodString;
    reason: z.ZodString;
}, z.core.$strip>;
export type CreateAssetCommandInput = z.infer<typeof createAssetCommandSchema>;
export type UpdateRenewalInfoCommandInput = z.infer<typeof updateRenewalInfoCommandSchema>;
export type AllocateAssetCommandInput = z.infer<typeof allocateAssetCommandSchema>;
export type RecordDepreciationCommandInput = z.infer<typeof recordDepreciationCommandSchema>;
export type CalculateDepreciationsCommandInput = z.infer<typeof calculateDepreciationsCommandSchema>;
export type RecordMaintenanceCommandInput = z.infer<typeof recordMaintenanceCommandSchema>;
export type DisposeAssetCommandInput = z.infer<typeof disposeAssetCommandSchema>;
export type DecommissionAssetCommandInput = z.infer<typeof decommissionAssetCommandSchema>;
//# sourceMappingURL=validation.schema.d.ts.map