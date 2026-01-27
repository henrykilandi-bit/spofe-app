// src/routes/security.routes.js
import { Router } from 'express';
import { validateProductionReadiness } from '../utils/securityAudit.js';
import { authenticateToken } from '../middleware/auth.middleware.js';
import logger from '../utils/logger.js';

const router = Router();

/**
 * @swagger
 * /api/security/audit:
 *   get:
 *     summary: Effectuer un audit de sécurité
 *     tags: [Security]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Rapport d'audit de sécurité
 */
router.get('/audit', authenticateToken, (req, res) => {
  try {
    const result = validateProductionReadiness();
    
    res.status(200).json({
      success: true,
      isProduction: result.isProduction,
      summary: result.audit.summary,
      checks: result.audit.checks,
      report: result.report
    });

    logger.info('Security audit requested by user', { userId: req.user?.id });
  } catch (error) {
    logger.error('Error during security audit', error);
    res.status(500).json({
      success: false,
      message: 'Error performing security audit'
    });
  }
});

export default router;
