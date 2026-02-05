/**
 * Immobilisation Module - Command DTOs (Contractuels)
 * Conformité: COMMANDS_EVENTS.md v1.0.0
 * 
 * Ces DTOs sont les interfaces contractuelles pour l'API.
 * Ils utilisent des strings ISO 8601 pour les dates (sérialisation JSON).
 */

import { AllocationTargetType, MaintenanceType, DisposalType } from './value-objects';

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND DTO TYPES
// ═══════════════════════════════════════════════════════════════════════════

export type DepreciationMethodDTO = 'LINEAR';
export type AllocationTargetTypeDTO = 'PRODUCT' | 'SERVICE' | 'PROJECT';
export type MaintenanceTypeDTO = 'MAINTENANCE' | 'REPAIR' | 'SERVICE';
export type DisposalTypeDTO = 'SALE' | 'SCRAP';

// ═══════════════════════════════════════════════════════════════════════════
// BASE COMMAND DTO
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base DTO pour toutes les commands (API layer)
 */
export interface BaseCommandDTO {
  tenantId: string;
  actorId: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSET COMMAND DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CreateAssetCommand DTO
 * Intention: Créer une immobilisation patrimoniale
 */
export interface CreateAssetCommandDTO extends BaseCommandDTO {
  assetId?: string; // Optionnel, généré si absent

  acquisitionCost: number;
  currency: string;
  acquisitionDate: string;          // ISO 8601
  usefulLife: number;               // en mois
  depreciationMethod: DepreciationMethodDTO;
  residualValue: number;

  renewalDate?: string;             // ISO 8601
  replacementCost?: number;
}

/**
 * UpdateRenewalInfoCommand DTO
 * Intention: Mettre à jour la date et le coût de renouvellement
 */
export interface UpdateRenewalInfoCommandDTO extends BaseCommandDTO {
  assetId: string;

  renewalDate: string;              // ISO 8601
  replacementCost?: number;
  currency?: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION COMMAND DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Allocation item dans une commande
 */
export interface AllocationItemDTO {
  allocationId?: string;            // Optionnel, généré si absent
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

  effectiveFrom: string;            // ISO 8601
}

// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION COMMAND DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * RecordDepreciationCommand DTO
 * Intention: Enregistrer une dotation d'amortissement
 */
export interface RecordDepreciationCommandDTO extends BaseCommandDTO {
  assetId: string;
  scheduleId?: string;              // Optionnel, généré si absent

  period: string;                   // YYYY-MM
}

/**
 * CalculateDepreciationsCommand DTO
 * Intention: Calculer les amortissements pour une période (batch)
 */
export interface CalculateDepreciationsCommandDTO extends BaseCommandDTO {
  period: string;                   // YYYY-MM
  assetIds?: string[];              // Si vide, tous les assets IN_SERVICE
}

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE COMMAND DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * RecordMaintenanceCommand DTO
 * Intention: Tracer une dépense réelle de maintenance
 */
export interface RecordMaintenanceCommandDTO extends BaseCommandDTO {
  assetId: string;
  maintenanceId?: string;           // Optionnel, généré si absent

  type: MaintenanceTypeDTO;
  date: string;                     // ISO 8601
  description: string;
  cost: number;
  currency: string;
  performedBy: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// DISPOSAL COMMAND DTOs
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DisposeAssetCommand DTO
 * Intention: Céder définitivement une immobilisation
 */
export interface DisposeAssetCommandDTO extends BaseCommandDTO {
  assetId: string;
  disposalId?: string;              // Optionnel, généré si absent

  disposalDate: string;             // ISO 8601
  disposalValue: number;
  currency: string;
}

/**
 * DecommissionAssetCommand DTO
 * Intention: Déclasser définitivement une immobilisation
 */
export interface DecommissionAssetCommandDTO extends BaseCommandDTO {
  assetId: string;
  disposalId?: string;              // Optionnel, généré si absent

  decommissionDate: string;         // ISO 8601
  reason: string;
}

// ═══════════════════════════════════════════════════════════════════════════
// UNION TYPE
// ═══════════════════════════════════════════════════════════════════════════

export type ImmobilisationCommandDTO =
  | ({ type: 'CreateAsset' } & CreateAssetCommandDTO)
  | ({ type: 'UpdateRenewalInfo' } & UpdateRenewalInfoCommandDTO)
  | ({ type: 'AllocateAsset' } & AllocateAssetCommandDTO)
  | ({ type: 'RecordDepreciation' } & RecordDepreciationCommandDTO)
  | ({ type: 'CalculateDepreciations' } & CalculateDepreciationsCommandDTO)
  | ({ type: 'RecordMaintenance' } & RecordMaintenanceCommandDTO)
  | ({ type: 'DisposeAsset' } & DisposeAssetCommandDTO)
  | ({ type: 'DecommissionAsset' } & DecommissionAssetCommandDTO);
