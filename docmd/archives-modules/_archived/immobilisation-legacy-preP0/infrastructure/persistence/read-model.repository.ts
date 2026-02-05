/**
 * Immobilisation Module - Read-Model Repository Interface
 * Conformité: READ_MODELS.md v1.0.0
 * 
 * Interface pour l'accès aux read-models.
 * Toutes les méthodes sont read-only.
 */

import {
  RmAssetsCurrent,
  RmAssetDepreciationHistory,
  RmAssetDepreciationSummary,
  RmAssetAllocationEffective,
  RmAssetAllocationAll,
  RmAssetMaintenanceHistory,
  RmAssetMaintenanceSummary,
  RmAssetMaintenanceByPeriod,
  RmAssetsRenewalProjection,
  RmAssetDisposalHistory,
  RmAssetNetBookValue,
  RmAssetsInService,
  RmDepreciationCostStructureExport,
  RmImmobilisationKpi,
  AssetFilter,
  PeriodFilter,
  AllocationFilter,
  RenewalFilter,
  ReadModelFilter,
} from './read-model.types';

// ═══════════════════════════════════════════════════════════════════════════
// REPOSITORY INTERFACE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Interface pour l'accès aux read-models Immobilisation.
 * Toutes les méthodes sont read-only (pas de mutation).
 */
export interface ImmobilisationReadModelRepository {
  // ─────────────────────────────────────────────────────────────────────────
  // Assets
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Récupère tous les actifs (rm_assets_current)
   */
  findAllAssets(filter: AssetFilter): Promise<RmAssetsCurrent[]>;
  
  /**
   * Récupère un actif par ID
   */
  findAssetById(tenantId: string, assetId: string): Promise<RmAssetsCurrent | null>;
  
  /**
   * Récupère les actifs en service uniquement (rm_assets_in_service)
   */
  findAssetsInService(filter: ReadModelFilter): Promise<RmAssetsInService[]>;
  
  /**
   * Récupère la VNC courante par actif (rm_asset_net_book_value)
   */
  findAssetNetBookValues(filter: AssetFilter): Promise<RmAssetNetBookValue[]>;
  
  /**
   * Récupère la VNC d'un actif spécifique
   */
  findAssetNetBookValue(tenantId: string, assetId: string): Promise<RmAssetNetBookValue | null>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Depreciation
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Récupère l'historique des amortissements (rm_asset_depreciation_history)
   */
  findDepreciationHistory(filter: PeriodFilter & { assetId?: string }): Promise<RmAssetDepreciationHistory[]>;
  
  /**
   * Récupère l'historique des amortissements d'un actif
   */
  findAssetDepreciationHistory(tenantId: string, assetId: string): Promise<RmAssetDepreciationHistory[]>;
  
  /**
   * Récupère le résumé des amortissements par période (rm_asset_depreciation_summary)
   * CONTRACTUEL: Cost-Structure
   */
  findDepreciationSummary(filter: PeriodFilter): Promise<RmAssetDepreciationSummary[]>;
  
  /**
   * Récupère les dotations ventilées pour Cost-Structure (rm_depreciation_cost_structure_export)
   * CONTRACTUEL: Cost-Structure
   */
  findDepreciationForCostStructure(filter: PeriodFilter): Promise<RmDepreciationCostStructureExport[]>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Allocations
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Récupère les allocations effectives (rm_asset_allocation_effective)
   * CONTRACTUEL: Cost-Structure
   */
  findEffectiveAllocations(filter: AllocationFilter): Promise<RmAssetAllocationEffective[]>;
  
  /**
   * Récupère toutes les allocations (rm_asset_allocation_all)
   */
  findAllAllocations(filter: AllocationFilter): Promise<RmAssetAllocationAll[]>;
  
  /**
   * Récupère les allocations d'un actif spécifique
   */
  findAssetAllocations(tenantId: string, assetId: string, activeOnly?: boolean): Promise<RmAssetAllocationEffective[]>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Maintenance
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Récupère l'historique de maintenance (rm_asset_maintenance_history)
   */
  findMaintenanceHistory(filter: PeriodFilter & { assetId?: string }): Promise<RmAssetMaintenanceHistory[]>;
  
  /**
   * Récupère l'historique de maintenance d'un actif
   */
  findAssetMaintenanceHistory(tenantId: string, assetId: string): Promise<RmAssetMaintenanceHistory[]>;
  
  /**
   * Récupère le résumé de maintenance par actif (rm_asset_maintenance_summary)
   * CONTRACTUEL: Cost-Structure, Budget
   */
  findMaintenanceSummary(filter: AssetFilter): Promise<RmAssetMaintenanceSummary[]>;
  
  /**
   * Récupère le résumé de maintenance par période (rm_asset_maintenance_by_period)
   * CONTRACTUEL: Cost-Structure
   */
  findMaintenanceByPeriod(filter: PeriodFilter): Promise<RmAssetMaintenanceByPeriod[]>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // Renewal & Disposal
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Récupère les projections de renouvellement (rm_assets_renewal_projection)
   * CONTRACTUEL: Budget
   */
  findRenewalProjections(filter: RenewalFilter): Promise<RmAssetsRenewalProjection[]>;
  
  /**
   * Récupère l'historique des cessions (rm_asset_disposal_history)
   */
  findDisposalHistory(filter: PeriodFilter): Promise<RmAssetDisposalHistory[]>;
  
  /**
   * Récupère les informations de cession d'un actif
   */
  findAssetDisposal(tenantId: string, assetId: string): Promise<RmAssetDisposalHistory | null>;
  
  // ─────────────────────────────────────────────────────────────────────────
  // KPIs
  // ─────────────────────────────────────────────────────────────────────────
  
  /**
   * Récupère les KPIs patrimoniales (rm_immobilisation_kpi)
   */
  findKpi(tenantId: string): Promise<RmImmobilisationKpi | null>;
}

// ═══════════════════════════════════════════════════════════════════════════
// REPOSITORY FACTORY
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Token d'injection pour le repository read-model
 */
export const IMMOBILISATION_READ_MODEL_REPOSITORY = Symbol('ImmobilisationReadModelRepository');

/**
 * Factory pour créer le repository read-model
 */
export interface ImmobilisationReadModelRepositoryFactory {
  create(): ImmobilisationReadModelRepository;
}
