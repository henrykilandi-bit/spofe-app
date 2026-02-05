/**
 * Immobilisation Module - Domain Events SPOFE v2.1
 * Conformité: DomainEvent standard canonique
 * Principe: Événements métier avec metadata complètes
 */
import { v4 as uuid } from 'uuid';
export function createDomainEvent(params) {
    return {
        eventId: uuid(),
        eventType: params.eventType,
        aggregateId: params.aggregateId,
        occurredAt: new Date(),
        metadata: {
            tenantId: params.tenantId,
            actorId: params.actorId,
            correlationId: params.correlationId,
            causationId: params.causationId,
            version: 1,
        },
        payload: params.payload,
    };
}
// ═══════════════════════════════════════════════════════════════════════════
// FACTORIES CANONIQUES
// ═══════════════════════════════════════════════════════════════════════════
export const createAssetCreatedEvent = (params) => createDomainEvent({
    eventType: 'IMMOBILISATION_ASSET_CREATED',
    aggregateId: params.assetId,
    tenantId: params.tenantId,
    actorId: params.actorId,
    payload: params.payload,
});
export const createDepreciationRecordedEvent = (params) => createDomainEvent({
    eventType: 'IMMOBILISATION_DEPRECIATION_RECORDED',
    aggregateId: params.assetId,
    tenantId: params.tenantId,
    actorId: params.actorId,
    payload: params.payload,
});
export const createAssetDisposedEvent = (params) => createDomainEvent({
    eventType: 'IMMOBILISATION_ASSET_DISPOSED',
    aggregateId: params.assetId,
    tenantId: params.tenantId,
    actorId: params.actorId,
    payload: params.payload,
});
//# sourceMappingURL=events.js.map