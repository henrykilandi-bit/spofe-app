/**
 * SPOFE — Tests Unitaires Guardian Immobilisation (CORRIGÉS)
 * Table-Driven Tests pour tous les invariants métier
 * 
 * 🎯 Objectif: Prouver que chaque invariant Guardian est:
 * ✅ accepté quand valide
 * ❌ rejeté quand invalide avec code IMM-XXX stable
 * 📌 Guardian pur, déterministe, sans dépendances techniques
 * 
 * Module Immobilisation v1.0.0 — Tests SPOFE-compliant
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import { ImmobilisationGuardian } from '../../guardian/immobilisation.guardian';
import { GuardianError } from '../../../../shared/GuardianError';
import type {
  CreateAssetCommand,
  RecordDepreciationCommand,
  RecordMaintenanceCommand,
  DisposeAssetCommand,
  UpdateRenewalInfoCommand,
  ImmobilisationCommand
} from '../../domain/commands';
import type { ImmobilisationState } from '../../guardian/immobilisation.guardian';
import { expectGuardianRejection } from '../../../../spofe/test-helpers/index';

describe('ImmobilisationGuardian — table-driven invariants (SPOFE)', () => {
  let guardian: ImmobilisationGuardian;

  beforeEach(() => {
    guardian = new ImmobilisationGuardian();
  });

  // ===================================================================
  // CREATE ASSET INVARIANTS
  // ===================================================================
  describe('CreateAsset — invariants', () => {
    const validState = (): ImmobilisationState => ({
      tenantId: 'tenant-1',
      now: new Date('2024-02-01'),
      asset: undefined,
      depreciation: undefined,
      allocations: undefined
    });

    const validCommand = (): CreateAssetCommand => ({
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
    });

    it('rejects negative acquisition cost (IMM-ACQ-001)', async () => {
      await expectGuardianRejection(
        () => Promise.resolve(guardian.validate({
          ...validCommand(),
          acquisitionCost: -1000
        }, validState())),
        'IMM-ACQ-001'
      );
    });

    it('rejects zero acquisition cost (IMM-ACQ-001)', async () => {
      await expectGuardianRejection(
        () => Promise.resolve(guardian.validate({
          ...validCommand(),
          acquisitionCost: 0
        }, validState())),
        'IMM-ACQ-001'
      );
    });

    it('rejects zero useful life (IMM-ASS-002)', async () => {
      await expectGuardianRejection(
        () => Promise.resolve(guardian.validate({
          ...validCommand(),
          usefulLifeMonths: 0
        }, validState())),
        'IMM-ASS-002'
      );
    });

    it('accepts valid asset creation', () => {
      expect(() => guardian.validate(validCommand(), validState())).not.toThrow();
    });
  });

  // ===================================================================
  // RECORD DEPRECIATION INVARIANTS
  // ===================================================================
  describe('RecordDepreciation — invariants', () => {
    const baseAsset = {
      assetId: 'asset-1',
      tenantId: 'tenant-1',
      designation: 'Test Asset',
      description: 'Test description',
      category: 'EQUIPMENT',
      acquisitionCost: 12000,
      currency: 'EUR',
      acquisitionDate: new Date('2020-01-01'),
      serviceStartDate: new Date('2020-01-01'),
      usefulLifeMonths: 60,
      depreciationMethod: 'LINEAR' as const,
      residualValue: 2000,
      status: 'IN_SERVICE' as const,
      renewalDate: null,
      replacementCost: null
    };

    const validCommand = (): RecordDepreciationCommand => ({
      type: 'RecordDepreciation',
      commandId: 'cmd-1',
      tenantId: 'tenant-1',
      actorId: 'user-1',
      timestamp: new Date(),
      scheduleId: 'sched-1',
      assetId: 'asset-1',
      period: '2024-02'
    });

    it('rejects depreciation if asset is not in service (IMM-DEP-001)', async () => {
      const state = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: { ...baseAsset, status: 'DISPOSED' as const },
        depreciation: null,
        allocations: null
      };

      await expectGuardianRejection(
        () => Promise.resolve(guardian.validate(validCommand(), state)),
        'IMM-DEP-001'
      );
    });

    it('accepts valid depreciation', () => {
      const state = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: baseAsset,
        depreciation: null,
        allocations: null
      };

      expect(() => guardian.validate(validCommand(), state)).not.toThrow();
    });
  });

  // ===================================================================
  // RECORD MAINTENANCE INVARIANTS
  // ===================================================================
  describe('RecordMaintenance — invariants', () => {
    const baseAsset = {
      assetId: 'asset-1',
      tenantId: 'tenant-1',
      designation: 'Test Asset',
      description: 'Test description',
      category: 'EQUIPMENT',
      acquisitionCost: 12000,
      currency: 'EUR',
      acquisitionDate: new Date('2020-01-01'),
      serviceStartDate: new Date('2020-01-01'),
      usefulLifeMonths: 60,
      depreciationMethod: 'LINEAR' as const,
      residualValue: 2000,
      status: 'IN_SERVICE' as const,
      renewalDate: null,
      replacementCost: null
    };

    const validCommand = (): RecordMaintenanceCommand => ({
      type: 'RecordMaintenance',
      commandId: 'cmd-1',
      tenantId: 'tenant-1',
      actorId: 'user-1',
      timestamp: new Date(),
      assetId: 'asset-1',
      performedBy: 'Technicien-1',
      date: new Date('2024-01-01')
    });

    it('rejects maintenance if asset is not in service (IMM-MNT-001)', async () => {
      const state = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: { ...baseAsset, status: 'DISPOSED' as const },
        depreciation: null,
        allocations: null
      };

      await expectGuardianRejection(
        () => Promise.resolve(guardian.validate(validCommand(), state)),
        'IMM-MNT-001'
      );
    });

    it('accepts valid maintenance', () => {
      const state = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: baseAsset,
        depreciation: null,
        allocations: null
      };

      expect(() => guardian.validate(validCommand(), state)).not.toThrow();
    });
  });

  // ===================================================================
  // DISPOSE ASSET INVARIANTS
  // ===================================================================
  describe('DisposeAsset — invariants', () => {
    const baseAsset = {
      assetId: 'asset-1',
      tenantId: 'tenant-1',
      designation: 'Test Asset',
      description: 'Test description',
      category: 'EQUIPMENT',
      acquisitionCost: 12000,
      currency: 'EUR',
      acquisitionDate: new Date('2020-01-01'),
      serviceStartDate: new Date('2020-01-01'),
      usefulLifeMonths: 60,
      depreciationMethod: 'LINEAR' as const,
      residualValue: 2000,
      status: 'IN_SERVICE' as const,
      renewalDate: null,
      replacementCost: null
    };

    const validCommand = (): DisposeAssetCommand => ({
      type: 'DisposeAsset',
      commandId: 'cmd-1',
      tenantId: 'tenant-1',
      actorId: 'user-1',
      timestamp: new Date(),
      assetId: 'asset-1',
      disposalId: 'disp-1'
    });

    it('rejects disposal if asset already disposed (IMM-DIS-001)', async () => {
      const state = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: { ...baseAsset, status: 'DISPOSED' as const },
        depreciation: null,
        allocations: null
      };

      await expectGuardianRejection(
        () => Promise.resolve(guardian.validate(validCommand(), state)),
        'IMM-DIS-001'
      );
    });

    it('accepts valid disposal', () => {
      const state = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: baseAsset,
        depreciation: null,
        allocations: null
      };

      expect(() => guardian.validate(validCommand(), state)).not.toThrow();
    });
  });

  // ===================================================================
  // UPDATE RENEWAL INFO INVARIANTS
  // ===================================================================
  describe('UpdateRenewalInfo — invariants', () => {
    const baseAsset = {
      assetId: 'asset-1',
      tenantId: 'tenant-1',
      designation: 'Test Asset',
      description: 'Test description',
      category: 'EQUIPMENT',
      acquisitionCost: 12000,
      currency: 'EUR',
      acquisitionDate: new Date('2020-01-01'),
      serviceStartDate: new Date('2020-01-01'),
      usefulLifeMonths: 60,
      depreciationMethod: 'LINEAR' as const,
      residualValue: 2000,
      status: 'IN_SERVICE' as const,
      renewalDate: null,
      replacementCost: null
    };

    const validCommand = (): UpdateRenewalInfoCommand => ({
      type: 'UpdateRenewalInfo',
      commandId: 'cmd-1',
      tenantId: 'tenant-1',
      actorId: 'user-1',
      timestamp: new Date(),
      assetId: 'asset-1',
      renewalDate: new Date('2025-01-01'),
      replacementCost: 15000
    });

    it('rejects negative replacement cost (IMM-REN-002)', async () => {
      const state = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: baseAsset,
        depreciation: null,
        allocations: null
      };

      await expectGuardianRejection(
        () => Promise.resolve(guardian.validate({
          ...validCommand(),
          replacementCost: -1000
        }, state)),
        'IMM-REN-002'
      );
    });

    it('accepts valid renewal update', () => {
      const state = {
        tenantId: 'tenant-1',
        now: new Date('2024-02-01'),
        asset: baseAsset,
        depreciation: null,
        allocations: null
      };

      expect(() => guardian.validate(validCommand(), state)).not.toThrow();
    });
  });
});