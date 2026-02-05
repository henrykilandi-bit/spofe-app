/**
 * Immobilisation Module - Commands
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Commands pour Guardian Immobilisation
 */

import {
  MaintenanceType,
  DisposalType,
  AllocationTargetType,
} from './value-objects';

// ═══════════════════════════════════════════════════════════════════════════
// BASE COMMAND
// ═══════════════════════════════════════════════════════════════════════════

export interface BaseCommand {
  commandId: string;
  tenantId: string;
  actorId: string;
  timestamp: Date;
}

// ═══════════════════════════════════════════════════════════════════════════
// ASSET COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// DEPRECIATION COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Enregistrer une dotation d'amortissement (Guardian only)
 */
export interface RecordDepreciationCommand extends BaseCommand {
  type: 'RecordDepreciation';
  scheduleId: string;
  assetId: string;
  period: string; // YYYY-MM
}

/**
 * Calculer les amortissements pour une période (Guardian batch)
 */
export interface CalculateDepreciationsCommand extends BaseCommand {
  type: 'CalculateDepreciations';
  period: string; // YYYY-MM
  assetIds?: string[]; // Si vide, tous les assets IN_SERVICE
}

// ═══════════════════════════════════════════════════════════════════════════
// ALLOCATION COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// MAINTENANCE COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// DISPOSAL COMMANDS
// ═══════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════
// UNION TYPE
// ═══════════════════════════════════════════════════════════════════════════

export type ImmobilisationCommand =
  | CreateAssetCommand
  | UpdateRenewalInfoCommand
  | RecordDepreciationCommand
  | CalculateDepreciationsCommand
  | CreateAllocationCommand
  | EndAllocationCommand
  | ReallocateAssetCommand
  | RecordMaintenanceCommand
  | DisposeAssetCommand
  | DecommissionAssetCommand;

// ═══════════════════════════════════════════════════════════════════════════
// COMMAND FACTORY
// ═══════════════════════════════════════════════════════════════════════════

export function createCommandId(): string {
  return `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function createBaseCommand(tenantId: string, actorId: string): Omit<BaseCommand, 'commandId'> & { commandId: string } {
  return {
    commandId: createCommandId(),
    tenantId,
    actorId,
    timestamp: new Date(),
  };
}
