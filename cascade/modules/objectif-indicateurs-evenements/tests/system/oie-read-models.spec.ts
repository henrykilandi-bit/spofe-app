import { describe, expect, it } from '@jest/globals';

import { EventsProjection } from '../../src/read-models/projections/EventsProjection';
import { IndicatorsProjection } from '../../src/read-models/projections/IndicatorsProjection';
import { ObjectivesProjection } from '../../src/read-models/projections/ObjectivesProjection';

describe('objectif-indicateurs-evenements read-models', () => {
  it('projects objectives and filters them by tenant and search', () => {
    const projection = new ObjectivesProjection();

    projection.apply({
      type: 'ObjectiveCreated',
      tenantId: 'TENANT-1',
      payload: {
        objectiveId: 'OBJ-1',
        tenantId: 'TENANT-1',
        label: 'Ameliorer la marge',
        type: 'FINANCIAL',
        periodId: '2026-Q1'
      }
    });

    projection.apply({
      type: 'ObjectiveCreated',
      tenantId: 'TENANT-2',
      payload: {
        objectiveId: 'OBJ-2',
        tenantId: 'TENANT-2',
        label: 'Objectif autre tenant',
        type: 'STRATEGIC',
        periodId: '2026-Q1'
      }
    });

    expect(projection.getAll('TENANT-1')).toHaveLength(1);
    expect(projection.filter({ tenantId: 'TENANT-1', search: 'marge' })).toHaveLength(1);
    expect(projection.count({ tenantId: 'TENANT-1', type: 'FINANCIAL' })).toBe(1);
  });

  it('updates an objective and increments its version', () => {
    const projection = new ObjectivesProjection();

    projection.apply({
      type: 'ObjectiveCreated',
      tenantId: 'TENANT-1',
      payload: {
        objectiveId: 'OBJ-1',
        tenantId: 'TENANT-1',
        label: 'Ameliorer la marge',
        type: 'FINANCIAL',
        periodId: '2026-Q1'
      }
    });

    projection.apply({
      type: 'ObjectiveUpdated',
      tenantId: 'TENANT-1',
      payload: {
        objectiveId: 'OBJ-1',
        label: 'Ameliorer la marge nette',
        priority: 'HIGH'
      }
    });

    const [updated] = projection.getAll('TENANT-1');
    expect(updated?.label).toBe('Ameliorer la marge nette');
    expect(updated?.priority).toBe('HIGH');
    expect(updated?.version).toBe(2);
  });

  it('projects indicators and filters them by source and objective', () => {
    const projection = new IndicatorsProjection();

    projection.apply({
      type: 'IndicatorCreated',
      tenantId: 'TENANT-1',
      payload: {
        indicatorId: 'IND-1',
        tenantId: 'TENANT-1',
        label: 'Taux de transformation',
        source: { module: 'crm', readModel: 'pipeline' },
        linkedObjectiveIds: ['OBJ-1']
      }
    });

    expect(projection.filter({ tenantId: 'TENANT-1', sourceModule: 'crm' })).toHaveLength(1);
    expect(projection.filter({ tenantId: 'TENANT-1', objectiveId: 'OBJ-1' })).toHaveLength(1);
  });

  it('updates an indicator and keeps tenant filtering intact', () => {
    const projection = new IndicatorsProjection();

    projection.apply({
      type: 'IndicatorCreated',
      tenantId: 'TENANT-1',
      payload: {
        indicatorId: 'IND-1',
        tenantId: 'TENANT-1',
        label: 'Taux de transformation',
        source: { module: 'crm', readModel: 'pipeline' },
        linkedObjectiveIds: ['OBJ-1']
      }
    });

    projection.apply({
      type: 'IndicatorUpdated',
      tenantId: 'TENANT-1',
      payload: {
        indicatorId: 'IND-1',
        frequency: 'WEEKLY',
        status: 'INACTIVE'
      }
    });

    const [updated] = projection.getAll('TENANT-1');
    expect(updated?.frequency).toBe('WEEKLY');
    expect(updated?.status).toBe('INACTIVE');
    expect(updated?.version).toBe(2);
  });

  it('orders events from newest to oldest and filters by date range', () => {
    const projection = new EventsProjection();

    projection.apply({
      type: 'StrategicEventCreated',
      tenantId: 'TENANT-1',
      payload: {
        eventId: 'EV-OLD',
        tenantId: 'TENANT-1',
        type: 'ALERT',
        label: 'Alerte ancienne',
        occurredAt: '2026-01-10T00:00:00.000Z'
      }
    });

    projection.apply({
      type: 'StrategicEventCreated',
      tenantId: 'TENANT-1',
      payload: {
        eventId: 'EV-NEW',
        tenantId: 'TENANT-1',
        type: 'ALERT',
        label: 'Alerte recente',
        occurredAt: '2026-02-10T00:00:00.000Z'
      }
    });

    const all = projection.getAll('TENANT-1');
    const filtered = projection.filter({
      tenantId: 'TENANT-1',
      dateFrom: '2026-02-01T00:00:00.000Z',
      dateTo: '2026-02-28T23:59:59.999Z'
    });

    expect(all[0]?.eventId).toBe('EV-NEW');
    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.eventId).toBe('EV-NEW');
  });

  it('updates a strategic event and supports impact filtering', () => {
    const projection = new EventsProjection();

    projection.apply({
      type: 'StrategicEventCreated',
      tenantId: 'TENANT-1',
      payload: {
        eventId: 'EV-1',
        tenantId: 'TENANT-1',
        type: 'ALERT',
        label: 'Alerte initiale',
        occurredAt: '2026-02-10T00:00:00.000Z',
        impact: 'LOW'
      }
    });

    projection.apply({
      type: 'StrategicEventUpdated',
      tenantId: 'TENANT-1',
      payload: {
        eventId: 'EV-1',
        impact: 'HIGH',
        label: 'Alerte critique'
      }
    });

    const filtered = projection.filter({
      tenantId: 'TENANT-1',
      impact: 'HIGH'
    });

    expect(filtered).toHaveLength(1);
    expect(filtered[0]?.label).toBe('Alerte critique');
    expect(filtered[0]?.version).toBe(2);
  });
});
