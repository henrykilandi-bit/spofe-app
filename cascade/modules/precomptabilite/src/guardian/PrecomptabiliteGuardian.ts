// src/guardian/PrecomptabiliteGuardian.ts

import { GuardianError } from './GuardianError';
import {
  GuardianContext,
  PrecomptabiliteCommand,
  DocumentStatus,
} from './types';

export class PrecomptabiliteGuardian {
  validate(ctx: GuardianContext, cmd: PrecomptabiliteCommand): void {
    this.assertTenantIsolation(ctx, cmd);        // P-01
    this.assertActor(ctx);                       // P-02
    this.assertDocumentIdentity(cmd);            // P-03
    this.assertAppendOnly(cmd);                  // P-04
    this.assertWorkflow(cmd);                    // P-05, P-06
    this.assertFactOnlyFields(cmd);              // P-07
    this.assertNoForbiddenLogic(cmd);             // P-08..P-10
    this.assertTraceability(cmd);                // P-11
  }

  // ---------------- Invariants ----------------

  private assertTenantIsolation(
    ctx: GuardianContext,
    cmd: PrecomptabiliteCommand
  ) {
    if (ctx.tenantId !== cmd.tenantId) {
      throw new GuardianError('P-01: Cross-tenant command rejected');
    }
  }

  private assertActor(ctx: GuardianContext) {
    if (!ctx.actorId) {
      throw new GuardianError('P-02: actorId is mandatory');
    }
  }

  private assertDocumentIdentity(cmd: PrecomptabiliteCommand) {
    if (!cmd.documentId) {
      throw new GuardianError('P-03: documentId is mandatory');
    }

    if (cmd.commandType === 'CREATE_DOCUMENT' && !cmd.documentType) {
      throw new GuardianError(
        'P-03: documentType is required on creation'
      );
    }
  }

  private assertAppendOnly(cmd: PrecomptabiliteCommand) {
    if (!cmd.commandId) {
      throw new GuardianError('P-04: commandId required (append-only)');
    }
  }

  private assertWorkflow(cmd: PrecomptabiliteCommand) {
    const status = cmd.status as DocumentStatus | undefined;

    if (cmd.commandType === 'SUBMIT_FOR_VALIDATION' && status !== 'DRAFT') {
      throw new GuardianError(
        'P-06: Only DRAFT document can be submitted'
      );
    }

    if (cmd.commandType === 'VALIDATE_DOCUMENT' && status !== 'SUBMITTED') {
      throw new GuardianError(
        'P-06: Only SUBMITTED document can be validated'
      );
    }

    if (cmd.commandType === 'REJECT_DOCUMENT' && status !== 'SUBMITTED') {
      throw new GuardianError(
        'P-06: Only SUBMITTED document can be rejected'
      );
    }

    if (cmd.commandType === 'SUSPEND_DOCUMENT' && status === 'VALIDATED') {
      throw new GuardianError(
        'P-06: VALIDATED document cannot be suspended'
      );
    }
  }

  private assertFactOnlyFields(cmd: PrecomptabiliteCommand) {
    if (cmd.commandType === 'UPDATE_METADATA') {
      const reference = cmd.metadata?.reference?.trim();
      if (!reference) {
        throw new GuardianError(
          'P-07: Third-party reference is mandatory on metadata update'
        );
      }
    }

    if (cmd.metadata) {
      if (
        cmd.metadata.amount !== undefined &&
        cmd.metadata.amount <= 0
      ) {
        throw new GuardianError(
          'P-07: Document amount must be > 0'
        );
      }
    }
  }

  private assertNoForbiddenLogic(cmd: PrecomptabiliteCommand) {
    const forbidden = [
      'accountingEntry',
      'journal',
      'taxCalculation',
      'paymentOrder',
      'decision',
      'autoApproval',
    ];

    forbidden.forEach(f => {
      if ((cmd as any)[f] !== undefined) {
        throw new GuardianError(
          'P-08..P-10: Forbidden logic detected in Precomptabilite'
        );
      }
    });
  }

  private assertTraceability(cmd: PrecomptabiliteCommand) {
    if (!cmd.commandType) {
      throw new GuardianError('P-11: commandType required');
    }
  }
}
