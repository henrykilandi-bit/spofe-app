/**
 * Immobilisation Guardian Tests (Table-Driven)
 * Conformité: CONTRACT.md v1.0.0
 * Test runner: Vitest/Jest
 * 
 * Principe: Tests déterministes, sans base de données, sans mocks lourds
 */

import { describe, it, expect, beforeEach } from '@jest/globals';
import {
  ImmobilisationGuardian,
  ImmobilisationState,
  AssetState,
  DepreciationState,
  AllocationState,
} from './immobilisation.guardian';
import { INVARIANT_CODES } from './immobilisation.invariants';
import { GuardianError } from '../../../shared/GuardianError';
import {
  CreateAssetCommand,
  UpdateRenewalInfoCommand,
  CreateAllocationCommand,
  ReallocateAssetCommand,
  RecordDepreciationCommand,
  RecordMaintenanceCommand,
  DisposeAssetCommand,
  DecommissionAssetCommand,
  createBaseCommand,
} from '../domain/commands';

describe('ImmobilisationGuardian — invariants (table-driven)', () => {
  let guardian: ImmobilisationGuardian;

  beforeEach(() => {
    guardian = new ImmobilisationGuardian();
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // BASE STATE
  // ═══════════════════════════════════════════════════════════════════════════

  const NOW = new Date('2026-02-01T00:00:00Z');
  const PAST_DATE = new Date('2024-01-15T00:00:00Z');
  const FUTURE_DATE = new Date('2027-06-01T00:00:00Z');

  const baseAsset: AssetState = {
    assetId: 'asset-001',
    tenantId: 'tenant-1',
    status: 'IN_SERVICE',
    acquisitionCost: 1200000,
    acquisitionDate: PAST_DATE,
    usefulLifeMonths: 60, // 5 ans
    residualValue: 120000, // 10%
    currency: 'XAF',
  };

  const baseDepreciation: DepreciationState = {
    assetId: 'asset-001',
    depreciatedPeriods: ['2024-02', '2024-03', '2024-04'],
    accumulatedDepreciation: 54000, // 3 mois * 18000
    netBookValue: 1146000, // 1200000 - 54000
  };

  const baseAllocations: AllocationState[] = [
    {
      allocationId: 'alloc-001',
      assetId: 'asset-001',
      targetType: 'PRODUCT',
      targetId: 'prod-001',
      percentage: 60,
      effectiveFrom: PAST_DATE,
    },
    {
      allocationId: 'alloc-002',
      assetId: 'asset-001',
      targetType: 'PROJECT',
      targetId: 'proj-001',
      percentage: 40,
      effectiveFrom: PAST_DATE,
    },
  ];

  const baseState: ImmobilisationState = {
    tenantId: 'tenant-1',
    now: NOW,
    asset: baseAsset,
    depreciation: baseDepreciation,
    allocations: baseAllocations,
  };

  // ═══════════════════════════════════════════════════════════════════════════
  // IMM-SEC-01 — Tenant Isolation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('IMM-SEC-01 — tenant isolation', () => {
    const cases = [
      {
        name: 'rejects command with missing tenantId',
        command: {
          ...createBaseCommand('', 'user-1'),
          type: 'CreateAsset' as const,
          assetId: 'asset-new',
          acquisitionCost: 500000,
          currency: 'XAF',
          acquisitionDate: PAST_DATE,
          usefulLifeMonths: 36,
          residualValue: 50000,
        },
        state: baseState,
        expectedError: INVARIANT_CODES.IMM_SEC_01,
      },
      {
        name: 'rejects command with wrong tenant',
        command: {
          ...createBaseCommand('tenant-2', 'user-1'),
          type: 'RecordMaintenance' as const,
          maintenanceId: 'mnt-001',
          assetId: 'asset-001',
          maintenanceType: 'MAINTENANCE' as const,
          date: NOW,
          description: 'Révision annuelle',
          cost: 50000,
          currency: 'XAF',
          performedBy: 'Technicien A',
        },
        state: baseState,
        expectedError: INVARIANT_CODES.IMM_SEC_02,
      },
    ];

    cases.forEach(({ name, command, state, expectedError }) => {
      it(name, () => {
        expect(() => guardian.validate(command as any, state)).toThrow(GuardianError);
        try {
          guardian.validate(command as any, state);
        } catch (e) {
          expect((e as GuardianError).code).toBe(expectedError);
        }
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // IMM-ASS — Asset Creation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('IMM-ASS — asset creation', () => {
    const validCreateCommand: CreateAssetCommand = {
      ...createBaseCommand('tenant-1', 'user-1'),
      type: 'CreateAsset',
      assetId: 'asset-new',
      acquisitionCost: 500000,
      currency: 'XAF',
      acquisitionDate: PAST_DATE,
      usefulLifeMonths: 36,
      residualValue: 50000,
    };

    const cases = [
      {
        name: 'accepts valid asset creation',
        command: validCreateCommand,
        state: { tenantId: 'tenant-1', now: NOW },
        shouldPass: true,
      },
      {
        name: 'rejects acquisitionCost <= 0',
        command: { ...validCreateCommand, acquisitionCost: 0 },
        state: { tenantId: 'tenant-1', now: NOW },
        expectedError: INVARIANT_CODES.IMM_ASS_01,
      },
      {
        name: 'rejects negative acquisitionCost',
        command: { ...validCreateCommand, acquisitionCost: -100 },
        state: { tenantId: 'tenant-1', now: NOW },
        expectedError: INVARIANT_CODES.IMM_ASS_01,
      },
      {
        name: 'rejects usefulLife <= 0',
        command: { ...validCreateCommand, usefulLifeMonths: 0 },
        state: { tenantId: 'tenant-1', now: NOW },
        expectedError: INVARIANT_CODES.IMM_ASS_02,
      },
      {
        name: 'rejects negative residualValue',
        command: { ...validCreateCommand, residualValue: -1000 },
        state: { tenantId: 'tenant-1', now: NOW },
        expectedError: INVARIANT_CODES.IMM_ASS_03,
      },
      {
        name: 'rejects future acquisitionDate',
        command: { ...validCreateCommand, acquisitionDate: FUTURE_DATE },
        state: { tenantId: 'tenant-1', now: NOW },
        expectedError: INVARIANT_CODES.IMM_ASS_04,
      },
      {
        name: 'rejects residualValue > acquisitionCost',
        command: { ...validCreateCommand, residualValue: 600000 },
        state: { tenantId: 'tenant-1', now: NOW },
        expectedError: INVARIANT_CODES.IMM_ASS_07,
      },
    ];

    cases.forEach(({ name, command, state, shouldPass, expectedError }) => {
      it(name, () => {
        if (shouldPass) {
          expect(() => guardian.validate(command as any, state)).not.toThrow();
        } else {
          expect(() => guardian.validate(command as any, state)).toThrow(GuardianError);
          try {
            guardian.validate(command as any, state);
          } catch (e) {
            expect((e as GuardianError).code).toBe(expectedError);
          }
        }
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // IMM-DEP — Depreciation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('IMM-DEP — depreciation', () => {
    const cases = [
      {
        name: 'accepts depreciation on IN_SERVICE asset',
        command: {
          ...createBaseCommand('tenant-1', 'user-1'),
          type: 'RecordDepreciation' as const,
          scheduleId: 'sched-001',
          assetId: 'asset-001',
          period: '2024-05', // Not yet depreciated
        },
        state: baseState,
        shouldPass: true,
      },
      {
        name: 'rejects depreciation on disposed asset',
        command: {
          ...createBaseCommand('tenant-1', 'user-1'),
          type: 'RecordDepreciation' as const,
          scheduleId: 'sched-001',
          assetId: 'asset-001',
          period: '2024-05',
        },
        state: {
          ...baseState,
          asset: { ...baseAsset, status: 'DISPOSED' as const },
        },
        expectedError: INVARIANT_CODES.IMM_ASS_06,
      },
      {
        name: 'rejects depreciation on already depreciated period',
        command: {
          ...createBaseCommand('tenant-1', 'user-1'),
          type: 'RecordDepreciation' as const,
          scheduleId: 'sched-001',
          assetId: 'asset-001',
          period: '2024-03', // Already in depreciatedPeriods
        },
        state: baseState,
        expectedError: INVARIANT_CODES.IMM_DEP_05,
      },
    ];

    cases.forEach(({ name, command, state, shouldPass, expectedError }) => {
      it(name, () => {
        if (shouldPass) {
          expect(() => guardian.validate(command as any, state)).not.toThrow();
        } else {
          expect(() => guardian.validate(command as any, state)).toThrow(GuardianError);
          try {
            guardian.validate(command as any, state);
          } catch (e) {
            expect((e as GuardianError).code).toBe(expectedError);
          }
        }
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // IMM-ALL — Allocation
  // ═══════════════════════════════════════════════════════════════════════════

  describe('IMM-ALL — allocation', () => {
    const cases = [
      {
        name: 'accepts valid allocation',
        command: {
          ...createBaseCommand('tenant-1', 'user-1'),
          type: 'CreateAllocation' as const,
          allocationId: 'alloc-new',
          assetId: 'asset-001',
          targetType: 'SERVICE' as const,
          targetId: 'svc-001',
          percentage: 30,
          effectiveFrom: NOW,
        },
        state: baseState,
        shouldPass: true,
      },
      {
        name: 'rejects allocation on disposed asset',
        command: {
          ...createBaseCommand('tenant-1', 'user-1'),
          type: 'CreateAllocation' as const,
          allocationId: 'alloc-new',
          assetId: 'asset-001',
          targetType: 'SERVICE' as const,
          targetId: 'svc-001',
          percentage: 30,
          effectiveFrom: NOW,
        },
        state: {
          ...baseState,
          asset: { ...baseAsset, status: 'DISPOSED' as const },
        },
        expectedError: INVARIANT_CODES.IMM_ALL_05,
      },
      {
        name: 'rejects percentage > 100',
        command: {
          ...createBaseCommand('tenant-1', 'user-1'),
          type: 'CreateAllocation' as const,
          allocationId: 'alloc-new',
          assetId: 'asset-001',
          targetType: 'SERVICE' as const,
          targetId: 'svc-001',
          percentage: 150,
          effectiveFrom: NOW,
        },
        state: baseState,
        expectedError: INVARIANT_CODES.IMM_ALL_01,
      },
      {
        name: 'rejects percentage <= 0',
        command: {
          ...createBaseCommand('tenant-1', 'user-1'),
          type: 'CreateAllocation' as const,
          allocationId: 'alloc-new',
          assetId: 'asset-001',
          targetType: 'SERVICE' as const,
          targetId: 'svc-001',
          percentage: 0,
          effectiveFrom: NOW,
        },
        state: baseState,
        expectedError: INVARIANT_CODES.IMM_ALL_01,
      },
    ];

    cases.forEach(({ name, command, state, shouldPass, expectedError }) => {
      it(name, () => {
        if (shouldPass) {
          expect(() => guardian.validate(command as any, state)).not.toThrow();
        } else {
          expect(() => guardian.validate(command as any, state)).toThrow(GuardianError);
          try {
            guardian.validate(command as any, state);
          } catch (e) {
            expect((e as GuardianError).code).toBe(expectedError);
          }
        }
      });
    });

    it('rejects reallocation where sum != 100%', () => {
      const command: ReallocateAssetCommand = {
        ...createBaseCommand('tenant-1', 'user-1'),
        type: 'ReallocateAsset',
        assetId: 'asset-001',
        effectiveDate: NOW,
        allocations: [
          { allocationId: 'alloc-new-1', targetType: 'PRODUCT', targetId: 'prod-001', percentage: 50 },
          { allocationId: 'alloc-new-2', targetType: 'PROJECT', targetId: 'proj-001', percentage: 30 },
          // Sum = 80%, not 100%
        ],
      };

      expect(() => guardian.validate(command, baseState)).toThrow(GuardianError);
      try {
        guardian.validate(command, baseState);
      } catch (e) {
        expect((e as GuardianError).code).toBe(INVARIANT_CODES.IMM_ALL_02);
      }
    });

    it('accepts reallocation where sum = 100%', () => {
      const command: ReallocateAssetCommand = {
        ...createBaseCommand('tenant-1', 'user-1'),
        type: 'ReallocateAsset',
        assetId: 'asset-001',
        effectiveDate: NOW,
        allocations: [
          { allocationId: 'alloc-new-1', targetType: 'PRODUCT', targetId: 'prod-001', percentage: 60 },
          { allocationId: 'alloc-new-2', targetType: 'PROJECT', targetId: 'proj-001', percentage: 40 },
        ],
      };

      expect(() => guardian.validate(command, baseState)).not.toThrow();
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // IMM-MNT — Maintenance
  // ═══════════════════════════════════════════════════════════════════════════

  describe('IMM-MNT — maintenance', () => {
    const validMaintenanceCommand: RecordMaintenanceCommand = {
      ...createBaseCommand('tenant-1', 'user-1'),
      type: 'RecordMaintenance',
      maintenanceId: 'mnt-001',
      assetId: 'asset-001',
      maintenanceType: 'MAINTENANCE',
      date: new Date('2026-01-15'),
      description: 'Révision annuelle',
      cost: 50000,
      currency: 'XAF',
      performedBy: 'Technicien A',
    };

    const cases = [
      {
        name: 'accepts valid maintenance',
        command: validMaintenanceCommand,
        state: baseState,
        shouldPass: true,
      },
      {
        name: 'rejects maintenance on disposed asset',
        command: validMaintenanceCommand,
        state: {
          ...baseState,
          asset: { ...baseAsset, status: 'DISPOSED' as const },
        },
        expectedError: INVARIANT_CODES.IMM_MNT_03,
      },
      {
        name: 'rejects negative maintenance cost',
        command: { ...validMaintenanceCommand, cost: -1000 },
        state: baseState,
        expectedError: INVARIANT_CODES.IMM_MNT_01,
      },
      {
        name: 'rejects future maintenance date',
        command: { ...validMaintenanceCommand, date: FUTURE_DATE },
        state: baseState,
        expectedError: INVARIANT_CODES.IMM_MNT_02,
      },
    ];

    cases.forEach(({ name, command, state, shouldPass, expectedError }) => {
      it(name, () => {
        if (shouldPass) {
          expect(() => guardian.validate(command as any, state)).not.toThrow();
        } else {
          expect(() => guardian.validate(command as any, state)).toThrow(GuardianError);
          try {
            guardian.validate(command as any, state);
          } catch (e) {
            expect((e as GuardianError).code).toBe(expectedError);
          }
        }
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // IMM-DIS — Disposal
  // ═══════════════════════════════════════════════════════════════════════════

  describe('IMM-DIS — disposal', () => {
    const validDisposeCommand: DisposeAssetCommand = {
      ...createBaseCommand('tenant-1', 'user-1'),
      type: 'DisposeAsset',
      disposalId: 'disp-001',
      assetId: 'asset-001',
      disposalDate: NOW,
      disposalValue: 800000,
      currency: 'XAF',
    };

    const cases = [
      {
        name: 'accepts valid disposal',
        command: validDisposeCommand,
        state: baseState,
        shouldPass: true,
      },
      {
        name: 'rejects disposal on already disposed asset',
        command: validDisposeCommand,
        state: {
          ...baseState,
          asset: { ...baseAsset, status: 'DISPOSED' as const },
        },
        expectedError: INVARIANT_CODES.IMM_DIS_02,
      },
      {
        name: 'rejects disposal date before acquisition',
        command: { ...validDisposeCommand, disposalDate: new Date('2023-01-01') },
        state: baseState,
        expectedError: INVARIANT_CODES.IMM_DIS_01,
      },
    ];

    cases.forEach(({ name, command, state, shouldPass, expectedError }) => {
      it(name, () => {
        if (shouldPass) {
          expect(() => guardian.validate(command as any, state)).not.toThrow();
        } else {
          expect(() => guardian.validate(command as any, state)).toThrow(GuardianError);
          try {
            guardian.validate(command as any, state);
          } catch (e) {
            expect((e as GuardianError).code).toBe(expectedError);
          }
        }
      });
    });
  });

  // ═══════════════════════════════════════════════════════════════════════════
  // CALCULS GUARDIAN
  // ═══════════════════════════════════════════════════════════════════════════

  describe('Guardian calculations', () => {
    describe('calculateDepreciation', () => {
      it('calculates correct monthly depreciation (linear)', () => {
        const result = guardian.calculateDepreciation(
          baseAsset,
          baseDepreciation,
          '2024-05'
        );

        // (1200000 - 120000) / 60 = 18000
        expect(result.depreciationAmount).toBe(18000);
        expect(result.newAccumulatedDepreciation).toBe(72000); // 54000 + 18000
        expect(result.newNetBookValue).toBe(1128000); // 1200000 - 72000
      });

      it('stops depreciation at residual value', () => {
        // Asset presque entièrement amorti
        const nearEndAsset: AssetState = {
          ...baseAsset,
          acquisitionCost: 100000,
          residualValue: 10000,
          usefulLifeMonths: 6,
        };

        const nearEndDepreciation: DepreciationState = {
          assetId: 'asset-001',
          depreciatedPeriods: ['2024-01', '2024-02', '2024-03', '2024-04', '2024-05'],
          accumulatedDepreciation: 85000, // Proche de 90000 max
          netBookValue: 15000, // 100000 - 85000
        };

        const result = guardian.calculateDepreciation(
          nearEndAsset,
          nearEndDepreciation,
          '2024-06'
        );

        // Dotation normale = 15000, mais VNC finale doit être >= 10000
        // Donc dotation max = 15000 - 10000 = 5000
        expect(result.depreciationAmount).toBe(5000);
        expect(result.newNetBookValue).toBe(10000); // = residualValue
      });

      it('throws on disposed asset', () => {
        const disposedAsset: AssetState = { ...baseAsset, status: 'DISPOSED' };

        expect(() => 
          guardian.calculateDepreciation(disposedAsset, baseDepreciation, '2024-05')
        ).toThrow(GuardianError);
      });

      it('throws on already depreciated period', () => {
        expect(() => 
          guardian.calculateDepreciation(baseAsset, baseDepreciation, '2024-03')
        ).toThrow(GuardianError);
      });
    });

    describe('calculateDisposal', () => {
      it('calculates gain on sale', () => {
        const result = guardian.calculateDisposal(
          baseAsset,
          baseDepreciation,
          1500000, // vendu plus cher que la VNC
          NOW
        );

        expect(result.netBookValue).toBe(1146000);
        expect(result.disposalValue).toBe(1500000);
        expect(result.gainOrLoss).toBe(354000); // 1500000 - 1146000
        expect(result.resultType).toBe('GAIN');
      });

      it('calculates loss on sale', () => {
        const result = guardian.calculateDisposal(
          baseAsset,
          baseDepreciation,
          800000, // vendu moins cher que la VNC
          NOW
        );

        expect(result.gainOrLoss).toBe(-346000); // 800000 - 1146000
        expect(result.resultType).toBe('LOSS');
      });

      it('calculates neutral result', () => {
        const result = guardian.calculateDisposal(
          baseAsset,
          baseDepreciation,
          1146000, // vendu exactement à la VNC
          NOW
        );

        expect(result.gainOrLoss).toBe(0);
        expect(result.resultType).toBe('NEUTRAL');
      });

      it('throws on disposed asset', () => {
        const disposedAsset: AssetState = { ...baseAsset, status: 'DISPOSED' };

        expect(() => 
          guardian.calculateDisposal(disposedAsset, baseDepreciation, 800000, NOW)
        ).toThrow(GuardianError);
      });

      it('throws if disposal date before acquisition', () => {
        expect(() => 
          guardian.calculateDisposal(baseAsset, baseDepreciation, 800000, new Date('2023-01-01'))
        ).toThrow(GuardianError);
      });
    });
  });
});
