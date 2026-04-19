import express from 'express';
import { createInvestisseursApi } from '../../src/api';

const investorReportsByTenant: Record<string, Array<{ report_id: string; period: string; published_at: string }>> = {
  'tenant-A': [
    { report_id: 'rep-001', period: '2025-Q4', published_at: '2026-01-15T10:00:00.000Z' },
    { report_id: 'rep-002', period: '2025-Q3', published_at: '2025-10-15T10:00:00.000Z' }
  ],
  'tenant-B': [
    { report_id: 'rep-101', period: '2025-Q4', published_at: '2026-01-12T10:00:00.000Z' }
  ]
};

function getReportsForTenant(tenantId: string) {
  return investorReportsByTenant[tenantId] ?? [];
}

// Mock database for testing
const mockDb = {
  query: jest.fn().mockImplementation(async (query: string, params: any[] = []) => {
    if (query.includes('FROM investor_reports') && query.includes('AND report_id = $2')) {
      const [tenantId, reportId] = params;
      const report = getReportsForTenant(tenantId).find(entry => entry.report_id === reportId);
      return { rows: report ? [report] : [] };
    }

    if (query.includes('FROM investor_reports')) {
      const [tenantId] = params;
      return { rows: getReportsForTenant(tenantId) };
    }

    return { rows: [] };
  })
};

// Create test Express app with investisseurs routes
export const app = express();

// Middleware to parse JSON
app.use(express.json());

// Mock authentication middleware
app.use((req, res, next) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    
    // Mock user based on token
    if (token.includes('investor-A')) {
      (req as any).user = {
        investorId: 'investor-A',
        role: 'INVESTOR',
        tenantId: 'tenant-A',
        scopes: ['REPORTS_READ']
      };
    } else if (token.includes('investor-B')) {
      (req as any).user = {
        investorId: 'investor-B',
        role: 'INVESTOR',
        tenantId: 'tenant-B',
        scopes: ['REPORTS_READ']
      };
    } else if (token.includes('coach-A')) {
      (req as any).user = { role: 'COACH', tenantId: 'tenant-A' };
    } else if (token.includes('coach-B')) {
      (req as any).user = { role: 'COACH', tenantId: 'tenant-B' };
    } else if (token.includes('entrepreneur-A')) {
      (req as any).user = { role: 'ENTREPRENEUR', tenantId: 'tenant-A' };
    } else if (token.includes('entrepreneur-B')) {
      (req as any).user = { role: 'ENTREPRENEUR', tenantId: 'tenant-B' };
    } else if (token.includes('without-scope')) {
      (req as any).user = {
        investorId: 'investor-without-scope',
        role: 'INVESTOR',
        tenantId: 'tenant-A',
        scopes: []
      };
    } else if (token.includes('unauthorized')) {
      (req as any).user = { role: 'UNAUTHORIZED', tenantId: 'tenant-A' };
    } else {
      return res.status(401).json({ error: 'Invalid token' });
    }
  } else {
    return res.status(401).json({ error: 'Missing authorization header' });
  }
  next();
});

// Setup investisseurs API routes
const investisseursApi = createInvestisseursApi({ db: mockDb });
app.use(investisseursApi);

// Error handling middleware
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  res.status(500).json({ error: 'Internal server error' });
});

export default app;
