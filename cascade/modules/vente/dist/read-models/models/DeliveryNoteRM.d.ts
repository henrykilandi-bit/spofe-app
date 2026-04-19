export interface DeliveryNoteRM {
    tenantId: string;
    deliveryNoteId: string;
    orderId: string;
    status: "DRAFT" | "VALIDATED";
    deliveredAt?: string;
}
//# sourceMappingURL=DeliveryNoteRM.d.ts.map