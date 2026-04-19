import { Router } from 'express';
import { DashboardController } from '../controllers/DashboardController';

export const dashboardRoutes = Router();

dashboardRoutes.get(
  '/coaching/dashboard',
  DashboardController.getDashboard
);
