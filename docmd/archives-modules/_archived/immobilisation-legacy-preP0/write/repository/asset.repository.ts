/**
 * Write Repository Interface - Module Immobilisation v1.0.0
 * 
 * Interface contractuelle pour la persistance write-side.
 * Aucune logique métier - uniquement des opérations de persistance.
 */

import { AssetCreated, ImmobilisationEvent } from '../../domain/events';

export interface AssetWriteRepository {
  /**
   * Sauvegarde un nouvel asset (création initiale)
   */
  saveAsset(event: AssetCreated): Promise<void>;

  /**
   * Sauvegarde un event de domaine
   */
  saveEvent(event: ImmobilisationEvent): Promise<void>;

  /**
   * Récupère un asset par ID (pour validation Guardian)
   */
  getAssetById(tenantId: string, assetId: string): Promise<any>;

  /**
   * Récupère l'état des amortissements d'un asset
   */
  getDepreciationState(tenantId: string, assetId: string): Promise<any>;

  /**
   * Récupère les allocations actives d'un asset
   */
  getActiveAllocations(tenantId: string, assetId: string): Promise<any[]>;
}

/**
 * Token pour injection de dépendance
 */
export const ASSET_REPOSITORY = Symbol('ASSET_REPOSITORY');
