import { GuardianError } from './errors';
import { ActorContext } from './context';

/**
 * Guardian Vente v1.0.0
 * Rôle : garantir l'intégrité documentaire du module Vente
 */
export class VenteGuardian {
  /* =========================
     OUTILS INTERNES
     ========================= */

  private static assertActor(actor: ActorContext) {
    if (!actor || !actor.actorId) {
      throw new GuardianError("ACTOR_REQUIRED");
    }
  }

  private static assertTenantIsolation(tenantId: string, actor: ActorContext) {
    if (actor.tenantId !== tenantId) {
      throw new GuardianError("CROSS_TENANT_FORBIDDEN");
    }
  }

  private static forbidExternalSource(source?: string) {
    if (source && source !== "SPOFE_INTERNAL") {
      throw new GuardianError("EXTERNAL_DOCUMENT_FORBIDDEN");
    }
  }

  private static forbidRetroactiveMutation(isImmutable: boolean) {
    if (!isImmutable) {
      throw new GuardianError("HISTORY_MUTATION_FORBIDDEN");
    }
  }

  /* =========================
     COMMAND GUARDS
     ========================= */

  static guardCreateQuote(cmd: {
    tenantId: string;
    source: string;
    actor: ActorContext;
  }) {
    this.assertActor(cmd.actor);
    this.assertTenantIsolation(cmd.tenantId, cmd.actor);
    this.forbidExternalSource(cmd.source);
  }

  static guardValidateQuote(cmd: {
    quoteStatus: string;
    actor: ActorContext;
  }) {
    this.assertActor(cmd.actor);

    if (cmd.quoteStatus !== "DRAFT") {
      throw new GuardianError("INVALID_QUOTE_STATE_TRANSITION");
    }
  }

  static guardCreateOrder(cmd: {
    tenantId: string;
    quoteValidated: boolean;
    actor: ActorContext;
  }) {
    this.assertActor(cmd.actor);
    this.assertTenantIsolation(cmd.tenantId, cmd.actor);

    if (!cmd.quoteValidated) {
      throw new GuardianError("ORDER_REQUIRES_VALIDATED_QUOTE");
    }
  }

  static guardValidateOrder(cmd: {
    orderStatus: string;
    actor: ActorContext;
  }) {
    this.assertActor(cmd.actor);

    if (cmd.orderStatus !== "DRAFT") {
      throw new GuardianError("INVALID_ORDER_STATE_TRANSITION");
    }
  }

  static guardCreateDeliveryNote(cmd: {
    tenantId: string;
    orderValidated: boolean;
    actor: ActorContext;
  }) {
    this.assertActor(cmd.actor);
    this.assertTenantIsolation(cmd.tenantId, cmd.actor);

    if (!cmd.orderValidated) {
      throw new GuardianError("DELIVERY_REQUIRES_VALIDATED_ORDER");
    }
  }

  static guardValidateDeliveryNote(cmd: {
    deliveryStatus: string;
    actor: ActorContext;
  }) {
    this.assertActor(cmd.actor);

    if (cmd.deliveryStatus !== "DRAFT") {
      throw new GuardianError("INVALID_DELIVERY_STATE_TRANSITION");
    }
  }

  static guardCreateInvoice(cmd: {
    tenantId: string;
    hasDeliveryOrOrder: boolean;
    actor: ActorContext;
  }) {
    this.assertActor(cmd.actor);
    this.assertTenantIsolation(cmd.tenantId, cmd.actor);

    if (!cmd.hasDeliveryOrOrder) {
      throw new GuardianError("INVOICE_REQUIRES_ORDER_OR_DELIVERY");
    }
  }

  static guardValidateInvoice(cmd: {
    invoiceStatus: string;
    actor: ActorContext;
  }) {
    this.assertActor(cmd.actor);

    if (cmd.invoiceStatus !== "DRAFT") {
      throw new GuardianError("INVALID_INVOICE_STATE_TRANSITION");
    }
  }

  /* =========================
     GLOBAL DERIVE GUARDS
     ========================= */

  static forbidEconomicLogic(payload: Record<string, any>) {
    const forbiddenFields = [
      "margin",
      "cost",
      "vat",
      "profit",
      "pricingRule",
      "simulation",
    ];

    forbiddenFields.forEach((field) => {
      if (payload[field] !== undefined) {
        throw new GuardianError("ECONOMIC_LOGIC_FORBIDDEN_IN_VENTE");
      }
    });
  }

  static forbidCrossModuleWrite(targetModule?: string) {
    if (targetModule) {
      throw new GuardianError("INTER_MODULE_WRITE_FORBIDDEN");
    }
  }
}
