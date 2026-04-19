import { Request } from 'express';

// Extend Express Request interface to include user from auth middleware
export interface AuthenticatedRequest extends Request {
  user?: {
    investorId?: string;
    role?: string;
    tenantId?: string;
    scopes?: string[];
  };
}

// Database row types for type safety
export interface ShareholderRow {
  shareholder_id: string;
  name: string;
  created_at: string;
}

export interface CapTableCurrentRow {
  shareholder_id: string;
  shares: number;
  percentage: number;
  last_updated_at: string;
}

export interface CapTableHistoryRow {
  shareholder_id: string;
  shares: number;
  percentage: number;
  occurred_at: string;
}

export interface GovernanceAssemblyRow {
  assembly_id: string;
  assembly_type: string;
  assembly_date: string;
  created_at: string;
}

export interface GovernanceDocumentRow {
  document_id: string;
  document_type: string;
  linked_assembly_id: string | null;
  created_at: string;
}

export interface InvestorReportRow {
  report_id: string;
  period: string;
  published_at: string;
}

export interface InvestorAccessRightsRow {
  scope: string[];
  granted_at: string;
}

export interface InvestorAccessLogRow {
  investor_id: string;
  resource: string;
  accessed_at: string;
}
