import type { StrategicEventRM, EventFilters } from '../types.js';

/**
 * Projection des Événements Stratégiques - CQRS Read Side
 * Pure fonction de projection des événements vers les read-models
 */
export class EventsProjection {
  private readonly events: Map<string, StrategicEventRM> = new Map();

  /**
   * Applique un événement à la projection
   */
  apply(event: {
    type: string;
    payload: Partial<StrategicEventRM>;
    tenantId: string;
  }): void {
    switch (event.type) {
      case 'StrategicEventCreated':
        if (event.payload.eventId && event.payload.tenantId) {
          const strategicEvent: StrategicEventRM = {
            eventId: event.payload.eventId,
            tenantId: event.payload.tenantId,
            type: event.payload.type || '',
            label: event.payload.label || '',
            description: event.payload.description,
            occurredAt: event.payload.occurredAt || new Date().toISOString(),
            relatedObjectiveIds: event.payload.relatedObjectiveIds || [],
            relatedPeriodId: event.payload.relatedPeriodId,
            impact: (event.payload.impact as 'LOW' | 'MEDIUM' | 'HIGH') || 'MEDIUM',
            documentRef: event.payload.documentRef,
            metadata: event.payload.metadata,
            createdAt: event.payload.createdAt || new Date().toISOString(),
            version: 1
          };
          this.events.set(strategicEvent.eventId, strategicEvent);
        }
        break;
      
      case 'StrategicEventUpdated':
        if (event.payload.eventId) {
          const existing = this.events.get(event.payload.eventId);
          if (existing) {
            const updated: StrategicEventRM = {
              ...existing,
              ...event.payload,
              version: existing.version + 1
            };
            this.events.set(event.payload.eventId, updated);
          }
        }
        break;
    }
  }

  /**
   * Récupère tous les événements pour un tenant
   */
  getAll(tenantId: string): StrategicEventRM[] {
    return Array.from(this.events.values())
      .filter(e => e.tenantId === tenantId)
      .sort((a, b) => b.occurredAt.localeCompare(a.occurredAt)); // Plus récents d'abord
  }

  /**
   * Filtre les événements selon les critères
   */
  filter(filters: EventFilters): StrategicEventRM[] {
    let results = this.getAll(filters.tenantId);

    if (filters.type) {
      results = results.filter(e => e.type === filters.type);
    }

    if (filters.objectiveId) {
      results = results.filter(e => e.relatedObjectiveIds.includes(filters.objectiveId!));
    }

    if (filters.periodId) {
      results = results.filter(e => e.relatedPeriodId === filters.periodId);
    }

    if (filters.impact) {
      results = results.filter(e => e.impact === filters.impact);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(e => 
        e.label.toLowerCase().includes(searchTerm) ||
        (e.description && e.description.toLowerCase().includes(searchTerm))
      );
    }

    if (filters.dateFrom) {
      results = results.filter(e => e.occurredAt >= filters.dateFrom!);
    }

    if (filters.dateTo) {
      results = results.filter(e => e.occurredAt <= filters.dateTo!);
    }

    return results;
  }

  /**
   * Compte les événements selon les filtres
   */
  count(filters: EventFilters): number {
    return this.filter(filters).length;
  }

  /**
   * Vide la projection (pour les tests)
   */
  clear(): void {
    this.events.clear();
  }

  /**
   * Retourne l'état actuel de la projection
   */
  getState(): readonly StrategicEventRM[] {
    return Array.from(this.events.values());
  }
}
