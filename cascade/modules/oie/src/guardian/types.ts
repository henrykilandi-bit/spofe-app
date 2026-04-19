// Types OIE - Objectifs, Indicateurs, Événements

export interface GuardianContext {
  tenantId: string;
  actorId: string;
  timestamp: Date;
}

// Commandes OIE
export interface OIECommand {
  type: 'CREATE_OBJECTIVE' | 'CREATE_INDICATOR' | 'CREATE_EVENT' | 'UPDATE_INDICATOR' | 'UPDATE_EVENT';
  tenantId: string;
  data: any;
  timestamp: Date;
}

// Objectifs
export interface Objective {
  objectiveId: string;
  tenantId: string;
  title: string;
  description?: string;
  parentId?: string;
  indicators: string[];
  status: 'ACTIVE' | 'SUSPENDED' | 'ARCHIVED';
  createdAt: Date;
  createdBy: string;
}

// Indicateurs
export interface Indicator {
  indicatorId: string;
  tenantId: string;
  objectiveId: string;
  name: string;
  description?: string;
  unit: string;
  targetType: 'NUMBER' | 'PERCENTAGE' | 'CURRENCY';
  currentValue?: number | null;
  targetValue?: number;
  status: 'ACTIVE' | 'INACTIVE';
  createdAt: Date;
  createdBy: string;
}

// Événements
export interface Event {
  eventId: string;
  tenantId: string;
  objectiveId?: string;
  indicatorId?: string;
  eventType: 'CREATED' | 'UPDATED' | 'MILESTONE' | 'ALERT';
  title: string;
  description?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  createdBy: string;
}

// Erreurs Guardian
export class GuardianError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardianError';
  }
}
