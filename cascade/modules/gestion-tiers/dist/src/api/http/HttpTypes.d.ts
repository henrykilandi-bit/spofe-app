export interface HttpRequest {
    params: Record<string, string | undefined>;
    query: Record<string, string | undefined>;
    tenantId: string;
}
export interface HttpResponse<T = unknown> {
    status: number;
    body: T;
}
//# sourceMappingURL=HttpTypes.d.ts.map