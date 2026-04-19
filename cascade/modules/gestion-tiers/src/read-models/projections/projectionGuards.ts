import { TierEvent } from '../../domain/events/TierEvents';

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isValidIsoDate(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

export function isProjectionEligibleEvent(event: TierEvent): boolean {
  return (
    isNonEmptyString(event.tenantId) &&
    isNonEmptyString(event.tierId) &&
    isNonEmptyString(event.actorId) &&
    isValidIsoDate(event.timestamp)
  );
}
