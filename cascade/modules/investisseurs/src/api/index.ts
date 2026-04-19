import { Router } from 'express';
import { createInvestisseursRoutes } from './routes/investisseurs.routes';

export interface InvestisseursApiConfig {
  db: any;
  // Event bus for audit events (optional)
  eventBus?: any;
}

export function createInvestisseursApi(config: InvestisseursApiConfig): Router {
  const { db } = config;

  // Create main router
  const apiRouter = Router();

  // Add security headers first so every response carries compliance metadata.
  apiRouter.use('/api/investisseurs', (req, res, next) => {
    res.setHeader('X-API-Read-Only', 'true');
    res.setHeader('X-API-Version', '1.0.0');
    res.setHeader('X-SPOFE-Compliant', 'true');
    next();
  });

  // Add middleware to block forbidden methods
  apiRouter.use('/api/investisseurs', (req, res, next) => {
    const forbiddenMethods = ['POST', 'PUT', 'DELETE', 'PATCH'];

    if (forbiddenMethods.includes(req.method)) {
      return res.status(403).json({
        error: 'Method not allowed. Investisseurs API is read-only.',
        violation: 'FORBIDDEN_WRITE_OPERATION'
      });
    }

    next();
  });

  // Mount investisseurs routes after shared protections.
  apiRouter.use('/api/investisseurs', createInvestisseursRoutes(db));

  return apiRouter;
}

export default createInvestisseursApi;
