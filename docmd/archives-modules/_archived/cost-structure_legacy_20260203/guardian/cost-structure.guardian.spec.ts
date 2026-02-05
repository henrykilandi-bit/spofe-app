/**
 * Cost-Structure Guardian Tests (Table-Driven)
 * Conformité: COST-STRUCTURE_CONTRACT v1.0.0
 * Test runner: Jest
 */

import { CostStructureGuardian, CostStructureState, INVARIANT_CODES } from './cost-structure.guardian';
import {
  CreateEconomicProjectCommand,
  CreateCostStructureCommand,
  AddCostLineCommand,
  RunSimulationCommand,
  FreezeCostStructureCommand,
  ValidateProjectCommand,
  RejectProjectCommand,
} from '../domain/commands';
import { GuardianError } from '../../../shared/GuardianError';
import { Money, CostLine } from '../domain/value-objects';

describe('CostStructureGuardian — invariants (table-driven)', () => {
  let guardian: CostStructureGuardian;

  beforeEach(() => {
    guardian = new CostStructureGuardian();
  });

  /**
   * Base state for tests
   */
  const baseState: CostStructureState = {
    tenantId: 'tenant-1',
    project: {
      id: 'proj-1',
      tenantId: 'tenant-1',
      status: 'SIMULATED',
      versions: [
        {
          version: 1,
          status: 'FROZEN',
          costLines: [{ amount: 100, category: 'VARIABLE', label: 'Material' }],
          assumptions: {
            priceTarget: 200,
            expectedVolume: 100,
            capacityMax: 150,
            scenarios: {
              pessimistic: 70,
              realistic: 100,
              optimistic: 120,
            },
          },
          simulation: {
            unitCost: 80,
            totalCost: 8000,
            grossMargin: 60,
            netMargin: 20,
            marginAt70: 10,
          },
        },
      ],
    },
    costStructure: {
      version: 1,
      status: 'DRAFT',
      costLines: [{ amount: 100, category: 'VARIABLE', label: 'Material' }],
      assumptions: {
        priceTarget: 200,
        expectedVolume: 100,
        capacityMax: 150,
        scenarios: {
          pessimistic: 70,
          realistic: 100,
          optimistic: 120,
        },
      },
      simulation: {
        unitCost: 80,
        totalCost: 8000,
        grossMargin: 60,
        netMargin: 20,
        marginAt70: 10,
      },
    },
  };

  /**
   * COUT-SEC-01 — Tenant isolation
   */
  describe('COUT-SEC-01 — tenant isolation', () => {
    const cases = [
      {
        name: 'rejects command with wrong tenant',
        command: {
          type: 'ValidateProject' as const,
          tenantId: 'tenant-2',
          projectId: 'proj-1',
          actorId: 'user-1',
        },
        state: baseState,
        error: INVARIANT_CODES.COUT_SEC_01,
      },
      {
        name: 'rejects command with empty tenant',
        command: {
          type: 'ValidateProject' as const,
          tenantId: '',
          projectId: 'proj-1',
          actorId: 'user-1',
        },
        state: baseState,
        error: INVARIANT_CODES.COUT_SEC_01,
      },
      {
        name: 'accepts command with correct tenant',
        command: {
          type: 'ValidateProject' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          actorId: 'user-1',
        },
        state: baseState,
        error: null,
      },
    ];

    it.each(cases)('$name', ({ command, state, error }) => {
      if (error) {
        expect(() => guardian.validate(command, state)).toThrow(GuardianError);
        expect(() => guardian.validate(command, state)).toThrow(
          expect.objectContaining({ code: error })
        );
      } else {
        expect(() => guardian.validate(command, state)).not.toThrow();
      }
    });
  });

  /**
   * COUT-PROJ-01 — Project name uniqueness
   */
  describe('COUT-PROJ-01 — project name uniqueness', () => {
    const cases = [
      {
        name: 'rejects duplicate project name',
        command: {
          type: 'CreateEconomicProject' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-2',
          name: 'Existing Project',
          projectType: 'PRODUCT' as const,
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          existingProjects: [
            {
              id: 'proj-1',
              name: 'Existing Project',
              tenantId: 'tenant-1',
              status: 'DRAFT',
            },
          ],
        },
        error: INVARIANT_CODES.COUT_PROJ_01,
      },
      {
        name: 'accepts unique project name',
        command: {
          type: 'CreateEconomicProject' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-2',
          name: 'New Project',
          projectType: 'PRODUCT' as const,
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          existingProjects: [
            {
              id: 'proj-1',
              name: 'Existing Project',
              tenantId: 'tenant-1',
              status: 'DRAFT',
            },
          ],
        },
        error: null,
      },
      {
        name: 'rejects empty project name',
        command: {
          type: 'CreateEconomicProject' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-2',
          name: '',
          projectType: 'PRODUCT' as const,
          actorId: 'user-1',
        },
        state: baseState,
        error: INVARIANT_CODES.COUT_PROJ_01,
      },
    ];

    it.each(cases)('$name', ({ command, state, error }) => {
      if (error) {
        expect(() => guardian.validate(command, state)).toThrow(GuardianError);
        expect(() => guardian.validate(command, state)).toThrow(
          expect.objectContaining({ code: error })
        );
      } else {
        expect(() => guardian.validate(command, state)).not.toThrow();
      }
    });
  });

  /**
   * COUT-CS-01 — Last version must be FROZEN
   */
  describe('COUT-CS-01 — last version frozen', () => {
    const cases = [
      {
        name: 'rejects new version when last is DRAFT',
        command: {
          type: 'CreateCostStructure' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 2,
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          project: {
            ...baseState.project!,
            versions: [
              {
                version: 1,
                status: 'DRAFT',
                costLines: [],
              },
            ],
          },
        },
        error: INVARIANT_CODES.COUT_CS_01,
      },
      {
        name: 'accepts new version when last is FROZEN',
        command: {
          type: 'CreateCostStructure' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 2,
          actorId: 'user-1',
        },
        state: baseState,
        error: null,
      },
    ];

    it.each(cases)('$name', ({ command, state, error }) => {
      if (error) {
        expect(() => guardian.validate(command, state)).toThrow(GuardianError);
        expect(() => guardian.validate(command, state)).toThrow(
          expect.objectContaining({ code: error })
        );
      } else {
        expect(() => guardian.validate(command, state)).not.toThrow();
      }
    });
  });

  /**
   * COUT-CS-02 — Cost line amount > 0
   */
  describe('COUT-CS-02 — cost line validation', () => {
    const cases = [
      {
        name: 'rejects negative cost line amount in command',
        command: {
          type: 'AddCostLine' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          costLine: { amount: { amount: -10, currency: 'XAF' } } as any,
          actorId: 'user-1',
        },
        state: baseState,
        error: INVARIANT_CODES.COUT_CS_02,
      },
      {
        name: 'rejects zero cost line amount in command',
        command: {
          type: 'AddCostLine' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          costLine: { amount: { amount: 0, currency: 'XAF' } } as any,
          actorId: 'user-1',
        },
        state: baseState,
        error: INVARIANT_CODES.COUT_CS_02,
      },
      {
        name: 'accepts positive cost line',
        command: {
          type: 'AddCostLine' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          costLine: new CostLine('VARIABLE', 'Material', new Money(100), undefined),
          actorId: 'user-1',
        },
        state: baseState,
        error: null,
      },
      {
        name: 'rejects simulation with negative cost line',
        command: {
          type: 'RunSimulation' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          costStructure: {
            ...baseState.costStructure!,
            costLines: [{ amount: -10, category: 'VARIABLE', label: 'Material' }],
          },
        },
        error: INVARIANT_CODES.COUT_CS_02,
      },
    ];

    it.each(cases)('$name', ({ command, state, error }) => {
      if (error) {
        expect(() => guardian.validate(command, state)).toThrow(GuardianError);
        expect(() => guardian.validate(command, state)).toThrow(
          expect.objectContaining({ code: error })
        );
      } else {
        expect(() => guardian.validate(command, state)).not.toThrow();
      }
    });
  });

  /**
   * COUT-CS-03 — Version not FROZEN
   */
  describe('COUT-CS-03 — version not frozen', () => {
    const cases = [
      {
        name: 'rejects adding cost line to FROZEN version',
        command: {
          type: 'AddCostLine' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          costLine: new CostLine('VARIABLE', 'Material', new Money(100), undefined),
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          costStructure: {
            ...baseState.costStructure!,
            status: 'FROZEN',
          },
        },
        error: INVARIANT_CODES.COUT_CS_03,
      },
      {
        name: 'rejects updating assumptions on FROZEN version',
        command: {
          type: 'UpdateAssumptions' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          assumptions: baseState.costStructure!.assumptions!,
          actorId: 'user-1',
        } as any,
        state: {
          ...baseState,
          costStructure: {
            ...baseState.costStructure!,
            status: 'FROZEN',
          },
        },
        error: INVARIANT_CODES.COUT_CS_03,
      },
    ];

    it.each(cases)('$name', ({ command, state, error }) => {
      if (error) {
        expect(() => guardian.validate(command, state)).toThrow(GuardianError);
        expect(() => guardian.validate(command, state)).toThrow(
          expect.objectContaining({ code: error })
        );
      } else {
        expect(() => guardian.validate(command, state)).not.toThrow();
      }
    });
  });

  /**
   * COUT-CS-04 — Complete assumptions and cost lines
   */
  describe('COUT-CS-04 — complete data', () => {
    const cases = [
      {
        name: 'rejects simulation without assumptions',
        command: {
          type: 'RunSimulation' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          costStructure: {
            ...baseState.costStructure!,
            assumptions: undefined,
          },
        },
        error: INVARIANT_CODES.COUT_CS_04,
      },
      {
        name: 'rejects simulation without cost lines',
        command: {
          type: 'RunSimulation' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          costStructure: {
            ...baseState.costStructure!,
            costLines: [],
          },
        },
        error: INVARIANT_CODES.COUT_CS_04,
      },
      {
        name: 'rejects freeze without simulation',
        command: {
          type: 'FreezeCostStructure' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          costStructure: {
            ...baseState.costStructure!,
            simulation: undefined,
          },
        },
        error: INVARIANT_CODES.COUT_CS_04,
      },
    ];

    it.each(cases)('$name', ({ command, state, error }) => {
      if (error) {
        expect(() => guardian.validate(command, state)).toThrow(GuardianError);
        expect(() => guardian.validate(command, state)).toThrow(
          expect.objectContaining({ code: error })
        );
      } else {
        expect(() => guardian.validate(command, state)).not.toThrow();
      }
    });
  });

  /**
   * COUT-01 — Robustness at 70% capacity
   */
  describe('COUT-01 — robustness at 70%', () => {
    const cases = [
      {
        name: 'rejects freeze when margin at 70% <= 0',
        command: {
          type: 'FreezeCostStructure' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          costStructure: {
            ...baseState.costStructure!,
            simulation: {
              unitCost: 80,
              totalCost: 8000,
              grossMargin: 60,
              netMargin: 20,
              marginAt70: -5,
            },
          },
        },
        error: INVARIANT_CODES.COUT_01,
      },
      {
        name: 'rejects freeze when margin at 70% = 0',
        command: {
          type: 'FreezeCostStructure' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          costStructure: {
            ...baseState.costStructure!,
            simulation: {
              unitCost: 80,
              totalCost: 8000,
              grossMargin: 60,
              netMargin: 20,
              marginAt70: 0,
            },
          },
        },
        error: INVARIANT_CODES.COUT_01,
      },
      {
        name: 'accepts freeze when margin at 70% > 0',
        command: {
          type: 'FreezeCostStructure' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 1,
          actorId: 'user-1',
        },
        state: baseState,
        error: null,
      },
    ];

    it.each(cases)('$name', ({ command, state, error }) => {
      if (error) {
        expect(() => guardian.validate(command, state)).toThrow(GuardianError);
        expect(() => guardian.validate(command, state)).toThrow(
          expect.objectContaining({ code: error })
        );
      } else {
        expect(() => guardian.validate(command, state)).not.toThrow();
      }
    });
  });

  /**
   * COUT-PROJ-02 — Project lifecycle
   */
  describe('COUT-PROJ-02 — project lifecycle', () => {
    const cases = [
      {
        name: 'rejects validation if project not simulated',
        command: {
          type: 'ValidateProject' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          project: {
            ...baseState.project!,
            status: 'DRAFT',
          },
        },
        error: INVARIANT_CODES.COUT_PROJ_02,
      },
      {
        name: 'rejects validation without frozen version',
        command: {
          type: 'ValidateProject' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          project: {
            ...baseState.project!,
            versions: [
              {
                version: 1,
                status: 'DRAFT',
                costLines: [],
              },
            ],
          },
        },
        error: INVARIANT_CODES.COUT_CS_01,
      },
      {
        name: 'rejects rejection of validated project',
        command: {
          type: 'RejectProject' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          reason: 'Test reason',
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          project: {
            ...baseState.project!,
            status: 'VALIDATED',
          },
        },
        error: INVARIANT_CODES.COUT_PROJ_02,
      },
      {
        name: 'rejects rejection without reason',
        command: {
          type: 'RejectProject' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          reason: '',
          actorId: 'user-1',
        },
        state: baseState,
        error: INVARIANT_CODES.COUT_PROJ_02,
      },
      {
        name: 'rejects new version on validated project',
        command: {
          type: 'CreateCostStructure' as const,
          tenantId: 'tenant-1',
          projectId: 'proj-1',
          version: 2,
          actorId: 'user-1',
        },
        state: {
          ...baseState,
          project: {
            ...baseState.project!,
            status: 'VALIDATED',
          },
        },
        error: INVARIANT_CODES.COUT_PROJ_02,
      },
    ];

    it.each(cases)('$name', ({ command, state, error }) => {
      if (error) {
        expect(() => guardian.validate(command, state)).toThrow(GuardianError);
        expect(() => guardian.validate(command, state)).toThrow(
          expect.objectContaining({ code: error })
        );
      } else {
        expect(() => guardian.validate(command, state)).not.toThrow();
      }
    });
  });
});
