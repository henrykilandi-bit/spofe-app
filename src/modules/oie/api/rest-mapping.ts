/**
 * Module OIE - Configuration REST Mapping
 * 
 * Mapping indicatif des contrôleurs vers les endpoints REST
 * Le routage HTTP réel reste hors du module (framework-agnostic)
 */

export interface RestEndpoint {
  method: 'GET';
  path: string;
  controller: string;
  action: string;
  description: string;
}

export const OIE_REST_MAPPING: RestEndpoint[] = [
  // === OBJECTIFS ===
  {
    method: 'GET',
    path: '/objectives',
    controller: 'ObjectivesReadController',
    action: 'getAll',
    description: 'Liste tous les objectifs du tenant'
  },
  {
    method: 'GET', 
    path: '/objectives/{objectiveId}',
    controller: 'ObjectivesReadController',
    action: 'getById',
    description: 'Récupère un objectif par son ID'
  },
  {
    method: 'GET',
    path: '/objectives?periodId={periodId}',
    controller: 'ObjectivesReadController', 
    action: 'getByPeriod',
    description: 'Objectifs filtrés par période'
  },

  // === INDICATEURS ===
  {
    method: 'GET',
    path: '/indicators',
    controller: 'IndicatorsReadController',
    action: 'getAll', 
    description: 'Liste tous les indicateurs du tenant'
  },
  {
    method: 'GET',
    path: '/indicators/{indicatorId}',
    controller: 'IndicatorsReadController',
    action: 'getById',
    description: 'Récupère un indicateur par son ID'
  },
  {
    method: 'GET',
    path: '/indicators?objectiveId={objectiveId}',
    controller: 'IndicatorsReadController',
    action: 'getByObjective',
    description: 'Indicateurs filtrés par objectif'
  },

  // === ÉVÉNEMENTS ===
  {
    method: 'GET',
    path: '/events',
    controller: 'EventsReadController',
    action: 'getAll',
    description: 'Liste tous les événements du tenant'
  },
  {
    method: 'GET', 
    path: '/events?objectiveId={objectiveId}',
    controller: 'EventsReadController',
    action: 'getByObjective',
    description: 'Événements filtrés par objectif'
  },
  {
    method: 'GET',
    path: '/events?periodId={periodId}',
    controller: 'EventsReadController',
    action: 'getByPeriod', 
    description: 'Événements filtrés par période'
  }
];

/**
 * Headers requis pour tous les endpoints
 */
export const REQUIRED_HEADERS = {
  'X-Tenant-Id': {
    required: true,
    description: 'Identifiant unique du tenant',
    example: 'tenant-123'
  },
  'Accept': {
    required: false,
    description: 'Format de réponse souhaité',
    example: 'application/json'
  }
};

/**
 * Codes de réponse standardisés
 */
export const HTTP_RESPONSES = {
  200: 'Succès - Données retournées',
  400: 'Erreur de requête - Paramètres manquants ou invalides',
  404: 'Ressource non trouvée',
  500: 'Erreur serveur - Problème d\'infrastructure'
};