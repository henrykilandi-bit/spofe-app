export { ObjectivesReadController } from './ObjectivesReadController';
export { IndicatorsReadController } from './IndicatorsReadController';
export { EventsReadController } from './EventsReadController';

export * from './types';
export * from './rest-mapping';

// Module metadata
export const OIE_MODULE = {
  name: 'oie',
  version: '1.0.0',
  description: 'Objectif-Indicateur-Événement READ-ONLY API',
  governance: 'SPOFE P0 - Constitutionnel',
  compliance: {
    cqrsStrict: true,
    multiTenant: true,
    readOnly: true,
    frameworkAgnostic: true
  }
} as const;