/**
 * OIE READ API - Interface contractuelle commune
 * 
 * Interface minimale exposée par le module OIE aux modules consommateurs.
 * Strictement READ-ONLY, conforme SPOFE.
 */

// === READ MODELS EXPOSÉS ===

export interface ObjectiveRM {
  readonly id: string;
  readonly tenantId: string;
  readonly title: string;
  readonly description: string;
  readonly periodId: string;
  readonly status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  readonly createdAt: Date;
  readonly updatedAt: Date;
}

export interface IndicatorRM {
  readonly id: string;
  readonly tenantId: string;
  readonly objectiveId: string;
  readonly name: string;
  readonly description: string;
  readonly referenceModule: string; // Module source (budget, vente, etc.)
  readonly referenceId: string;    // ID dans le module source
  readonly createdAt: Date;
}

export interface StrategicEventRM {
  readonly id: string;
  readonly tenantId: string;
  readonly objectiveId: string;
  readonly eventType: 'DECISION' | 'INCIDENT' | 'MILESTONE' | 'REVISION';
  readonly title: string;
  readonly description: string;
  readonly occurredAt: Date;
  readonly impact: 'HIGH' | 'MEDIUM' | 'LOW';
  readonly createdAt: Date;
}

export interface ObjectiveHistoryRM {
  readonly id: string;
  readonly tenantId: string;
  readonly objectiveId: string;
  readonly changeType: 'CREATED' | 'UPDATED' | 'STATUS_CHANGED' | 'CANCELLED';
  readonly previousValue?: string;
  readonly newValue: string;
  readonly reason?: string;
  readonly changedAt: Date;
  readonly changedBy: string;
}

// === INTERFACE READ API ===

/**
 * Interface contractuelle OIE READ-ONLY
 * 
 * Implémentée par le module OIE.
 * Consommée par : Coaching, Budget, Investisseurs
 */
export interface OieReadApi {
  // === OBJECTIFS ===
  getObjectives(tenantId: string): Promise<ObjectiveRM[]>;
  getObjectiveById(tenantId: string, objectiveId: string): Promise<ObjectiveRM | null>;
  getObjectivesByPeriod(tenantId: string, periodId: string): Promise<ObjectiveRM[]>;
  
  // === INDICATEURS ===
  getIndicators(tenantId: string): Promise<IndicatorRM[]>;
  getIndicatorById(tenantId: string, indicatorId: string): Promise<IndicatorRM | null>;
  getIndicatorsByObjective(tenantId: string, objectiveId: string): Promise<IndicatorRM[]>;
  
  // === ÉVÉNEMENTS ===
  getEvents(tenantId: string): Promise<StrategicEventRM[]>;
  getEventsByObjective(tenantId: string, objectiveId: string): Promise<StrategicEventRM[]>;
  getEventsByPeriod(tenantId: string, periodId: string): Promise<StrategicEventRM[]>;
  
  // === HISTORIQUE ===
  getObjectiveHistory(tenantId: string, objectiveId: string): Promise<ObjectiveHistoryRM[]>;
}

// === RÈGLES CONTRACTUELLES ===

/**
 * Règles d'usage OBLIGATOIRES pour tous les modules consommateurs :
 * 
 * 1. ✅ LECTURE UNIQUEMENT - Aucune écriture dans OIE
 * 2. ✅ MULTI-TENANT - tenantId obligatoire sur tous les appels
 * 3. ✅ AUCUN CALCUL - Pas de transformation des données OIE
 * 4. ✅ AUCUN EFFET DE BORD - Pas de déclenchement d'événements OIE
 * 5. ✅ RÉFÉRENCES SEULES - Pas de duplication des données OIE
 */

/**
 * Modules autorisés à consommer cette interface :
 * - Module Coaching (interprétation stratégique)
 * - Module Budget (contextualisation)
 * - Module Investisseurs (gouvernance)
 */

/**
 * Évolutions contractuelles :
 * - Toute modification nécessite une nouvelle version
 * - Backward compatibility obligatoire
 * - Validation BUILD_PROOF requise
 */