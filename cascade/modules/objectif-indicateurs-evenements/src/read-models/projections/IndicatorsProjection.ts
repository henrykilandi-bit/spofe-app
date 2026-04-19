import type { IndicatorRM, IndicatorFilters } from '../types.js';

/**
 * Projection des Indicateurs - CQRS Read Side
 * Pure fonction de projection des événements vers les read-models
 */
export class IndicatorsProjection {
  private readonly indicators: Map<string, IndicatorRM> = new Map();

  /**
   * Applique un événement à la projection
   */
  apply(event: {
    type: string;
    payload: Partial<IndicatorRM>;
    tenantId: string;
  }): void {
    switch (event.type) {
      case 'IndicatorCreated':
        if (event.payload.indicatorId && event.payload.tenantId) {
          const indicator: IndicatorRM = {
            indicatorId: event.payload.indicatorId,
            tenantId: event.payload.tenantId,
            label: event.payload.label || '',
            description: event.payload.description,
            source: event.payload.source || { module: '', readModel: '' },
            frequency: (event.payload.frequency as 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY') || 'MONTHLY',
            linkedObjectiveIds: event.payload.linkedObjectiveIds || [],
            status: (event.payload.status as 'ACTIVE' | 'INACTIVE') || 'ACTIVE',
            currentValue: event.payload.currentValue,
            targetValue: event.payload.targetValue,
            unit: event.payload.unit,
            createdAt: event.payload.createdAt || new Date().toISOString(),
            updatedAt: event.payload.updatedAt || new Date().toISOString(),
            version: 1
          };
          this.indicators.set(indicator.indicatorId, indicator);
        }
        break;
      
      case 'IndicatorUpdated':
        if (event.payload.indicatorId) {
          const existing = this.indicators.get(event.payload.indicatorId);
          if (existing) {
            const updated: IndicatorRM = {
              ...existing,
              ...event.payload,
              updatedAt: new Date().toISOString(),
              version: existing.version + 1
            };
            this.indicators.set(event.payload.indicatorId, updated);
          }
        }
        break;
    }
  }

  /**
   * Récupère tous les indicateurs pour un tenant
   */
  getAll(tenantId: string): IndicatorRM[] {
    return Array.from(this.indicators.values())
      .filter(i => i.tenantId === tenantId);
  }

  /**
   * Filtre les indicateurs selon les critères
   */
  filter(filters: IndicatorFilters): IndicatorRM[] {
    let results = this.getAll(filters.tenantId);

    if (filters.status) {
      results = results.filter(i => i.status === filters.status);
    }

    if (filters.sourceModule) {
      results = results.filter(i => i.source.module === filters.sourceModule);
    }

    if (filters.objectiveId) {
      results = results.filter(i => i.linkedObjectiveIds.includes(filters.objectiveId!));
    }

    if (filters.frequency) {
      results = results.filter(i => i.frequency === filters.frequency);
    }

    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      results = results.filter(i => 
        i.label.toLowerCase().includes(searchTerm) ||
        (i.description && i.description.toLowerCase().includes(searchTerm))
      );
    }

    return results;
  }

  /**
   * Compte les indicateurs selon les filtres
   */
  count(filters: IndicatorFilters): number {
    return this.filter(filters).length;
  }

  /**
   * Vide la projection (pour les tests)
   */
  clear(): void {
    this.indicators.clear();
  }

  /**
   * Retourne l'état actuel de la projection
   */
  getState(): readonly IndicatorRM[] {
    return Array.from(this.indicators.values());
  }
}
