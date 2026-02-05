/**
 * Immobilisation Module - Commands
 * Conformité: CONTRACT.md v1.0.0
 * Principe: Commands pour Guardian Immobilisation
 */
// ═══════════════════════════════════════════════════════════════════════════
// COMMAND FACTORY
// ═══════════════════════════════════════════════════════════════════════════
export function createCommandId() {
    return `cmd-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}
export function createBaseCommand(tenantId, actorId) {
    return {
        commandId: createCommandId(),
        tenantId,
        actorId,
        timestamp: new Date(),
    };
}
//# sourceMappingURL=commands.js.map