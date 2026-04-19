import { Router } from 'express';
import { CapitalController } from '../controllers/CapitalController';
import { ShareholdersController } from '../controllers/ShareholdersController';
import { GovernanceController } from '../controllers/GovernanceController';
import { ReportingController } from '../controllers/ReportingController';
import { AccessController } from '../controllers/AccessController';

export function createInvestisseursRoutes(db: any): Router {
  const router = Router();
  
  // Controllers
  const capitalController = new CapitalController(db);
  const shareholdersController = new ShareholdersController(db);
  const governanceController = new GovernanceController(db);
  const reportingController = new ReportingController(db);
  const accessController = new AccessController(db);

  // CAPITAL ENDPOINTS
  router.get('/cap-table', capitalController.getCapTable.bind(capitalController));
  router.get('/cap-table/history', capitalController.getCapTableHistory.bind(capitalController));

  // SHAREHOLDERS ENDPOINTS
  router.get('/shareholders', shareholdersController.getShareholders.bind(shareholdersController));

  // GOVERNANCE ENDPOINTS
  router.get('/assemblies', governanceController.getAssemblies.bind(governanceController));
  router.get('/documents', governanceController.getDocuments.bind(governanceController));

  // REPORTING ENDPOINTS
  router.get('/reports', reportingController.getReports.bind(reportingController));
  router.get('/reports/:reportId', reportingController.getReportById.bind(reportingController));

  // ACCESS & AUDIT ENDPOINTS
  router.get('/access-rights', accessController.getAccessRights.bind(accessController));
  router.get('/access-log', accessController.getAccessLog.bind(accessController));

  return router;
}
