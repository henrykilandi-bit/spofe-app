/**
 * SPOFE — Tests Unitaires Guardian Immobilisation (CORRIGÉ)
 * Tests basiques pour vérifier que le Guardian fonctionne correctement
 * Module Immobilisation v1.0.0 — Tests SPOFE-compliant
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ImmobilisationGuardian } from '../../guardian/immobilisation.guardian';
import type { ImmobilisationState } from '../../guardian/immobilisation.guardian';
import type {
  CreateAssetCommand,
  RecordDepreciationCommand,
  RecordMaintenanceCommand,
  DisposeAssetCommand,
  UpdateRenewalInfoCommand
} from '../../domain/commands';

describe('ImmobilisationGuardian — tests SPOFE', () => {
  let guardian: ImmobilisationGuardian;

  beforeEach(() => {
    guardian = new ImmobilisationGuardian();
  });

  describe('Guardian functionality', () => {
    it('exists and can be instantiated', () => {
      expect(guardian).toBeDefined();
      expect(guardian.validate).toBeDefined();
    });
  });

  describe('CreateAsset validation', () => {
    it('accepts valid asset creation', () => {
      const command: CreateAssetCommand = {
        type: 'CreateAsset',
        commandId: 'cmd-1',
        tenantId: 'tenant-1',
        actorId: 'user-1',
        timestamp: new Date(),
        assetId: 'asset-1',
        acquisitionCost: 10000,
        currency: 'EUR',
        acquisitionDate: new Date('2024-01-15'),
        usefulLifeMonths: 60,
        residualValue: 1000
      };

      const state: ImmobilisationState = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01')
      };

      // Should not throw for valid input
      expect(() => guardian.validate(command, state)).not.toThrow();
    });

    it('rejects negative acquisition cost', () => {
      const command: CreateAssetCommand = {
        type: 'CreateAsset',
        commandId: 'cmd-1',
        tenantId: 'tenant-1',
        actorId: 'user-1',
        timestamp: new Date(),
        assetId: 'asset-1',
        acquisitionCost: -1000, // INVALID
        currency: 'EUR',
        acquisitionDate: new Date('2024-01-15'),
        usefulLifeMonths: 60,
        residualValue: 1000
      };

      const state: ImmobilisationState = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01')
      };

      // Should throw for invalid input
      expect(() => guardian.validate(command, state)).toThrow();
    });
  });

  describe('RecordDepreciation validation', () => {
    it('accepts valid depreciation with asset in service', () => {
      const command: RecordDepreciationCommand = {
        type: 'RecordDepreciation',
        commandId: 'cmd-1',
        tenantId: 'tenant-1',
        actorId: 'user-1',
        timestamp: new Date(),
        scheduleId: 'sched-1',
        assetId: 'asset-1',
        period: '2024-02'
      };

      const state: ImmobilisationState = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: {
          assetId: 'asset-1',
          tenantId: 'tenant-1',
          status: 'IN_SERVICE' as const,
          acquisitionCost: 12000,
          acquisitionDate: new Date('2020-01-01'),
          currency: 'EUR',
          usefulLifeMonths: 60,
          residualValue: 2000
        },
        depreciation: {
          assetId: 'asset-1',
          depreciatedPeriods: ['2024-01'],
          accumulatedDepreciation: 200,
          netBookValue: 11800
        }
      };

      expect(() => guardian.validate(command, state)).not.toThrow();
    });
  });

  describe('RecordMaintenance validation', () => {
    it('accepts valid maintenance record', () => {
      const command: RecordMaintenanceCommand = {
        type: 'RecordMaintenance',
        commandId: 'cmd-1',
        tenantId: 'tenant-1',
        actorId: 'user-1',
        timestamp: new Date(),
        maintenanceId: 'mnt-1',
        assetId: 'asset-1',
        maintenanceType: 'PREVENTIVE' as any,
        date: new Date('2024-01-01'),
        description: 'Regular maintenance',
        cost: 500,
        currency: 'EUR',
        performedBy: 'Technicien-1'
      };

      const state: ImmobilisationState = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: {
          assetId: 'asset-1',
          tenantId: 'tenant-1',
          status: 'IN_SERVICE' as const,
          acquisitionCost: 12000,
          acquisitionDate: new Date('2020-01-01'),
          currency: 'EUR',
          usefulLifeMonths: 60,
          residualValue: 2000
        }
      };

      expect(() => guardian.validate(command, state)).not.toThrow();
    });
  });

  describe('DisposeAsset validation', () => {
    it('accepts valid asset disposal', () => {
      const command: DisposeAssetCommand = {
        type: 'DisposeAsset',
        commandId: 'cmd-1',
        tenantId: 'tenant-1',
        actorId: 'user-1',
        timestamp: new Date(),
        disposalId: 'disp-1',
        assetId: 'asset-1',
        disposalDate: new Date('2024-02-01'),
        disposalValue: 8000,
        currency: 'EUR'
      };

      const state: ImmobilisationState = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: {
          assetId: 'asset-1',
          tenantId: 'tenant-1',
          status: 'IN_SERVICE' as const,
          acquisitionCost: 12000,
          acquisitionDate: new Date('2020-01-01'),
          currency: 'EUR',
          usefulLifeMonths: 60,
          residualValue: 2000
        }
      };

      expect(() => guardian.validate(command, state)).not.toThrow();
    });
  });

  describe('UpdateRenewalInfo validation', () => {
    it('accepts valid renewal update', () => {
      const command: UpdateRenewalInfoCommand = {
        type: 'UpdateRenewalInfo',
        commandId: 'cmd-1',
        tenantId: 'tenant-1',
        actorId: 'user-1',
        timestamp: new Date(),
        assetId: 'asset-1',
        renewalDate: new Date('2025-01-01'),
        replacementCost: 15000,
        currency: 'EUR'
      };

      const state: ImmobilisationState = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: {
          assetId: 'asset-1',
          tenantId: 'tenant-1',
          status: 'IN_SERVICE' as const,
          acquisitionCost: 12000,
          acquisitionDate: new Date('2020-01-01'),
          currency: 'EUR',
          usefulLifeMonths: 60,
          residualValue: 2000
        }
      };

      expect(() => guardian.validate(command, state)).not.toThrow();
    });
  });
});