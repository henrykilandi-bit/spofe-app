"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TierGuardian = void 0;
const G01_UniqueTier_1 = require("./invariants/G01_UniqueTier");
const G02_LegalIdentity_1 = require("./invariants/G02_LegalIdentity");
const G03_ValidRoles_1 = require("./invariants/G03_ValidRoles");
const G04_DocumentDriven_1 = require("./invariants/G04_DocumentDriven");
const G05_DocumentState_1 = require("./invariants/G05_DocumentState");
const G06_TierStatus_1 = require("./invariants/G06_TierStatus");
const G07_AppendOnly_1 = require("./invariants/G07_AppendOnly");
const G08_TenantIsolation_1 = require("./invariants/G08_TenantIsolation");
const G09_ActorRequired_1 = require("./invariants/G09_ActorRequired");
const G10_NoFinancialLogic_1 = require("./invariants/G10_NoFinancialLogic");
class TierGuardian {
    constructor() {
        this.invariants = [
            new G01_UniqueTier_1.G01_UniqueTier(),
            new G02_LegalIdentity_1.G02_LegalIdentity(),
            new G03_ValidRoles_1.G03_ValidRoles(),
            new G04_DocumentDriven_1.G04_DocumentDriven(),
            new G05_DocumentState_1.G05_DocumentState(),
            new G06_TierStatus_1.G06_TierStatus(),
            new G07_AppendOnly_1.G07_AppendOnly(),
            new G08_TenantIsolation_1.G08_TenantIsolation(),
            new G09_ActorRequired_1.G09_ActorRequired(),
            new G10_NoFinancialLogic_1.G10_NoFinancialLogic()
        ];
    }
    validate(context) {
        for (const invariant of this.invariants) {
            invariant.validate(context);
        }
    }
}
exports.TierGuardian = TierGuardian;
