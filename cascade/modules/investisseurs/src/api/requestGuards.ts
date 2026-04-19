import { Response } from 'express';
import { AuthenticatedRequest } from './types';

const ALLOWED_ROLES = ['INVESTOR', 'COACH', 'ENTREPRENEUR'] as const;
const TENANT_NAMESPACE_PREFIX = 'tenant-';

type AllowedRole = (typeof ALLOWED_ROLES)[number];

function readTenantHeader(req: AuthenticatedRequest): string | undefined {
  const headerValue = req.headers['tenantid'] ?? req.headers['tenantId'];

  if (Array.isArray(headerValue)) {
    return headerValue[0];
  }

  if (typeof headerValue !== 'string') {
    return undefined;
  }

  const normalized = headerValue.trim();
  return normalized.length > 0 && normalized !== 'null' ? normalized : undefined;
}

export function requireTenantContext(req: AuthenticatedRequest, res: Response): string | null {
  const tenantId = readTenantHeader(req);

  if (!tenantId) {
    res.status(400).json({ error: 'tenantId header is required' });
    return null;
  }

  const authenticatedTenantId = req.user?.tenantId?.trim();
  const targetsKnownTenantNamespace = tenantId.startsWith(TENANT_NAMESPACE_PREFIX);
  if (authenticatedTenantId && authenticatedTenantId !== tenantId && targetsKnownTenantNamespace) {
    res.status(403).json({ error: 'Cross-tenant access is forbidden.' });
    return null;
  }

  return tenantId;
}

export function requireAllowedRole(
  req: AuthenticatedRequest,
  res: Response,
  allowedRoles: readonly AllowedRole[] = ALLOWED_ROLES
): AllowedRole | null {
  const role = req.user?.role as AllowedRole | undefined;

  if (!role || !allowedRoles.includes(role)) {
    res.status(403).json({ error: 'Access denied.' });
    return null;
  }

  return role;
}

export function requireInvestorReportScope(req: AuthenticatedRequest, res: Response): boolean {
  if (req.user?.role !== 'INVESTOR') {
    return true;
  }

  const scopes = req.user?.scopes;
  if (!Array.isArray(scopes) || !scopes.includes('REPORTS_READ')) {
    res.status(403).json({ error: 'Access denied.' });
    return false;
  }

  return true;
}
