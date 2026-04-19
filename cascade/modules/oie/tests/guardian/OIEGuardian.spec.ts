import { describe, it, expect } from '@jest/globals';
import { OIEGuardian } from '../../src/guardian/OIEGuardian';
import { GuardianError } from '../../src/guardian/GuardianError';
import { GuardianContext, OIECommand } from '../../src/guardian/types';

describe('OIE Guardian — Tests P0', () => {
  let guardian: OIEGuardian;
  let ctx: GuardianContext;

  beforeEach(() => {
    guardian = new OIEGuardian();
    ctx = {
      tenantId: 'tenant-001',
      actorId: 'actor-001',
      timestamp: new Date()
    };
  });

  describe('G01 — Objectif doit avoir au moins un indicateur', () => {
    it('accepte un objectif avec indicateurs', () => {
      const cmd: OIECommand = {
        type: 'CREATE_OBJECTIVE',
        tenantId: 'tenant-001',
        data: {
          objectiveId: 'obj-001',
          title: 'Test Objective',
          indicators: ['ind-001', 'ind-002']
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).not.toThrow();
    });

    it('rejette un objectif sans indicateur', () => {
      const cmd: OIECommand = {
        type: 'CREATE_OBJECTIVE',
        tenantId: 'tenant-001',
        data: {
          objectiveId: 'obj-001',
          title: 'Test Objective',
          indicators: []
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).toThrow(GuardianError);
      expect(() => guardian.validate(ctx, cmd)).toThrow('G01');
    });
  });

  describe('G02 — Indicateur doit avoir une unité de mesure', () => {
    it('accepte un indicateur avec unité définie', () => {
      const cmd: OIECommand = {
        type: 'CREATE_INDICATOR',
        tenantId: 'tenant-001',
        data: {
          indicatorId: 'ind-001',
          name: 'Test Indicator',
          unit: '%'
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).not.toThrow();
    });

    it('rejette un indicateur sans unité', () => {
      const cmd: OIECommand = {
        type: 'CREATE_INDICATOR',
        tenantId: 'tenant-001',
        data: {
          indicatorId: 'ind-001',
          name: 'Test Indicator'
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).toThrow(GuardianError);
      expect(() => guardian.validate(ctx, cmd)).toThrow('G02');
    });
  });

  describe('G03 — Événements horodatés de manière monotone', () => {
    it('accepte un événement avec timestamp dans le passé', () => {
      const cmd: OIECommand = {
        type: 'CREATE_EVENT',
        tenantId: 'tenant-001',
        data: {
          eventId: 'evt-001',
          title: 'Test Event',
          timestamp: new Date(Date.now() - 1000)
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).not.toThrow();
    });

    it('rejette un événement avec timestamp dans le futur', () => {
      const cmd: OIECommand = {
        type: 'CREATE_EVENT',
        tenantId: 'tenant-001',
        data: {
          eventId: 'evt-001',
          title: 'Test Event',
          timestamp: new Date(Date.now() + 1000000)
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).toThrow(GuardianError);
      expect(() => guardian.validate(ctx, cmd)).toThrow('G03');
    });
  });

  describe('G04 — Pas de cycle dans les objectifs', () => {
    it('accepte un objectif avec parent différent', () => {
      const cmd: OIECommand = {
        type: 'CREATE_OBJECTIVE',
        tenantId: 'tenant-001',
        data: {
          objectiveId: 'obj-001',
          title: 'Test Objective',
          parentId: 'parent-001',
          indicators: ['ind-001']
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).not.toThrow();
    });

    it('rejette un objectif qui est son propre parent', () => {
      const cmd: OIECommand = {
        type: 'CREATE_OBJECTIVE',
        tenantId: 'tenant-001',
        data: {
          objectiveId: 'obj-001',
          title: 'Test Objective',
          parentId: 'obj-001',
          indicators: ['ind-001']
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).toThrow(GuardianError);
      expect(() => guardian.validate(ctx, cmd)).toThrow('G04');
    });
  });

  describe('G05 — Valeurs numériques ou nulles', () => {
    it('accepte une valeur numérique', () => {
      const cmd: OIECommand = {
        type: 'UPDATE_INDICATOR',
        tenantId: 'tenant-001',
        data: {
          indicatorId: 'ind-001',
          value: 75.5
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).not.toThrow();
    });

    it('accepte une valeur nulle', () => {
      const cmd: OIECommand = {
        type: 'UPDATE_INDICATOR',
        tenantId: 'tenant-001',
        data: {
          indicatorId: 'ind-001',
          value: null
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).not.toThrow();
    });

    it('rejette une valeur non numérique', () => {
      const cmd: OIECommand = {
        type: 'UPDATE_INDICATOR',
        tenantId: 'tenant-001',
        data: {
          indicatorId: 'ind-001',
          value: 'invalid'
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).toThrow(GuardianError);
      expect(() => guardian.validate(ctx, cmd)).toThrow('G05');
    });
  });

  describe('G06 — Appartenance à un tenant', () => {
    it('accepte une commande avec tenantId', () => {
      const cmd: OIECommand = {
        type: 'CREATE_OBJECTIVE',
        tenantId: 'tenant-001',
        data: {
          objectiveId: 'obj-001',
          title: 'Test Objective',
          indicators: ['ind-001']
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).not.toThrow();
    });

    it('rejette une commande sans tenantId', () => {
      const cmd: OIECommand = {
        type: 'CREATE_OBJECTIVE',
        tenantId: '',
        data: {
          objectiveId: 'obj-001',
          title: 'Test Objective',
          indicators: ['ind-001']
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).toThrow(GuardianError);
      expect(() => guardian.validate(ctx, cmd)).toThrow('G06');
    });
  });

  describe('G07 — Permissions multi-tenant', () => {
    it('accepte une commande avec même tenant', () => {
      const cmd: OIECommand = {
        type: 'CREATE_OBJECTIVE',
        tenantId: 'tenant-001',
        data: {
          objectiveId: 'obj-001',
          title: 'Test Objective',
          indicators: ['ind-001']
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).not.toThrow();
    });

    it('rejette une commande cross-tenant', () => {
      const cmd: OIECommand = {
        type: 'CREATE_OBJECTIVE',
        tenantId: 'tenant-002',
        data: {
          objectiveId: 'obj-001',
          title: 'Test Objective',
          indicators: ['ind-001']
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).toThrow(GuardianError);
      expect(() => guardian.validate(ctx, cmd)).toThrow('G07');
    });
  });

  describe('G09 — Immutabilité des événements', () => {
    it('rejette la modification d\'un événement', () => {
      const cmd: OIECommand = {
        type: 'UPDATE_EVENT',
        tenantId: 'tenant-001',
        data: {
          eventId: 'evt-001',
          title: 'Updated Event'
        },
        timestamp: new Date()
      };

      expect(() => guardian.validate(ctx, cmd)).toThrow(GuardianError);
      expect(() => guardian.validate(ctx, cmd)).toThrow('G09');
    });
  });
});
