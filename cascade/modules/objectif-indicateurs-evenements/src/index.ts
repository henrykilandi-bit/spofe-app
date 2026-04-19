/**
 * 🎯 MODULE OIE — Objectifs - Indicateurs - Événements
 * Module de gestion stratégique SPOFE v2.1
 */

// Types principaux
export type {
  ObjectiveRM,
  IndicatorRM,
  StrategicEventRM,
  ObjectiveFilters,
  IndicatorFilters,
  EventFilters,
  OIESummary,
  OIEProjection
} from './read-models/types.js';

// Ports repositories
export type {
  IObjectivesReadRepository,
  IIndicatorsReadRepository,
  IEventsReadRepository
} from './read-models/ports/index.js';

// Implémentations InMemory
export {
  InMemoryObjectivesReadRepository
} from './read-models/InMemoryObjectivesReadRepository';

export {
  InMemoryIndicatorsReadRepository
} from './read-models/InMemoryIndicatorsReadRepository';

export {
  InMemoryEventsReadRepository
} from './read-models/InMemoryEventsReadRepository';

// Projections
export {
  ObjectivesProjection,
  IndicatorsProjection,
  EventsProjection
} from './read-models/projections';

// Guardian
export {
  OieGuardian
} from './domain/guardian/OieGuardian';

export type {
  GuardianContext,
  GuardianValidation
} from './domain/guardian/types.js';
