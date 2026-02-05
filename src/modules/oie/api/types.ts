export interface ApiRequest {
  headers: Record<string, string | undefined>;
  params: Record<string, string | undefined>;
  query: Record<string, string | undefined>;
}

export interface ApiResponse<T = unknown> {
  status: number;
  body: T;
}

export const extractTenantId = (req: ApiRequest): string => {
  const tenantId = req.headers['x-tenant-id'];
  if (!tenantId) {
    throw new Error('Missing X-Tenant-Id header');
  }
  return tenantId;
};