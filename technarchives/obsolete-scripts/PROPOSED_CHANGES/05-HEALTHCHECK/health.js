// Health check endpoint for monitoring
import express from 'express';
import { checkDatabaseHealth } from '../config/database.js';
import os from 'os';

const router = express.Router();

/**
 * GET /health - Endpoint de monitoring
 * Retourne le status de santé de l'application
 */
router.get('/health', async (req, res) => {
  const dbHealth = await checkDatabaseHealth();
  
  const health = {
    status: dbHealth.status === 'healthy' ? 'ok' : 'degraded',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(), // Secondes depuis démarrage
    database: dbHealth,
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024), // MB
      total: Math.round(os.totalmem() / 1024 / 1024),                 // MB
      free: Math.round(os.freemem() / 1024 / 1024)                    // MB
    },
    cpu: os.loadavg() // Load average [1min, 5min, 15min]
  };
  
  const statusCode = health.status === 'ok' ? 200 : 503;
  res.status(statusCode).json(health);
});

export default router;
