import {
  CapTableCurrentRow,
  CapTableHistoryRow,
  GovernanceAssemblyRow,
  GovernanceDocumentRow,
  InvestorAccessLogRow,
  InvestorAccessRightsRow,
  InvestorReportRow,
  ShareholderRow,
} from './types';

const PERIOD_PATTERN = /^\d{4}-Q[1-4]$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === 'string' && value.trim().length > 0;
}

function isFiniteNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value);
}

function isValidIsoDate(value: unknown): value is string {
  return isNonEmptyString(value) && !Number.isNaN(Date.parse(value));
}

function isValidPeriod(value: unknown): value is string {
  return isNonEmptyString(value) && PERIOD_PATTERN.test(value);
}

export function sanitizeShareholders(rows: unknown[]): ShareholderRow[] {
  return rows.filter((row): row is ShareholderRow => {
    const candidate = row as ShareholderRow;
    return (
      isNonEmptyString(candidate?.shareholder_id) &&
      isNonEmptyString(candidate?.name) &&
      isValidIsoDate(candidate?.created_at)
    );
  });
}

export function sanitizeCapTableCurrent(rows: unknown[]): CapTableCurrentRow[] {
  return rows.filter((row): row is CapTableCurrentRow => {
    const candidate = row as CapTableCurrentRow;
    return (
      isNonEmptyString(candidate?.shareholder_id) &&
      isFiniteNumber(candidate?.shares) &&
      candidate.shares >= 0 &&
      isFiniteNumber(candidate?.percentage) &&
      candidate.percentage >= 0 &&
      candidate.percentage <= 100 &&
      isValidIsoDate(candidate?.last_updated_at)
    );
  });
}

export function sanitizeCapTableHistory(rows: unknown[]): CapTableHistoryRow[] {
  return rows.filter((row): row is CapTableHistoryRow => {
    const candidate = row as CapTableHistoryRow;
    return (
      isNonEmptyString(candidate?.shareholder_id) &&
      isFiniteNumber(candidate?.shares) &&
      candidate.shares >= 0 &&
      isFiniteNumber(candidate?.percentage) &&
      candidate.percentage >= 0 &&
      candidate.percentage <= 100 &&
      isValidIsoDate(candidate?.occurred_at)
    );
  });
}

export function sanitizeGovernanceAssemblies(rows: unknown[]): GovernanceAssemblyRow[] {
  return rows.filter((row): row is GovernanceAssemblyRow => {
    const candidate = row as GovernanceAssemblyRow;
    return (
      isNonEmptyString(candidate?.assembly_id) &&
      isNonEmptyString(candidate?.assembly_type) &&
      isValidIsoDate(candidate?.assembly_date) &&
      isValidIsoDate(candidate?.created_at)
    );
  });
}

export function sanitizeGovernanceDocuments(rows: unknown[]): GovernanceDocumentRow[] {
  return rows.filter((row): row is GovernanceDocumentRow => {
    const candidate = row as GovernanceDocumentRow;
    return (
      isNonEmptyString(candidate?.document_id) &&
      isNonEmptyString(candidate?.document_type) &&
      (candidate.linked_assembly_id === null ||
        candidate.linked_assembly_id === undefined ||
        isNonEmptyString(candidate.linked_assembly_id)) &&
      isValidIsoDate(candidate?.created_at)
    );
  });
}

export function sanitizeInvestorReports(rows: unknown[]): InvestorReportRow[] {
  return rows.filter((row): row is InvestorReportRow => {
    const candidate = row as InvestorReportRow;
    return (
      isNonEmptyString(candidate?.report_id) &&
      isValidPeriod(candidate?.period) &&
      isValidIsoDate(candidate?.published_at)
    );
  });
}

export function sanitizeInvestorAccessRights(rows: unknown[]): InvestorAccessRightsRow[] {
  return rows.filter((row): row is InvestorAccessRightsRow => {
    const candidate = row as InvestorAccessRightsRow;
    const scope = (candidate as any)?.scope;
    return (
      isNonEmptyString(scope) &&
      isValidIsoDate(candidate?.granted_at)
    );
  });
}

export function sanitizeInvestorAccessLog(rows: unknown[]): InvestorAccessLogRow[] {
  return rows.filter((row): row is InvestorAccessLogRow => {
    const candidate = row as InvestorAccessLogRow;
    return (
      isNonEmptyString(candidate?.investor_id) &&
      isNonEmptyString(candidate?.resource) &&
      isValidIsoDate(candidate?.accessed_at)
    );
  });
}
