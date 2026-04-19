/**
 * TresoconsolidationGuardianErrors.ts
 * Erreurs Guardian P0 — Module Tresoconsolidation
 *
 * @module tresoconsolidation
 * @layer guardian
 * @governance SPOFE P0
 */

export class GuardianViolation extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'GuardianViolation';
  }
}

export class ReadOnlyViolation extends GuardianViolation {
  constructor(message: string = 'Read-only violation') {
    super(message);
    this.name = 'ReadOnlyViolation';
  }
}

export class UnauthorizedSourceViolation extends GuardianViolation {
  constructor(message: string = 'Unauthorized source') {
    super(message);
    this.name = 'UnauthorizedSourceViolation';
  }
}

export class WriteLayerAccessViolation extends GuardianViolation {
  constructor(message: string = 'Write layer access violation') {
    super(message);
    this.name = 'WriteLayerAccessViolation';
  }
}

export class TenantIsolationViolation extends GuardianViolation {
  constructor(message: string = 'Tenant isolation violation') {
    super(message);
    this.name = 'TenantIsolationViolation';
  }
}

export class BusinessLogicViolation extends GuardianViolation {
  constructor(message: string = 'Business logic detected') {
    super(message);
    this.name = 'BusinessLogicViolation';
  }
}

export class AccountingLogicViolation extends GuardianViolation {
  constructor(message: string = 'Accounting logic detected') {
    super(message);
    this.name = 'AccountingLogicViolation';
  }
}

export class UncertifiedSourceViolation extends GuardianViolation {
  constructor(message: string = 'Uncertified source') {
    super(message);
    this.name = 'UncertifiedSourceViolation';
  }
}

export class InvalidSourceViolation extends GuardianViolation {
  constructor(message: string = 'Invalid source') {
    super(message);
    this.name = 'InvalidSourceViolation';
  }
}

export class MethodNotAllowedViolation extends GuardianViolation {
  constructor(message: string = 'Method not allowed') {
    super(message);
    this.name = 'MethodNotAllowedViolation';
  }
}
