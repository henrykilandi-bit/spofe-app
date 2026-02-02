/**
 * 📦 Application Commands - Export canonique
 *
 * Les Commands sont les cas d'usage orchestrés par l'application.
 * Ils utilisent le Domain (Value Objects, Events, Facts)
 * et collaborent avec TransactionManager pour persistance.
 */

export { CreateAggregateCommand } from './CreateAggregateCommand';
export type { CreateAggregateInput } from './CreateAggregateCommand';

export { UpdateAggregateCommand } from './UpdateAggregateCommand';
export type { UpdateAggregateInput } from './UpdateAggregateCommand';
