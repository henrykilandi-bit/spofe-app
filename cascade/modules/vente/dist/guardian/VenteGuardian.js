import { GuardianError } from './errors';
/**
 * Guardian Vente v1.0.0
 * Rôle : garantir l'intégrité documentaire du module Vente
 */
export class VenteGuardian {
    /* =========================
       OUTILS INTERNES
       ========================= */
    static assertActor(actor) {
        if (!actor || !actor.actorId) {
            throw new GuardianError("ACTOR_REQUIRED");
        }
    }
    static assertTenantIsolation(tenantId, actor) {
        if (actor.tenantId !== tenantId) {
            throw new GuardianError("CROSS_TENANT_FORBIDDEN");
        }
    }
    static forbidExternalSource(source) {
        if (source && source !== "SPOFE_INTERNAL") {
            throw new GuardianError("EXTERNAL_DOCUMENT_FORBIDDEN");
        }
    }
    static forbidRetroactiveMutation(isImmutable) {
        if (!isImmutable) {
            throw new GuardianError("HISTORY_MUTATION_FORBIDDEN");
        }
    }
    /* =========================
       COMMAND GUARDS
       ========================= */
    static guardCreateQuote(cmd) {
        this.assertActor(cmd.actor);
        this.assertTenantIsolation(cmd.tenantId, cmd.actor);
        this.forbidExternalSource(cmd.source);
    }
    static guardValidateQuote(cmd) {
        this.assertActor(cmd.actor);
        if (cmd.quoteStatus !== "DRAFT") {
            throw new GuardianError("INVALID_QUOTE_STATE_TRANSITION");
        }
    }
    static guardCreateOrder(cmd) {
        this.assertActor(cmd.actor);
        this.assertTenantIsolation(cmd.tenantId, cmd.actor);
        if (!cmd.quoteValidated) {
            throw new GuardianError("ORDER_REQUIRES_VALIDATED_QUOTE");
        }
    }
    static guardValidateOrder(cmd) {
        this.assertActor(cmd.actor);
        if (cmd.orderStatus !== "DRAFT") {
            throw new GuardianError("INVALID_ORDER_STATE_TRANSITION");
        }
    }
    static guardCreateDeliveryNote(cmd) {
        this.assertActor(cmd.actor);
        this.assertTenantIsolation(cmd.tenantId, cmd.actor);
        if (!cmd.orderValidated) {
            throw new GuardianError("DELIVERY_REQUIRES_VALIDATED_ORDER");
        }
    }
    static guardValidateDeliveryNote(cmd) {
        this.assertActor(cmd.actor);
        if (cmd.deliveryStatus !== "DRAFT") {
            throw new GuardianError("INVALID_DELIVERY_STATE_TRANSITION");
        }
    }
    static guardCreateInvoice(cmd) {
        this.assertActor(cmd.actor);
        this.assertTenantIsolation(cmd.tenantId, cmd.actor);
        if (!cmd.hasDeliveryOrOrder) {
            throw new GuardianError("INVOICE_REQUIRES_ORDER_OR_DELIVERY");
        }
    }
    static guardValidateInvoice(cmd) {
        this.assertActor(cmd.actor);
        if (cmd.invoiceStatus !== "DRAFT") {
            throw new GuardianError("INVALID_INVOICE_STATE_TRANSITION");
        }
    }
    /* =========================
       GLOBAL DERIVE GUARDS
       ========================= */
    static forbidEconomicLogic(payload) {
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
    static forbidCrossModuleWrite(targetModule) {
        if (targetModule) {
            throw new GuardianError("INTER_MODULE_WRITE_FORBIDDEN");
        }
    }
}
//# sourceMappingURL=VenteGuardian.js.map