/**
 * AggregateId Value Object
 */

export interface AggregateId {
  readonly value: string;
}

export const createAggregateId = (value: string): AggregateId => ({
  value
});

// Factory methods pour compatibilité
export const AggregateId = {
  create: (value: string): AggregateId => createAggregateId(value)
};