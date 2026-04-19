export interface SalesOrderRM {
    tenantId: string;
    orderId: string;
    quoteId: string;
    status: "DRAFT" | "VALIDATED";
    createdAt: string;
    validatedAt?: string;
}
//# sourceMappingURL=SalesOrderRM.d.ts.map