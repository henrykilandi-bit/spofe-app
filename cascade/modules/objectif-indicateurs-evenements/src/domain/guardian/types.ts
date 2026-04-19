/**
 * 🛡️ MODULE OIE — GUARDIAN TYPES (v1.0.0)
 * Types pour le Guardian SPOFE - Protection constitutionnelle
 */

export interface GuardianContext {
  readonly tenantId: string;
  readonly actorId: string;
  readonly occurredAt: string;
  readonly correlationId?: string;
}

export interface GuardianValidation {
  readonly invariant: string;
  readonly isValid: boolean;
  readonly reason?: string;
}

export interface GuardianCommand {
  readonly commandType: string;
  readonly tenantId: string;
  readonly [key: string]: unknown;
}

export interface GuardianEvent {
  readonly eventType: string;
  readonly tenantId: string;
  readonly [key: string]: unknown;
}
