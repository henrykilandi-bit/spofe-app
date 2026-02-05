/**
 * Immobilisation Module - Commands
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Commands pour Guardian Immobilisation
 */
import { MaintenanceType, AllocationTargetType } from './value-objects';
export interface BaseCommand {
    commandId: string;
    tenantId: string;
    actorId: string;
    timestamp: Date;
}
/**
 * Créer une nouvelle immobilisation
 */
export interface CreateAssetCommand extends BaseCommand {
    type: 'CreateAsset';
    assetId: string;
    acquisitionCost: number;
    currency: string;
    acquisitionDate: Date;
    usefulLifeMonths: number;
    residualValue: number;
}
/**
 * Mettre à jour les informations de renouvellement
 */
export interface UpdateRenewalInfoCommand extends BaseCommand {
    type: 'UpdateRenewalInfo';
    assetId: string;
    renewalDate?: Date;
    replacementCost?: number;
    currency?: string;
}
/**
 * Enregistrer une dotation d'amortissement (Guardian only)
 */
export interface RecordDepreciationCommand extends BaseCommand {
    type: 'RecordDepreciation';
    scheduleId: string;
    assetId: string;
    period: string;
}
/**
 * Calculer les amortissements pour une période (Guardian batch)
 */
export interface CalculateDepreciationsCommand extends BaseCommand {
    type: 'CalculateDepreciations';
    period: string;
    assetIds?: string[];
}
/**
 * Créer une allocation
 */
export interface CreateAllocationCommand extends BaseCommand {
    type: 'CreateAllocation';
    allocationId: string;
    assetId: string;
    targetType: AllocationTargetType;
    targetId: string;
    percentage: number;
    effectiveFrom: Date;
    effectiveTo?: Date;
}
/**
 * Terminer une allocation
 */
export interface EndAllocationCommand extends BaseCommand {
    type: 'EndAllocation';
    allocationId: string;
    assetId: string;
    endDate: Date;
    reason: string;
}
/**
 * Réallouer un asset (termine les allocations existantes et en crée de nouvelles)
 */
export interface ReallocateAssetCommand extends BaseCommand {
    type: 'ReallocateAsset';
    assetId: string;
    effectiveDate: Date;
    allocations: Array<{
        allocationId: string;
        targetType: AllocationTargetType;
        targetId: string;
        percentage: number;
    }>;
}
/**
 * Enregistrer une intervention de maintenance
 */
export interface RecordMaintenanceCommand extends BaseCommand {
    type: 'RecordMaintenance';
    maintenanceId: string;
    assetId: string;
    maintenanceType: MaintenanceType;
    date: Date;
    description: string;
    cost: number;
    currency: string;
    performedBy: string;
}
/**
 * Céder une immobilisation (vente)
 */
export interface DisposeAssetCommand extends BaseCommand {
    type: 'DisposeAsset';
    disposalId: string;
    assetId: string;
    disposalDate: Date;
    disposalValue: number;
    currency: string;
}
/**
 * Déclasser une immobilisation (mise au rebut)
 */
export interface DecommissionAssetCommand extends BaseCommand {
    type: 'DecommissionAsset';
    disposalId: string;
    assetId: string;
    decommissionDate: Date;
    reason: string;
}
export type ImmobilisationCommand = CreateAssetCommand | UpdateRenewalInfoCommand | RecordDepreciationCommand | CalculateDepreciationsCommand | CreateAllocationCommand | EndAllocationCommand | ReallocateAssetCommand | RecordMaintenanceCommand | DisposeAssetCommand | DecommissionAssetCommand;
export declare function createCommandId(): string;
export declare function createBaseCommand(tenantId: string, actorId: string): Omit<BaseCommand, 'commandId'> & {
    commandId: string;
};
//# sourceMappingURL=commands.d.ts.map