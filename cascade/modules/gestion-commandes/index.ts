/**
 * SPOFE Module: Gestion-Commandes v1.0.0
 * Entry point for the first executable order-creation slice
 */

export { GestionCommandesDomain } from './domain';
export type {
  CancelGestionCommandeInput,
  CreateGestionCommandeInput,
  GestionCommande,
  OrderCancelledEvent,
  OrderCreatedEvent
} from './domain';
export { GestionCommandesWrite } from './write';
export { GestionCommandesGuardian, GuardianError } from './guardian';
export {
  applyOrderEvent,
  InMemoryOrderStatusReadRepository
} from './read-models';
export type { OrderStatusReadModel } from './read-models';

export const MODULE_INFO = {
  name: 'gestion-commandes',
  version: '1.0.0',
  type: 'reserved-write-module',
  governance: 'SPOFE P0',
  status: 'FIRST_SLICE_ACTIVE',
  implementation: 'order-create-cancel'
} as const;
