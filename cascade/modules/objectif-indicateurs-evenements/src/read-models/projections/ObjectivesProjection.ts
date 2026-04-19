import type { ObjectiveRM, ObjectiveFilters } from '../types.js';

/**
 * Projection des Objectifs - CQRS Read Side
 * Pure fonction de projection des événements vers les read-models
 */
export class ObjectivesProjection {
  private readonly objectives: Map<string, ObjectiveRM> = new Map();

  /**
   * Applique un événement à la projection
   */
  apply(event: {
    type: string;
    payload: Partial<ObjectiveRM>;
    tenantId: string;
  }): void {
    switch (event.type) {
      case 'ObjectiveCreated':
        if (event.payload.objectiveId && event.payload.tenantId) {
          const objective: ObjectiveRM = {
            objectiveId: event.payload.objectiveId,
            tenantId: event.payload.tenantId,
            label: event.payload.label || '',
            description: event.payload.description,
            type: event.payload.type || 'STRATEGIC',
            periodId: event.payload.periodId || '',
            unitId: event.payload.unitId || '',
            status: (event.payload.status as 'ACTIVE' | 'CLOSED') || 'ACTIVE',
            priority: (event.payload.priority as 'LOW' | 'MEDIUM' | 'HIGH') || 'MEDIUM',
            targetValue: event.payload.targetValue,
            currentValue: event.payload.currentValue,
            unit: event.payload.unit,
            createdAt: event.payload.createdAt || new Date().toISOString(),
            updatedAt: event.payload.updatedAt || new Date().toISOString(),
            version: 1
          };
          this.objectives.set(objective.objectiveId, objective);
        }
        break;
      
      case 'ObjectiveUpdated':
        if (event.payload.objectiveId) {
          const existing = this.objectives.get(event.payload.objectiveId);
          if (existing) {
            const updated: ObjectiveRM = {
              ...existing,
              ...event.payload,
              updatedAt: new Date().toISOString(),
              version: existing.version + 1
            };
            this.objectives.set(event.payload.objectiveId, updated);
          }
        }
        break;
    }
  }

  /**
   * Récupère tous les objectifs pour un tenant
   */
  getAll(tenantId: string): ObjectiveRM[] {
    return Array.from(this.objectives.values())
      .filter(o => o.tenantId === tenantId);
  }

  /**
   * Filtre les objectifs selon les critères
   */
  filter(filters: ObjectiveFilters): ObjectiveRM[] {
    let results = this.getAll(filters.tenantId);

    if (filters.status) {
      results = results.filter(o => o.status === filters.status);
    }

    if (filters.periodId) {
      results = results.filter(o => o.periodId === filters.periodId);
    }

    if (filters.type) {
      results = results.filter(o => o.type === filters.type);
    }

    if (filters.priority) {
      results = results.filter(o => o.priority === filters.priority);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(o => 
        o.label.toLowerCase().includes(searchTerm) ||
        (o.description && o.description.toLowerCase().includes(searchTerm))
      );
    }

    return results;
  }

  /**
   * Compte les objectifs selon les filtres
   */
  count(filters: ObjectiveFilters): number {
    return this.filter(filters).length;
  }

  /**
   * Vide la projection (pour les tests)
   */
  clear(): void {
    this.objectives.clear();
  }

  /**
   * Retourne l'état actuel de la projection
   */
  getState(): readonly ObjectiveRM[] {
    return Array.from(this.objectives.values());
  }
}
