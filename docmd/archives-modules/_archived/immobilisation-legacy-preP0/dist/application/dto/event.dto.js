/**
 * Immobilisation Module - Event DTOs (Contractuels)
 * Conformité: COMMANDS_EVENTS.md v1.0.0
 *
 * Ces DTOs sont les interfaces contractuelles pour les events.
 * Ils utilisent des strings ISO 8601 pour les dates (sérialisation JSON).
 */
// ═══════════════════════════════════════════════════════════════════════════
// EVENT TYPE GUARDS
// ═══════════════════════════════════════════════════════════════════════════
export function isAssetCreatedEvent(event) {
    return event.type === 'AssetCreated';
}
export function isRenewalInfoUpdatedEvent(event) {
    return event.type === 'RenewalInfoUpdated';
}
export function isAssetDisposedEvent(event) {
    return event.type === 'AssetDisposed';
}
export function isAssetDecommissionedEvent(event) {
    return event.type === 'AssetDecommissioned';
}
export function isAssetAllocatedEvent(event) {
    return event.type === 'AssetAllocated';
}
export function isAllocationEndedEvent(event) {
    return event.type === 'AllocationEnded';
}
export function isDepreciationRecordedEvent(event) {
    return event.type === 'DepreciationRecorded';
}
export function isMaintenanceRecordedEvent(event) {
    return event.type === 'MaintenanceRecorded';
}
//# sourceMappingURL=event.dto.js.map