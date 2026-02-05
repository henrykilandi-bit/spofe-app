/**
 * Immobilisation Module - Command DTOs (Contractuels)
 * Conformité: COMMANDS_EVENTS.md v1.0.0
 *
 * Ces DTOs sont les interfaces contractuelles pour l'API.
 * Ils utilisent des strings ISO 8601 pour les dates (sérialisation JSON).
 */
export type DepreciationMethodDTO = 'LINEAR';
export type AllocationTargetTypeDTO = 'PRODUCT' | 'SERVICE' | 'PROJECT';
export type MaintenanceTypeDTO = 'MAINTENANCE' | 'REPAIR' | 'SERVICE';
export type DisposalTypeDTO = 'SALE' | 'SCRAP';
/**
 * Base DTO pour toutes les commands (API layer)
 */
export interface BaseCommandDTO {
    tenantId: string;
    actorId: string;
}
/**
 * CreateAssetCommand DTO
 * Intention: Créer une immobilisation patrimoniale
 */
export interface CreateAssetCommandDTO extends BaseCommandDTO {
    assetId?: string;
    acquisitionCost: number;
    currency: string;
    acquisitionDate: string;
    usefulLife: number;
    depreciationMethod: DepreciationMethodDTO;
    residualValue: number;
    renewalDate?: string;
    replacementCost?: number;
}
/**
 * UpdateRenewalInfoCommand DTO
 * Intention: Mettre à jour la date et le coût de renouvellement
 */
export interface UpdateRenewalInfoCommandDTO extends BaseCommandDTO {
    assetId: string;
    renewalDate: string;
    replacementCost?: number;
    currency?: string;
}
/**
 * Allocation item dans une commande
 */
export interface AllocationItemDTO {
    allocationId?: string;
    targetType: AllocationTargetTypeDTO;
    targetId: string;
    percentage: number;
}
/**
 * AllocateAssetCommand DTO
 * Intention: Ventiler une immobilisation sur produits / projets
 */
export interface AllocateAssetCommandDTO extends BaseCommandDTO {
    assetId: string;
    allocations: AllocationItemDTO[];
    effectiveFrom: string;
}
/**
 * RecordDepreciationCommand DTO
 * Intention: Enregistrer une dotation d'amortissement
 */
export interface RecordDepreciationCommandDTO extends BaseCommandDTO {
    assetId: string;
    scheduleId?: string;
    period: string;
}
/**
 * CalculateDepreciationsCommand DTO
 * Intention: Calculer les amortissements pour une période (batch)
 */
export interface CalculateDepreciationsCommandDTO extends BaseCommandDTO {
    period: string;
    assetIds?: string[];
}
/**
 * RecordMaintenanceCommand DTO
 * Intention: Tracer une dépense réelle de maintenance
 */
export interface RecordMaintenanceCommandDTO extends BaseCommandDTO {
    assetId: string;
    maintenanceId?: string;
    type: MaintenanceTypeDTO;
    date: string;
    description: string;
    cost: number;
    currency: string;
    performedBy: string;
}
/**
 * DisposeAssetCommand DTO
 * Intention: Céder définitivement une immobilisation
 */
export interface DisposeAssetCommandDTO extends BaseCommandDTO {
    assetId: string;
    disposalId?: string;
    disposalDate: string;
    disposalValue: number;
    currency: string;
}
/**
 * DecommissionAssetCommand DTO
 * Intention: Déclasser définitivement une immobilisation
 */
export interface DecommissionAssetCommandDTO extends BaseCommandDTO {
    assetId: string;
    disposalId?: string;
    decommissionDate: string;
    reason: string;
}
export type ImmobilisationCommandDTO = ({
    type: 'CreateAsset';
} & CreateAssetCommandDTO) | ({
    type: 'UpdateRenewalInfo';
} & UpdateRenewalInfoCommandDTO) | ({
    type: 'AllocateAsset';
} & AllocateAssetCommandDTO) | ({
    type: 'RecordDepreciation';
} & RecordDepreciationCommandDTO) | ({
    type: 'CalculateDepreciations';
} & CalculateDepreciationsCommandDTO) | ({
    type: 'RecordMaintenance';
} & RecordMaintenanceCommandDTO) | ({
    type: 'DisposeAsset';
} & DisposeAssetCommandDTO) | ({
    type: 'DecommissionAsset';
} & DecommissionAssetCommandDTO);
//# sourceMappingURL=command.dto.d.ts.map