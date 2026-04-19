"use strict";
// SPOFE Module: Gestion-Tiers v1.0.0
// Guardian: FROZEN ❄️
// Skeleton: Ready for implementation
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.MODULE_INFO = void 0;
// Domain exports
__exportStar(require("./domain/model/Tier"), exports);
__exportStar(require("./domain/events/TierEvents"), exports);
// Guardian exports (FROZEN)
__exportStar(require("./domain/guardian/GuardianContext"), exports);
__exportStar(require("./domain/guardian/GuardianError"), exports);
__exportStar(require("./domain/guardian/TierGuardian"), exports);
// Application exports
__exportStar(require("./application/commands/CreateTier"), exports);
__exportStar(require("./application/commands/UpdateTier"), exports);
__exportStar(require("./application/commands/SuspendTier"), exports);
__exportStar(require("./application/commands/ArchiveTier"), exports);
// Infrastructure interfaces
__exportStar(require("./infrastructure/persistence/TierRepository"), exports);
__exportStar(require("./infrastructure/event-store/TierEventStore"), exports);
// Module metadata
exports.MODULE_INFO = {
    name: '@spofe/gestion-tiers',
    version: '1.0.0',
    guardian: {
        status: 'FROZEN',
        buildProof: '644B1C521E645AEE71C135DD7FA04449CC65DBE118924984CEE8E626D8244EFE',
        invariants: 10,
        tests: 46
    },
    implementation: {
        status: 'SKELETON',
        handlers: 'TODO_v1.1',
        persistence: 'TODO_v1.1',
        api: 'TODO_v1.1'
    }
};
