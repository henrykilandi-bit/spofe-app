"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const vitest_1 = require("vitest");
const G09_ActorRequired_1 = require("../../src/domain/guardian/invariants/G09_ActorRequired");
const helpers_1 = require("./helpers");
(0, vitest_1.describe)('G09_ActorRequired', () => {
    const invariant = new G09_ActorRequired_1.G09_ActorRequired();
    (0, vitest_1.it)('PASS when actorId exists', () => {
        (0, vitest_1.expect)(() => invariant.validate((0, helpers_1.baseContext)())).not.toThrow();
    });
    (0, vitest_1.it)('FAIL when actorId missing', () => {
        const ctx = (0, helpers_1.baseContext)({ actorId: undefined });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G09_ACTOR_REQUIRED' }));
    });
    (0, vitest_1.it)('PASS when actorId is provided', () => {
        const ctx = (0, helpers_1.baseContext)({ actorId: 'user-123' });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).not.toThrow();
    });
    (0, vitest_1.it)('FAIL when actorId is empty string', () => {
        const ctx = (0, helpers_1.baseContext)({ actorId: '' });
        (0, vitest_1.expect)(() => invariant.validate(ctx)).toThrow(vitest_1.expect.objectContaining({ code: 'G09_ACTOR_REQUIRED' }));
    });
});
//# sourceMappingURL=G09_ActorRequired.spec.js.map