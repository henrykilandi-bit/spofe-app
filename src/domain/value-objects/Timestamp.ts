/**
 * Timestamp Value Object
 */

export interface Timestamp {
  readonly value: Date;
  readonly iso: string;
}

export const createTimestamp = (date?: Date): Timestamp => {
  const d = date || new Date();
  return {
    value: d,
    iso: d.toISOString()
  };
};

// Factory methods pour compatibilité
export const Timestamp = {
  fromISO: (isoString: string): Timestamp => createTimestamp(new Date(isoString))
};