export interface ApiRequest {
    tenantId: string;
    params?: Record<string, string>;
    query?: Record<string, string>;
}
export interface ApiResponse<T> {
    status: number;
    body: T;
}
//# sourceMappingURL=types.d.ts.map