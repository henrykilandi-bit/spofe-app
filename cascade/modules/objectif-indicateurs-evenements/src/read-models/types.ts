/**
 * 📊 MODULE OIE — READ-MODEL TYPES (v1.0.0)
 * Types pour les read-models CQRS - Objectifs, Indicateurs, Événements
 */

/**
 * Read Model pour les Objectifs
 */
export interface ObjectiveRM {
  readonly objectiveId: string;
  readonly tenantId: string;
  readonly label: string;
  readonly description?: string;
  readonly type: string;
  readonly periodId: string;
  readonly unitId: string;
  readonly status: 'ACTIVE' | 'CLOSED';
  readonly priority: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly targetValue?: number;
  readonly currentValue?: number;
  readonly unit?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

/**
 * Read Model pour les Indicateurs
 */
export interface IndicatorRM {
  readonly indicatorId: string;
  readonly tenantId: string;
  readonly label: string;
  readonly description?: string;
  readonly source: {
    readonly module: string;
    readonly readModel: string;
  };
  readonly frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
  readonly linkedObjectiveIds: readonly string[];
  readonly status: 'ACTIVE' | 'INACTIVE';
  readonly currentValue?: number;
  readonly targetValue?: number;
  readonly unit?: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly version: number;
}

/**
 * Read Model pour les Événements Stratégiques
 */
export interface StrategicEventRM {
  readonly eventId: string;
  readonly tenantId: string;
  readonly type: string;
  readonly label: string;
  readonly description?: string;
  readonly occurredAt: string;
  readonly relatedObjectiveIds: readonly string[];
  readonly relatedPeriodId?: string;
  readonly impact: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly documentRef?: string;
  readonly metadata?: Record<string, unknown>;
  readonly createdAt: string;
  readonly version: number;
}

/**
 * Filtres pour les Objectifs
 */
export interface ObjectiveFilters {
  readonly tenantId: string;
  readonly status?: 'ACTIVE' | 'CLOSED';
  readonly periodId?: string;
  readonly type?: string;
  readonly priority?: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly search?: string;
}

/**
 * Filtres pour les Indicateurs
 */
export interface IndicatorFilters {
  readonly tenantId: string;
  readonly status?: 'ACTIVE' | 'INACTIVE';
  readonly sourceModule?: string;
  readonly objectiveId?: string;
  readonly frequency?: string;
  readonly search?: string;
}

/**
 * Filtres pour les Événements
 */
export interface EventFilters {
  readonly tenantId: string;
  readonly type?: string;
  readonly objectiveId?: string;
  readonly periodId?: string;
  readonly impact?: 'LOW' | 'MEDIUM' | 'HIGH';
  readonly search?: string;
  readonly dateFrom?: string;
  readonly dateTo?: string;
}

/**
 * Résumé OIE
 */
export interface OIESummary {
  readonly tenantId: string;
  readonly totalObjectives: number;
  readonly activeObjectives: number;
  readonly totalIndicators: number;
  readonly activeIndicators: number;
  readonly totalEvents: number;
  readonly recentEvents: number;
  readonly objectivesByType: Record<string, number>;
  readonly indicatorsByModule: Record<string, number>;
  readonly eventsByType: Record<string, number>;
}

/**
 * État de projection OIE
 */
export interface OIEProjection {
  readonly tenantId: string;
  readonly objectives: readonly ObjectiveRM[];
  readonly indicators: readonly IndicatorRM[];
  readonly events: readonly StrategicEventRM[];
  readonly lastUpdated: string;
  readonly version: number;
}
