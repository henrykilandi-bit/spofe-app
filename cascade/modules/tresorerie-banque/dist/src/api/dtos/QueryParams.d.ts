export interface DateRangeQuery {
    fromDate?: string;
    toDate?: string;
}
export interface BankContextQuery extends DateRangeQuery {
    tenantId: string;
    bankId: string;
    bankAccountId: string;
}
//# sourceMappingURL=QueryParams.d.ts.map