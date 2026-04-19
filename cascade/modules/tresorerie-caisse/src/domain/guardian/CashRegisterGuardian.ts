/**
 * CashRegisterGuardian — Guardian Trésorerie Caisse
 * SPOFE P0 — Gouvernance constitutionnelle
 * 
 * Invariants: G01 → G12
 * - G01: Existence caisse valide
 * - G02: Ouverture préalable obligatoire
 * - G03: Unicité de l'ouverture par période
 * - G04: Document électronique obligatoire et signé
 * - G05: Identification de l'acteur
 * - G06: Séquentialité des opérations
 * - G07: Période clôturée verrouillée
 * - G08: Typologie valide des mouvements
 * - G09: Constat d'écart uniquement à la clôture
 * - G10: Isolation stricte par tenant
 * - G11: Immutabilité post-signature
 * - G12: Aucune logique comptable
 */

/**
 * GuardianError - Exception standard pour violations Guardian
 */
export class GuardianError extends Error {
  constructor(
    public readonly code: string,
    message?: string,
    public readonly metadata?: any
  ) {
    super(message || `Guardian violation: ${code}`);
    this.name = 'GuardianError';
  }
}

export class CashRegisterGuardian {
  /**
   * G01 — Existence d'une caisse valide
   */
  assertCashRegisterExists(ctx: { exists: boolean }): void {
    if (!ctx.exists) {
      throw new GuardianError(
        "G01_CASH_REGISTER_NOT_FOUND",
        "Caisse inexistante ou invalide"
      );
    }
  }

  /**
   * G02 — Ouverture préalable obligatoire
   */
  assertCashRegisterOpen(ctx: { isOpen: boolean }): void {
    if (!ctx.isOpen) {
      throw new GuardianError(
        "G02_CASH_REGISTER_NOT_OPEN",
        "La caisse n'est pas ouverte"
      );
    }
  }

  /**
   * G03 — Unicité de l'ouverture par période
   */
  assertNoActiveOpening(ctx: { hasActiveOpening: boolean }): void {
    if (ctx.hasActiveOpening) {
      throw new GuardianError(
        "G03_ALREADY_OPEN",
        "Une ouverture de caisse est déjà active"
      );
    }
  }

  /**
   * G04 — Document électronique obligatoire et signé
   */
  assertSignedDocument(ctx: { status: string }): void {
    if (ctx.status !== "SIGNED") {
      throw new GuardianError(
        "G04_DOCUMENT_NOT_SIGNED",
        "Le document doit être signé (status=SIGNED)"
      );
    }
  }

  /**
   * G05 — Identification de l'acteur
   */
  assertActorIdentified(ctx: { actorId: string | undefined }): void {
    if (!ctx.actorId) {
      throw new GuardianError(
        "G05_ACTOR_NOT_IDENTIFIED",
        "L'acteur doit être identifié (actorId requis)"
      );
    }
  }

  /**
   * G06 — Séquentialité des opérations
   */
  assertBeforeClosure(ctx: { isClosed: boolean }): void {
    if (ctx.isClosed) {
      throw new GuardianError(
        "G06_CASH_REGISTER_CLOSED",
        "Aucun mouvement autorisé après clôture"
      );
    }
  }

  /**
   * G07 — Période clôturée verrouillée
   */
  assertPeriodNotLocked(ctx: { locked: boolean }): void {
    if (ctx.locked) {
      throw new GuardianError(
        "G07_PERIOD_LOCKED",
        "La période est verrouillée, aucune modification autorisée"
      );
    }
  }

  /**
   * G08 — Typologie valide des mouvements
   */
  assertValidMovement(ctx: { type: "IN" | "OUT"; amount: number }): void {
    if (ctx.amount <= 0) {
      throw new GuardianError(
        "G08_INVALID_MOVEMENT",
        "Le montant doit être strictement positif"
      );
    }
    if (ctx.type !== "IN" && ctx.type !== "OUT") {
      throw new GuardianError(
        "G08_INVALID_MOVEMENT_TYPE",
        "Le type de mouvement doit être IN ou OUT"
      );
    }
  }

  /**
   * G09 — Constat d'écart uniquement à la clôture
   */
  assertDiscrepancyAtClosure(ctx: { atClosure: boolean }): void {
    if (!ctx.atClosure) {
      throw new GuardianError(
        "G09_DISCREPANCY_NOT_AT_CLOSURE",
        "Un écart ne peut être constaté qu'à la clôture"
      );
    }
  }

  /**
   * G10 — Isolation stricte par tenant
   */
  assertSameTenant(ctx: { tenantId: string; documentTenantId: string }): void {
    if (ctx.tenantId !== ctx.documentTenantId) {
      throw new GuardianError(
        "G10_CROSS_TENANT_VIOLATION",
        "Violation d'isolation tenant"
      );
    }
  }

  /**
   * G11 — Immutabilité post-signature
   */
  assertImmutable(ctx: { signed: boolean; mutationAttempt: boolean }): void {
    if (ctx.signed && ctx.mutationAttempt) {
      throw new GuardianError(
        "G11_IMMUTABILITY_VIOLATION",
        "Un document signé ne peut pas être modifié"
      );
    }
  }

  /**
   * G12 — Aucune logique comptable
   */
  assertNoAccountingLogic(ctx: { hasAccountingData: boolean }): void {
    if (ctx.hasAccountingData) {
      throw new GuardianError(
        "G12_ACCOUNTING_FORBIDDEN",
        "Aucune logique comptable n'est autorisée dans ce module"
      );
    }
  }
}
