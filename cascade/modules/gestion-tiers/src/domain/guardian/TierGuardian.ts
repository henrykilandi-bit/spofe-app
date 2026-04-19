import { GuardianContext } from './GuardianContext';
import { G01_UniqueTier } from './invariants/G01_UniqueTier';
import { G02_LegalIdentity } from './invariants/G02_LegalIdentity';
import { G03_ValidRoles } from './invariants/G03_ValidRoles';
import { G04_DocumentDriven } from './invariants/G04_DocumentDriven';
import { G05_DocumentState } from './invariants/G05_DocumentState';
import { G06_TierStatus } from './invariants/G06_TierStatus';
import { G07_AppendOnly } from './invariants/G07_AppendOnly';
import { G08_TenantIsolation } from './invariants/G08_TenantIsolation';
import { G09_ActorRequired } from './invariants/G09_ActorRequired';
import { G10_NoFinancialLogic } from './invariants/G10_NoFinancialLogic';

export class TierGuardian {
  private readonly invariants = [
    new G01_UniqueTier(),
    new G02_LegalIdentity(),
    new G03_ValidRoles(),
    new G04_DocumentDriven(),
    new G05_DocumentState(),
    new G06_TierStatus(),
    new G07_AppendOnly(),
    new G08_TenantIsolation(),
    new G09_ActorRequired(),
    new G10_NoFinancialLogic()
  ];

  validate(context: GuardianContext): void {
    for (const invariant of this.invariants) {
      invariant.validate(context);
    }
  }
}