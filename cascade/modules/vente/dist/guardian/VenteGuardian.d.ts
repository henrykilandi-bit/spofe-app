import { ActorContext } from './context';
/**
 * Guardian Vente v1.0.0
 * Rôle : garantir l'intégrité documentaire du module Vente
 */
export declare class VenteGuardian {
    private static assertActor;
    private static assertTenantIsolation;
    private static forbidExternalSource;
    private static forbidRetroactiveMutation;
    static guardCreateQuote(cmd: {
        tenantId: string;
        source: string;
        actor: ActorContext;
    }): void;
    static guardValidateQuote(cmd: {
        quoteStatus: string;
        actor: ActorContext;
    }): void;
    static guardCreateOrder(cmd: {
        tenantId: string;
        quoteValidated: boolean;
        actor: ActorContext;
    }): void;
    static guardValidateOrder(cmd: {
        orderStatus: string;
        actor: ActorContext;
    }): void;
    static guardCreateDeliveryNote(cmd: {
        tenantId: string;
        orderValidated: boolean;
        actor: ActorContext;
    }): void;
    static guardValidateDeliveryNote(cmd: {
        deliveryStatus: string;
        actor: ActorContext;
    }): void;
    static guardCreateInvoice(cmd: {
        tenantId: string;
        hasDeliveryOrOrder: boolean;
        actor: ActorContext;
    }): void;
    static guardValidateInvoice(cmd: {
        invoiceStatus: string;
        actor: ActorContext;
    }): void;
    static forbidEconomicLogic(payload: Record<string, any>): void;
    static forbidCrossModuleWrite(targetModule?: string): void;
}
//# sourceMappingURL=VenteGuardian.d.ts.map